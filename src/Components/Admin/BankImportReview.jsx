import React, { useMemo, useState } from 'react';
import { displayDate, money } from '../../../backend/strapi/src/api/rhp-finance/services/domain.mjs';

export default function BankImportReview({ transactions = [], members = [] }) {
  const [filter, setFilter] = useState('Review');
  const [tag, setTag] = useState('All accounts');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const names = useMemo(() => new Map(members.map(m => [m.documentId, `Site ${m.SiteNumber} · ${m.FirstName || ''} ${m.LastName || ''}`])), [members]);
  if (!transactions.length) return null;
  const pending = transactions.filter(r => r.matchStatus === 'Review').length;
  const visible = transactions.filter(r => (filter === 'All records' || r.matchStatus === filter) && (tag === 'All accounts' || r.accountTag === tag) &&
    [r.description, r.matchReason, names.get(r.memberKey), r.source?.sheet, r.source?.row, r.source?.file].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  const pages = Math.max(1, Math.ceil(visible.length / 50));
  const current = Math.min(page, pages - 1);
  return <details className="rhp-bank-import rhp-no-print"><summary>Bank import · {transactions.length} original records · {transactions.length - pending} matched · {pending} awaiting review</summary>
    <p>Trust and Management records are combined with account labels. Unmatched receipts and bank expenses stay here until reviewed. All imported tenant payments start Unassigned.</p>
    <div className="rhp-toolbar"><label className="rhp-field">Matching<select value={filter} onChange={e => { setFilter(e.target.value); setPage(0); }}>{['Review', 'Matched', 'All records'].map(s => <option key={s}>{s}</option>)}</select></label>
      <label className="rhp-field">Bank account<select value={tag} onChange={e => { setTag(e.target.value); setPage(0); }}>{['All accounts', 'Trust', 'Management'].map(s => <option key={s}>{s}</option>)}</select></label>
      <label className="rhp-field rhp-search">Search bank records<input type="search" value={query} placeholder="Name, site, description or source…" onChange={e => { setQuery(e.target.value); setPage(0); }} /></label></div>
    <div className="rhp-table-wrap"><table><caption>{visible.length} matching records · Page {current + 1} of {pages}</caption><thead><tr>{['Date / Account', 'Description', 'Debit / Credit (AUD)', 'Tenant / Matching', 'Source'].map(s => <th key={s}>{s}</th>)}</tr></thead><tbody>
      {visible.slice(current * 50, current * 50 + 50).map(r => <tr key={r.sourceKey}><td>{displayDate(r.date)}<small className={`rhp-bank-tag rhp-bank-${r.accountTag.toLowerCase()}`}>{r.accountTag}</small></td><td className="rhp-description">{r.description}</td><td className="rhp-money">Debit {money(r.debitCents)}<small>Credit {money(r.creditCents)}</small></td><td>{names.get(r.memberKey) || 'Awaiting review'}<small>{r.matchReason}</small>{r.candidates?.map(c => <small key={c.memberKey}>Candidate: Site {c.site} · {c.name}</small>)}</td><td>{r.source?.sheet} · row {r.source?.row}<small>{r.source?.file} · p. {r.source?.page}</small></td></tr>)}
    </tbody></table></div><div className="rhp-actions"><button disabled={current === 0} onClick={() => setPage(current - 1)}>Previous</button><button disabled={current + 1 >= pages} onClick={() => setPage(current + 1)}>Next</button></div>
  </details>;
}
