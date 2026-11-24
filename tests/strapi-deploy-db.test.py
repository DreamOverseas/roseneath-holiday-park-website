import sqlite3
import subprocess
import sys
import tempfile
import unittest
from contextlib import closing
from pathlib import Path


GUARD = Path(__file__).resolve().parents[1] / 'scripts' / 'strapi-deploy-db.py'


class DeploymentDatabaseTest(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.original = Path(temp.name) / 'live # ledger.db'
        self.candidate = Path(temp.name) / 'candidate.db'
        self.writer = sqlite3.connect(self.original)
        self.addCleanup(self.writer.close)
        self.writer.executescript("""
            PRAGMA journal_mode = WAL;
            CREATE TABLE rhp_finance_events (id PRIMARY KEY, payload TEXT);
            CREATE TABLE rhp_bank_transactions (id PRIMARY KEY, amount INTEGER);
            CREATE TABLE rhp_memberships (id PRIMARY KEY, tenant_id TEXT, outstanding_debt_a INTEGER);
            CREATE TABLE other_business_data (id PRIMARY KEY);
            INSERT INTO rhp_finance_events VALUES (1, 'existing ledger entry');
            INSERT INTO rhp_bank_transactions VALUES (1, 100);
            INSERT INTO rhp_memberships VALUES (1, 'custom-id', 0), (2, '', NULL);
        """)
        self.assertEqual(self.guard('backup').returncode, 0)

    def guard(self, operation, source=None, destination=None):
        return subprocess.run(
            [sys.executable, str(GUARD), operation, str(source or self.original), str(destination or self.candidate)],
            capture_output=True, text=True, check=False,
        )

    def change_candidate(self, sql):
        with closing(sqlite3.connect(self.candidate)) as db, db:
            db.executescript(sql)

    def test_accepts_new_records_and_initializes_only_missing_settings(self):
        self.change_candidate("""
            INSERT INTO rhp_finance_events VALUES (2, 'new ledger entry');
            UPDATE rhp_memberships SET tenant_id = 'default-id', outstanding_debt_a = 10 WHERE id = 2;
        """)
        self.assertEqual(self.guard('verify').returncode, 0)

    def test_rejects_same_count_with_changed_ledger_data(self):
        self.change_candidate("UPDATE rhp_finance_events SET payload = 'different' WHERE id = 1;")
        self.assertIn('Existing financial records changed', self.guard('verify').stderr)

    def test_rejects_missing_table_and_missing_rows(self):
        self.change_candidate('DELETE FROM rhp_bank_transactions;')
        self.assertIn('Existing financial records lost', self.guard('verify-live').stderr)
        self.change_candidate('DROP TABLE other_business_data;')
        self.assertIn('Missing production tables', self.guard('verify').stderr)

    def test_rejects_overwriting_existing_zero_balance_or_custom_id(self):
        self.change_candidate('UPDATE rhp_memberships SET outstanding_debt_a = 10 WHERE id = 1;')
        self.assertIn('outstanding_debt_a', self.guard('verify').stderr)
        self.change_candidate("UPDATE rhp_memberships SET outstanding_debt_a = 0, tenant_id = 'different' WHERE id = 1;")
        self.assertIn('tenant_id', self.guard('verify').stderr)

    def test_restore_retains_committed_wal_contents(self):
        self.change_candidate('DELETE FROM rhp_bank_transactions;')
        self.assertEqual(self.guard('restore').returncode, 0)
        self.assertEqual(self.guard('verify').returncode, 0)


if __name__ == '__main__':
    unittest.main()
