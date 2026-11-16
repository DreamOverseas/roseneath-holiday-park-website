// Conservative identity matching. Ambiguity and spelling differences remain for staff review.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const normalize = s => String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const siteOf = s => String(s || '').trim().toLowerCase().replace(/^0+(?=\d)/, '');
export function matchTransaction(row, members, confirmedMappings = []) {
  const text = normalize(row.description);
  const words = text.split(' ');
  const compact = text.replaceAll(' ', '');
  const sites = [...new Set([...row.description.matchAll(/\b(?:site|van)\s*[-_#:]?\s*(\d{1,3})(?!\d)([a-z]{1,2}(?:\/[a-z])?(?=\b|_)|)/gi)].map(m => siteOf(m[1] + m[2])))];
  const siteMembers = members.filter(m => sites.includes(siteOf(m.SiteNumber)));
  // A surname is evidence, not sufficient alone. Require first name/initial as well.
  const nameMembers = members.filter(m => [1, 2].some(n => {
    const first = normalize(m[n === 1 ? 'FirstName' : 'FirstName2']);
    const last = normalize(m[n === 1 ? 'LastName' : 'LastName2']);
    if (!first || !last || last.length < 3) return false;
    const surname = last.replaceAll(' ', '');
    if (!(` ${text} `.includes(` ${last} `))) return false;
    const firsts = first.split(' ').filter(w => w !== 'and');
    return firsts.some(f => f.length > 1 ? words.includes(f) || compact.includes(f + surname) : words.includes(f)) || words.includes(first[0]);
  }));
  const candidateKeys = [...new Set([...siteMembers, ...nameMembers].map(m => m.documentId))];
  const candidates = candidateKeys.map(key => members.find(m => m.documentId === key));
  const result = (member, reason) => ({ ...row, memberKey: member?.documentId || '', matchStatus: member ? 'Matched' : 'Review', matchReason: reason, candidates: candidates.map(m => ({ memberKey: m.documentId, site: m.SiteNumber, name: [m.FirstName, m.LastName].join(' ') })) });
  if (row.debitCents) return result(null, 'Bank debit: not assumed to be a tenant refund or charge');
  if (/\b(wages?|reimburs\w*|salary|loan|insurance|refund|reversal|return)\b|\bpay\s*back\b/i.test(row.description)) return result(null, 'Purpose needs review before treating this receipt as a tenant payment');
  for (const mapping of confirmedMappings) {
    if (!(` ${text} `.includes(` ${normalize(mapping.payer)} `))) continue;
    if (mapping.hold) return result(null, 'Owner requested no ledger entry for shared payer name; notes added to both memberships');
    if (sites.some(site => !mapping.referenceSites.includes(site))) return result(null, 'Confirmed payer has a different site reference; review required');
    const member = members.find(m => m.documentId === mapping.memberKey);
    if (!member) throw Error('Confirmed member is missing');
    return result(member, 'Owner confirmed payer identity and site mapping on 16/11/2026');
  }
  if (sites.length > 1) return result(null, 'Multiple sites in one receipt; allocation/split needs confirmation');
  if (sites.length) {
    const agreed = nameMembers.filter(m => siteMembers.includes(m));
    if (agreed.length === 1 && nameMembers.every(m => siteMembers.includes(m))) return result(agreed[0], 'Name and explicit site agree');
    return result(null, nameMembers.length ? 'Name/site conflict or shared identity' : 'Site reference without confirmed tenant name');
  }
  if (nameMembers.length === 1) return result(nameMembers[0], 'Unique tenant/payer name; no conflicting site reference');
  return result(null, nameMembers.length ? 'Name belongs to more than one membership' : 'No confirmed tenant identity');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [rowsFile, membersFile, out] = process.argv.slice(2);
  const rows = JSON.parse(fs.readFileSync(rowsFile, 'utf8'));
  const source = JSON.parse(fs.readFileSync(membersFile, 'utf8').replace(/^\uFEFF/, ''));
  const members = source.data || source;
  const confirmed = process.argv[5] ? JSON.parse(fs.readFileSync(process.argv[5], 'utf8')) : {};
  const matches = rows.map(row => matchTransaction(row, members.map(m => confirmed.siteCorrection?.memberKey === m.documentId ? { ...m, SiteNumber: confirmed.siteCorrection.to } : m), confirmed.mappings));
  fs.writeFileSync(out, JSON.stringify({ workbook: rows[0].source.workbook, members, confirmed, rows: matches }));
  const matched = matches.filter(r => r.memberKey);
  console.log(JSON.stringify({ total: rows.length, matched: matched.length, review: matches.length - matched.length, matchedCents: matched.reduce((n, r) => n + r.creditCents, 0), tenants: new Set(matched.map(r => r.memberKey)).size,
    byTenant: members.map(m => ({ site: m.SiteNumber, name: `${m.FirstName} ${m.LastName}`, count: matched.filter(r => r.memberKey === m.documentId).length })).filter(m => m.count) }, null, 2));
}
