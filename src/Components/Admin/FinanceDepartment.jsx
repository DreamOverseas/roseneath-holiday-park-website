import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PERIODS, METHODS, REVIEW_STATUSES, centsFromInput, displayDate, money, signedAmount, summarize, tenantId, todaySydney } from '../../../backend/strapi/src/api/rhp-finance/services/domain.mjs';
import { LOCAL_REVIEW, appendEvent, loadFinance, openAccount, reviewMembers, setFinanceToken } from '../../finance/store';
import '../../Css/FinanceDepartment.css';

const nameOf = member => [member.FirstName, member.LastName].filter(Boolean).join(' ') || 'Unnamed member';
const otherPayer = member => [member.FirstName2, member.LastName2].filter(Boolean).join(' ') || '—';
const statusClass = status => `rhp-status rhp-status-${status.toLowerCase()}`;
const blankForm = (type, summary) => ({ type, date: todaySydney(), period: 'B', amount: '', description: '', basis: '',
  periodStart: '2024-10-11', periodEnd: '2026-10-10', dueDate: todaySydney(), verified: false,
  payer: '', method: 'Bank transfer', reference: '', targetKey: '',
  status: summary?.review?.status || 'Automatic', historicalComplete: summary?.historicalComplete || false, nextPayment: summary?.review?.nextPayment || '' });

