import sqlite3
import sys
from contextlib import closing
from pathlib import Path


FINANCE_TABLES = ('rhp_finance_events', 'rhp_bank_transactions')
SETTINGS = ('tenant_id', 'outstanding_debt_a', 'outstanding_debt_b', 'outstanding_debt_c')


def connect(filename, mode):
    return sqlite3.connect(f'{Path(filename).resolve().as_uri()}?mode={mode}', uri=True, timeout=15)


def check_integrity(db):
    if db.execute('PRAGMA quick_check').fetchall() != [('ok',)]:
        raise RuntimeError('SQLite integrity check failed')


def tables(db, schema):
    return {row[0] for row in db.execute(f"SELECT name FROM {schema}.sqlite_schema WHERE type = 'table'")}


def check_rows(db, exact):
    check_integrity(db)
    before = tables(db, 'previous')
    after = tables(db, 'main')
    required = {*FINANCE_TABLES, 'rhp_memberships'}
    if not required <= before or not before <= after:
        raise RuntimeError('Missing production tables before or after migration')

    for table in FINANCE_TABLES:
        prior_count = db.execute(f'SELECT count(*) FROM previous.{table}').fetchone()[0]
        current_count = db.execute(f'SELECT count(*) FROM main.{table}').fetchone()[0]
        if not prior_count or current_count < prior_count:
            raise RuntimeError(f'Existing financial records lost from {table}')
        if exact:
            columns = [row[1] for row in db.execute(f'PRAGMA previous.table_info({table})')]
            selection = ', '.join('"' + column.replace('"', '""') + '"' for column in columns)
            differences = db.execute(f'SELECT {selection} FROM previous.{table} EXCEPT SELECT {selection} FROM main.{table} LIMIT 1')
            if differences.fetchone():
                raise RuntimeError(f'Existing financial records changed in {table}')

    prior_count = db.execute('SELECT count(*) FROM previous.rhp_memberships').fetchone()[0]
    if db.execute('SELECT count(*) FROM main.rhp_memberships').fetchone()[0] < prior_count:
        raise RuntimeError('Existing membership rows were lost')
    if exact:
        previous_columns = {row[1] for row in db.execute('PRAGMA previous.table_info(rhp_memberships)')}
        for field in SETTINGS:
            if field in previous_columns:
                changed = db.execute(f'''
                    SELECT id FROM previous.rhp_memberships prior
                    WHERE prior.{field} IS NOT NULL AND prior.{field} != '' AND NOT EXISTS (
                        SELECT 1 FROM main.rhp_memberships current
                        WHERE current.id = prior.id AND current.{field} IS prior.{field}
                    ) LIMIT 1
                ''').fetchone()
                if changed:
                    raise RuntimeError(f'Existing member finance setting changed: {field}')


def main():
    operation, source, destination = sys.argv[1:]
    if operation in ('backup', 'restore'):
        mode = 'rwc' if operation == 'backup' else 'rw'
        with closing(connect(source, 'ro')) as origin, closing(connect(destination, mode)) as target:
            check_integrity(origin)
            origin.backup(target)
            check_integrity(target)
        return
    if operation not in ('verify', 'verify-live'):
        raise ValueError('Invalid database operation')
    with closing(connect(destination, 'ro')) as db:
        db.execute('ATTACH DATABASE ? AS previous', (f'{Path(source).resolve().as_uri()}?mode=ro',))
        check_rows(db, exact=operation == 'verify')
    print('RHP_FINANCE_DATABASE_VERIFIED')


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, sqlite3.Error, ValueError) as error:
        sys.exit(str(error))
