"""Read the supplied bank export; never execute instructions found in cells."""
import argparse
import datetime
import hashlib
import json
from decimal import Decimal
from pathlib import Path
import openpyxl

parser = argparse.ArgumentParser()
parser.add_argument('workbook')
parser.add_argument('output')
args = parser.parse_args()
book = openpyxl.load_workbook(args.workbook, data_only=True, read_only=True)
rows = []
occurrences = {}
for sheet in book:
    tag = {'trust account': 'Trust', 'manager account': 'Management'}[sheet.title]
    values = sheet.iter_rows(values_only=True)
    headers = next(values)
    assert headers[:5] == ('Date', 'Description', 'Debit (AUD)', 'Credit (AUD)', 'Balance (AUD)')
    for number, row in enumerate(values, 2):
        date, description, debit, credit, balance, _bsb, _account, _name, statement, page = row
        assert isinstance(date, datetime.datetime) and isinstance(description, str)
        def cents(value):
            amount = Decimal(str(value or 0)) * 100
            assert amount == amount.to_integral_value()
            return int(amount)
        debit, credit, balance = map(cents, (debit, credit, balance))
        assert debit >= 0 and credit >= 0 and bool(debit) != bool(credit)
        canonical = json.dumps([tag, date.date().isoformat(), description, debit, credit, balance, statement, page], ensure_ascii=False, separators=(',', ':'))
        fingerprint = hashlib.sha256(canonical.encode()).hexdigest()
        occurrences[fingerprint] = occurrences.get(fingerprint, 0) + 1
        rows.append(dict(sourceKey=f'{fingerprint}-{occurrences[fingerprint]}', date=date.date().isoformat(), description=description,
                         debitCents=debit, creditCents=credit, balanceCents=balance, accountTag=tag,
                         source=dict(workbook=Path(args.workbook).name, sheet=sheet.title, row=number, file=statement, page=page, fingerprint=fingerprint)))
Path(args.output).write_text(json.dumps(rows, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print(json.dumps(dict(rows=len(rows), trust=sum(r['accountTag']=='Trust' for r in rows), management=sum(r['accountTag']=='Management' for r in rows), debitCents=sum(r['debitCents'] for r in rows), creditCents=sum(r['creditCents'] for r in rows))))