function downloadStatement(member, summary, records) {
  const safeCell = value => {
    let text = String(value ?? '');
    if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  const rows = [
    ['RHP tenant statement', tenantId(member.SiteNumber), nameOf(member), LOCAL_REVIEW ? 'LOCAL REVIEW ONLY' : ''],
    ['Historical A total', summary.historicalComplete ? 'Reconciled — see recorded charges' : 'Unknown / incomplete'],
    ['Recorded balance AUD', (summary.balance / 100).toFixed(2)],
    ['Date', 'Type', 'Period', 'Description', 'Service start', 'Service end', 'Due date', 'Amount AUD', 'Running balance AUD', 'Payer / recipient', 'Method', 'Reference', 'Evidence', 'Verified', 'Recorded by', 'Recorded at', 'Entry key', 'Corrects'],
    ...summary.rows.map(e => [e.date, e.type, e.period, e.description, e.periodStart, e.periodEnd, e.dueDate, (signedAmount(e) / 100).toFixed(2), (e.balance / 100).toFixed(2), e.payer, e.method, e.reference, e.basis, e.verified ? 'Yes' : 'No', e.actor, e.recordedAt, e.key, e.targetKey]),
    [], ['Audit events', 'Type', 'Reason / evidence', 'Status', 'Historical complete', 'Next payment', 'Target entry', 'Recorded by', 'Recorded at'],
    ...records.filter(e => ['Review', 'Verify'].includes(e.type)).map(e => ['', e.type, e.description, e.status, e.historicalComplete, e.nextPayment, e.targetKey, e.actor, e.recordedAt]),
  ];
  const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(r => r.map(safeCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = `${tenantId(member.SiteNumber)}-${member.documentId}-statement.csv`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function FinanceDepartment({ members = [], onEditMember, standalone = false, portalPassword = '' }) {
  const [accounts, setAccounts] = useState({});
  const [liveMembers, setLiveMembers] = useState([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All tenants');
  const [status, setStatus] = useState('All statuses');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [connected, setConnected] = useState(LOCAL_REVIEW || Boolean(portalPassword));
  const [token, setToken] = useState('');
  const [revision, setRevision] = useState(0);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const requestId = useRef(null);
  const savingRef = useRef(false);
  const formRef = useRef(null);
  const source = LOCAL_REVIEW ? (standalone ? reviewMembers : members) : liveMembers;
  const tenants = useMemo(() => source.filter(m => ['Annual', 'Permanent'].includes(m.TenantType) && m.documentId)
    .sort((a, b) => String(a.SiteNumber || '').localeCompare(String(b.SiteNumber || ''), undefined, { numeric: true })), [source]);
  const selected = tenants.find(m => m.documentId === selectedKey);
  const records = accounts[selectedKey] || [];
  const summary = summarize(records);
  const opened = records.some(e => e.key === 'standard-2024');
  const duplicateSite = selected && tenants.filter(m => String(m.SiteNumber).trim() === String(selected.SiteNumber).trim()).length > 1;

  useEffect(() => {
    if (portalPassword && !LOCAL_REVIEW) setFinanceToken(portalPassword);
    if (!connected) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError('');
    loadFinance().then(result => {
      if (!cancelled) { setAccounts(result.accounts); if (result.members) setLiveMembers(result.members); }
    }).catch(err => { if (!cancelled) setError(err.message); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [connected, revision, portalPassword]);
  useEffect(() => { if (form) formRef.current?.focus(); }, [form?.type]);

  const visible = tenants.filter(m => {
    const s = accounts[m.documentId]?.length ? summarize(accounts[m.documentId]).status : 'Review';
    const searchable = [tenantId(m.SiteNumber), m.SiteNumber, nameOf(m), otherPayer(m), m.Email, m.Email2, m.ContactString, m.Contact, m.ContactString2].join(' ').toLowerCase();
    return (type === 'All tenants' || m.TenantType === type) && (status === 'All statuses' || s === status) && searchable.includes(query.trim().toLowerCase());
  });
  const chooseMember = member => { if (saving) return; setSelectedKey(member.documentId); setForm(null); setNotice(''); setError(''); requestId.current = null; };
  const begin = type => { setForm(blankForm(type, summary)); setNotice(''); setError(''); requestId.current = null; };
  const update = (field, value) => { setForm(prev => ({ ...prev, [field]: value })); requestId.current = null; };
  const selectPeriod = period => { setForm(prev => ({ ...prev, period, periodStart: PERIODS[period].start || '', periodEnd: PERIODS[period].end })); requestId.current = null; };
  const selectTarget = key => {
    const target = records.find(e => e.key === key);
    setForm(prev => ({ ...prev, targetKey: key, ...(target && prev.type !== 'Verify' ? { period: target.period, periodStart: target.periodStart || '', periodEnd: target.periodEnd || '', payer: target.payer || '', method: target.method || 'Bank transfer', reference: '' } : {}) }));
    requestId.current = null;
  };
  const save = async event => {
    event.preventDefault();
    if (savingRef.current || !selected) return;
    savingRef.current = true; setSaving(true); setError(''); setNotice('');
    const memberKey = selected.documentId;
    try {
      let result;
      if (form.type === 'Open') result = await openAccount(memberKey);
      else {
        const payload = { ...form };
        if (!['Review', 'Verify'].includes(form.type)) payload.amountCents = centsFromInput(form.amount);
        requestId.current ||= crypto.randomUUID();
        result = await appendEvent(memberKey, payload, requestId.current);
      }
      setAccounts(prev => ({ ...prev, [memberKey]: result.records }));
      setForm(null); requestId.current = null;
      setNotice(LOCAL_REVIEW ? 'Saved in this browser’s local review ledger. No data was sent to Strapi.' : 'Saved. The account balance has been recalculated.');
    } catch (err) { setError(err.message); }
    finally { savingRef.current = false; setSaving(false); }
  };
  const field = (label, key, inputType = 'text', required = true) => <label className="rhp-field">{label}<input type={inputType} value={form[key]} required={required} maxLength={inputType === 'text' ? 2000 : undefined} onChange={e => update(key, e.target.value)} {...(inputType === 'date' && key === 'date' ? { max: todaySydney() } : {})} /></label>;

  return <section className="rhp-finance" aria-label="Finance Department">
    <div className="rhp-finance-heading"><div><p className="rhp-eyebrow">RHP MEMBERSHIPS</p><h2>Finance Department</h2><p>Annual & permanent tenants · Running ledger · AUD</p></div>
      <button type="button" disabled={loading || saving || !connected} onClick={() => setRevision(v => v + 1)}>Refresh accounts</button></div>
    {LOCAL_REVIEW && <div className="rhp-banner rhp-no-print"><strong>Local review only.</strong> {standalone ? 'Sample tenants for testing. ' : 'Existing member details; separate test finances. '}Financial changes stay in this browser and are not uploaded to Strapi.</div>}
    {!connected && <form className="rhp-connect rhp-no-print" onSubmit={e => { e.preventDefault(); setFinanceToken(token.trim()); setToken(''); setConnected(true); }}><h3>Staff finance access</h3><p>Enter your finance access code to load protected accounts.</p><label className="rhp-field">Finance access code<input type="password" required autoComplete="off" value={token} onChange={e => setToken(e.target.value)} /></label><button className="rhp-primary">Connect</button></form>}
    {connected && !LOCAL_REVIEW && !portalPassword && <button className="rhp-no-print" disabled={saving} onClick={() => { setFinanceToken(''); setConnected(false); setLiveMembers([]); setAccounts({}); setSelectedKey(''); setForm(null); setError(''); }}>Disconnect finance</button>}
    {loading && <p role="status">Loading financial accounts…</p>}
    {error && !form && <div className="rhp-error" role="alert">{error}</div>}
    {notice && <div className="rhp-success rhp-no-print" role="status">{notice}</div>}
    {connected && !loading && <>
      <div className="rhp-toolbar rhp-no-print">
        <label className="rhp-field rhp-search">Search tenants<input type="search" placeholder="Tenant ID, site, name, payer, phone or email…" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <label className="rhp-field">Member type<select value={type} onChange={e => setType(e.target.value)}>{['All tenants', 'Annual', 'Permanent'].map(v => <option key={v}>{v}</option>)}</select></label>
        <label className="rhp-field">Account status<select value={status} onChange={e => setStatus(e.target.value)}>{['All statuses', 'Current', 'Review', 'Overdue', 'Disputed', 'Arrangement'].map(v => <option key={v}>{v}</option>)}</select></label>
      </div>
      <div className="rhp-table-wrap rhp-tenant-list rhp-no-print"><table><caption>{visible.length} tenants · Select an account to view its financial records</caption><thead><tr>{['Tenant ID / Site', 'Tenant / Other payer', 'Contact', 'Type', 'Status', 'Recorded balance', 'Next payment', ''].map((v, i) => <th key={i}>{v}</th>)}</tr></thead>
        <tbody>{visible.map(member => {
          const events = accounts[member.documentId] || [];
          const info = summarize(events);
          return <tr key={member.documentId} className={selectedKey === member.documentId ? 'rhp-selected' : ''}>
            <td><strong>{tenantId(member.SiteNumber)}</strong><small>Site {member.SiteNumber || '—'}</small></td>
            <td><strong>{nameOf(member)}</strong><small>{otherPayer(member)}</small></td>
            <td>{member.ContactString || member.Contact || '—'}<small>{member.Email || '—'}</small></td>
            <td>{member.TenantType}</td><td><span className={statusClass(info.status)}>{info.status}</span></td>
            <td className="rhp-money">{events.length ? money(info.balance) : 'Not opened'}<small>{info.historicalComplete ? 'History reconciled' : 'A total unknown'}</small></td>
            <td>{displayDate(info.review?.nextPayment)}</td><td><button disabled={saving} aria-label={`View ${tenantId(member.SiteNumber)} ${nameOf(member)}`} onClick={() => chooseMember(member)}>View ledger</button></td>
          </tr>;
        })}</tbody></table>{!visible.length && <p className="rhp-empty">No annual or permanent tenants match these filters.</p>}</div>
      {!selected && <div className="rhp-empty rhp-no-print">Select a tenant above to open their account summary and transaction history.</div>}
      {selected && <article className="rhp-account" aria-label={`Account for ${tenantId(selected.SiteNumber)}`}>
        <header className="rhp-account-heading"><div><p className="rhp-eyebrow">{tenantId(selected.SiteNumber)} · SITE {selected.SiteNumber}</p><h3>{nameOf(selected)}</h3><p>{selected.TenantType} · Other payer: {otherPayer(selected)}</p></div><span className={statusClass(summary.status)}>{summary.status}</span>
          <div className="rhp-actions rhp-no-print">{onEditMember && <button disabled={saving} onClick={() => onEditMember(selected)}>Member details</button>}<button disabled={!opened} onClick={() => downloadStatement(selected, summary, records)}>Export statement</button><button disabled={!opened} onClick={() => window.print()}>Print / PDF</button></div></header>
        {duplicateSite && <p className="rhp-banner">More than one membership uses this site. This ledger belongs only to {nameOf(selected)} (member {selected.documentId}).</p>}
        <div className="rhp-account-grid"><aside className="rhp-summary"><h4>Account summary</h4>
          {Object.entries(PERIODS).map(([key, period]) => <div className={`rhp-period rhp-period-${key.toLowerCase()}`} key={key}><div><span className="rhp-period-letter">{key}</span><strong>{period.title}</strong></div><small>{period.start ? displayDate(period.start) : 'Up to'} – {displayDate(period.end)}</small>
            <div className="rhp-summary-line"><span>{key === 'A' ? 'Historical total' : 'Standard receivable'}</span><strong>{key === 'A' ? (summary.historicalComplete ? money(summary.periods.A.charges - summary.periods.A.credits) : 'Unknown') : money(period.expected)}</strong></div>
            {key === 'C' && <small className="rhp-due-note">Payable in advance · due 11/10/2026</small>}
            <small>Recorded charges {money(summary.periods[key].charges)} · Paid {money(summary.periods[key].paid)}</small>
            <small>Credits {money(summary.periods[key].credits)} · Refunds {money(summary.periods[key].refunds)}</small>
            <div className="rhp-summary-line"><span>Recorded balance</span><strong>{money(summary.periods[key].balance)}</strong></div>
          </div>)}
          <dl className="rhp-totals"><div><dt>Total charges</dt><dd>{money(summary.charges)}</dd></div><div><dt>Total payments</dt><dd>−{money(summary.paid)}</dd></div><div><dt>Credits / refunds</dt><dd>−{money(summary.credits)} / +{money(summary.refunds)}</dd></div><div className="rhp-balance"><dt>{summary.balance < 0 ? 'Recorded credit' : 'Recorded balance due'}</dt><dd>{opened ? money(Math.abs(summary.balance)) : 'Not opened'}</dd></div></dl>
          <p className="rhp-summary-note">{summary.historicalComplete ? 'Historical records marked complete by staff.' : 'A is not fully established. The recorded balance is provisional; unknown history is not treated as zero.'}{summary.hasUnverified ? ' Includes unverified records.' : ''}</p>
        </aside><div className="rhp-records"><div className="rhp-section-heading"><div><h4>Transaction history</h4><p>Charges add · Payments subtract · Original records are retained</p></div></div>
          <div className="rhp-actions rhp-no-print">{!opened ? <button className="rhp-primary" disabled={saving} onClick={() => begin('Open')}>Open account</button> : <>{['Charge', 'Payment'].map(t => <button className={t === 'Payment' ? 'rhp-primary' : ''} key={t} disabled={saving} onClick={() => begin(t)}>+ Add {t.toLowerCase()}</button>)}<button disabled={saving} onClick={() => begin('Credit')}>Correct a charge</button><button disabled={saving} onClick={() => begin('Refund')}>Refund / reverse payment</button><button disabled={saving} onClick={() => begin('Review')}>Review account</button><button disabled={saving} onClick={() => begin('Verify')}>Verify record</button></>}</div>
          {!opened && <p className="rhp-banner">Opening this account records three annual charges of A$1,936: two in B and one advance charge in C (A$5,808 total). Historical A charges and actual payments must be entered from evidence.</p>}
          <div className="rhp-table-wrap"><table><thead><tr>{['Date / Period', 'Type', 'Description / Evidence', 'Amount (AUD)', 'Balance (AUD)', 'Payer / Method', 'Reference / Verified'].map(v => <th key={v}>{v}</th>)}</tr></thead><tbody>{summary.rows.map(row => <tr key={row.key}>
            <td>{displayDate(row.date)}<small>Period {row.period}</small></td><td><span className={`rhp-entry rhp-entry-${row.type.toLowerCase()}`}>{row.type}</span></td>
            <td className="rhp-description"><strong>{row.description}</strong>{row.periodStart && <small>Service: {displayDate(row.periodStart)} – {displayDate(row.periodEnd)}</small>}{row.dueDate && <small>Due: {displayDate(row.dueDate)}</small>}<small>{row.basis}</small><small>By {row.actor} · {displayDate(row.recordedAt)}</small>{row.targetKey && <small>Corrects: {row.targetKey}</small>}</td>
            <td className={`rhp-money ${signedAmount(row) < 0 ? 'rhp-negative' : ''}`}>{money(signedAmount(row))}</td><td className="rhp-money">{money(row.balance)}</td><td>{row.payer || '—'}<small>{row.method || '—'}</small></td><td>{row.reference || '—'}<small>{row.verified ? 'Verified' : 'Unverified'}</small></td>
          </tr>)}</tbody></table>{!summary.rows.length && <p className="rhp-empty">No financial transactions recorded.</p>}</div>
          {form && <form className="rhp-entry-form rhp-no-print" onSubmit={save}><h4 ref={formRef} tabIndex={-1}>{form.type === 'Open' ? 'Confirm opening charges' : `${form.type} record`}</h4>
            {error && <div className="rhp-error" role="alert">{error}</div>}
            <fieldset disabled={saving}>
            {form.type === 'Open' ? <><p>Confirm this member owes A$1,936 for each full year: 11/10/2024–10/10/2025, 11/10/2025–10/10/2026 and 11/10/2026–10/10/2027. No payment or historical A amount is assumed.</p><label className="rhp-check"><input type="checkbox" required /> I have checked these standard charges for this member. Any exemptions will be recorded as credits with evidence.</label></> : <>
              {['Credit', 'Refund', 'Verify'].includes(form.type) && <label className="rhp-field">Original record<select value={form.targetKey} required onChange={e => selectTarget(e.target.value)}><option value="">Choose a record…</option>{summary.rows.filter(e => form.type === 'Verify' ? !e.verified : e.type === (form.type === 'Credit' ? 'Charge' : 'Payment')).map(e => <option key={e.key} value={e.key}>{displayDate(e.date)} · {e.description} · {money(e.amountCents)}</option>)}</select></label>}
              {form.type === 'Review' ? <div className="rhp-form-grid"><label className="rhp-field">Account status<select value={form.status} onChange={e => update('status', e.target.value)}>{REVIEW_STATUSES.map(v => <option key={v}>{v}</option>)}</select></label>{field('Next payment date (optional)', 'nextPayment', 'date', false)}<label className="rhp-check rhp-wide"><input type="checkbox" checked={form.historicalComplete} onChange={e => update('historicalComplete', e.target.checked)} /> Historical A charges and payments have been fully reconciled against source records (including a verified nil balance, if applicable).</label></div> : form.type !== 'Verify' && <div className="rhp-form-grid">
                {field('Transaction date', 'date', 'date')}<label className="rhp-field">Financial period<select value={form.period} disabled={['Credit', 'Refund'].includes(form.type)} onChange={e => selectPeriod(e.target.value)}>{Object.keys(PERIODS).map(key => <option key={key} value={key}>{key} · {PERIODS[key].title}</option>)}</select></label>
                <label className="rhp-field">Amount (AUD)<input required inputMode="decimal" placeholder="0.00" value={form.amount} onChange={e => update('amount', e.target.value)} /></label>
                {['Charge', 'Credit'].includes(form.type) ? <>{field('Service period start', 'periodStart', 'date')}{field('Service period end', 'periodEnd', 'date')}{form.type === 'Charge' && field('Due date', 'dueDate', 'date')}</> : <>{field('Payer / recipient', 'payer')}<label className="rhp-field">Payment method<select value={form.method} onChange={e => update('method', e.target.value)}>{METHODS.map(v => <option key={v}>{v}</option>)}</select></label>{field('Bank / receipt reference', 'reference')}</>}
              </div>}
              <label className="rhp-field">{['Review', 'Verify'].includes(form.type) ? 'Reason / verification evidence' : 'Description / correction reason'}<textarea required maxLength={2000} value={form.description} onChange={e => update('description', e.target.value)} /></label>
              {!['Review', 'Verify'].includes(form.type) && <>{field('Source / evidence (invoice, old-owner record or receipt)', 'basis')}<label className="rhp-check"><input type="checkbox" checked={form.verified} onChange={e => update('verified', e.target.checked)} /> Verified against source records</label><p className="rhp-summary-note">For payments, choose the period being paid, regardless of the payment date. Split payments covering multiple periods into separate entries with the same bank reference.</p></>}
            </>}
            <div className="rhp-actions"><button type="submit" className="rhp-primary">{saving ? 'Saving…' : form.type === 'Open' ? 'Confirm & open account' : 'Save record'}</button><button type="button" onClick={() => setForm(null)}>Cancel</button></div></fieldset>
          </form>}
          <details className="rhp-audit"><summary>Account review & verification history ({records.filter(e => ['Review', 'Verify'].includes(e.type)).length})</summary>{records.filter(e => ['Review', 'Verify'].includes(e.type)).map(e => <div key={e.key}><strong>{e.type}{e.status ? ` · ${e.status}` : ''}</strong><p>{e.description}</p><small>{e.actor} · {displayDate(e.recordedAt)}{e.type === 'Review' ? ` · A history: ${e.historicalComplete ? 'complete' : 'incomplete'} · Next payment: ${displayDate(e.nextPayment)}` : ` · Entry: ${e.targetKey}`}</small></div>)}</details>
        </div></div>
        <footer className="rhp-legend">{[['Current', 'Reconciled, no amount outstanding'], ['Review', 'Incomplete history, unverified or staff review'], ['Overdue', 'Reconciled account with past-due charges'], ['Disputed', 'Amount disputed'], ['Arrangement', 'Payment arrangement recorded']].map(([label, text]) => <span key={label}><span className={statusClass(label)}>{label}</span> {text}</span>)}</footer>
      </article>}
    </>}
  </section>;
}
