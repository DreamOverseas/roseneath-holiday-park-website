"""Create a private, searchable matching review from the prepared import."""
import json
import pathlib
import sys
data = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding='utf-8'))
members = {m['documentId']: m for m in data['members']}
rows = []
for row in data['rows']:
    m = members.get(row['memberKey'], {})
    rows.append(dict(date=row['date'], account=row['accountTag'], description=row['description'], debit=row['debitCents'], credit=row['creditCents'],
                     matched=bool(row['memberKey']), tenant=f"Site {m.get('SiteNumber', '')} {m.get('FirstName', '')} {m.get('LastName', '')}" if m else '',
                     reason=row['matchReason'], candidates='; '.join(f"Site {c['site']} {c['name']}" for c in row['candidates']),
                     source=f"{row['source']['sheet']} row {row['source']['row']} · {row['source']['file']} p{row['source']['page']}"))
payload = json.dumps(rows, ensure_ascii=False).replace('<', '\\u003c')
page = '''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>RHP 银行交易匹配核对</title>
<style>body{font:15px system-ui;background:#f4f6f8;color:#172c36;margin:30px}h1{font-size:26px}.stats{display:flex;gap:30px;padding:20px;background:white;border-radius:10px}.stats strong{display:block;font-size:25px}input,select,button{font:inherit;padding:9px;border:1px solid #b7c8d0;border-radius:5px;margin:15px 10px 15px 0}input{width:35%}table{border-collapse:collapse;width:100%;background:white}td,th{text-align:left;border-bottom:1px solid #dde5ea;padding:12px;vertical-align:top}th{background:#16434c;color:white}small{display:block;color:#536976;margin-top:6px}.amount{white-space:nowrap;font-variant-numeric:tabular-nums}nav{display:flex;gap:15px;align-items:center}</style>
<h1>RHP 银行交易匹配核对</h1><p>来源：RHPM_all_accounts_updated.xlsx。所有导入的租户收款均无期间归属。银行支出、未具名收入和身份冲突保留原始记录，未擅自记入租户账本。</p>
<div class="stats" id="stats"></div><p>已按本次确认的付款人及 site 对应关系核对。要求暂缓的收款保留待确认，并在相关会员注释中备注。未确认的姓名拼写差异和 site 冲突未自动合并。</p>
<select id="filter"><option value="clues">有租户线索待确认</option><option value="review">全部未匹配</option><option value="matched">已匹配</option><option value="all">全部原始记录</option></select><input id="search" placeholder="搜索名字、site、描述或来源行号"><div id="count"></div><table><thead><tr><th>日期／账户</th><th>描述</th><th>借方／贷方 AUD</th><th>匹配结果／候选人</th><th>来源</th></tr></thead><tbody id="body"></tbody></table><nav><button id="previous">上一页</button><span id="position"></span><button id="next">下一页</button></nav>
<script>const rows=PAYLOAD;let page=0;const money=n=>new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD'}).format(n/100);const el=id=>document.getElementById(id);
const stats=[['原始记录',rows.length],['已匹配',rows.filter(r=>r.matched).length],['未匹配',rows.filter(r=>!r.matched).length],['已匹配收款',money(rows.filter(r=>r.matched).reduce((n,r)=>n+r.credit,0))]];for(const [label,value]of stats){const box=document.createElement('div');box.textContent=label;const strong=document.createElement('strong');strong.textContent=value;box.append(strong);el('stats').append(box)}
function draw(){const f=el('filter').value,q=el('search').value.toLowerCase();const list=rows.filter(r=>(f==='all'||f==='matched'&&r.matched||f==='review'&&!r.matched||f==='clues'&&!r.matched&&(r.candidates||!/No confirmed tenant identity|Bank debit|Purpose needs review/.test(r.reason)))&&JSON.stringify(r).toLowerCase().includes(q));const pages=Math.max(1,Math.ceil(list.length/50));page=Math.min(page,pages-1);el('count').textContent=`${list.length} 条记录`;el('body').replaceChildren();for(const r of list.slice(page*50,page*50+50)){const tr=document.createElement('tr');for(const texts of [[r.date,r.account],[r.description],[`Debit ${money(r.debit)}`,`Credit ${money(r.credit)}`],[r.tenant||'待确认',r.reason,r.candidates],[r.source]]){const td=document.createElement('td');texts.forEach((s,i)=>{const p=document.createElement(i?'small':'span');p.textContent=s;td.append(p)});tr.append(td)}el('body').append(tr)}el('position').textContent=`${page+1} / ${pages}`;el('previous').disabled=page===0;el('next').disabled=page+1>=pages}el('filter').onchange=el('search').oninput=()=>{page=0;draw()};el('previous').onclick=()=>{page--;draw()};el('next').onclick=()=>{page++;draw()};draw();</script></html>'''.replace('PAYLOAD', payload)
pathlib.Path(sys.argv[2]).write_text(page, encoding='utf-8')
print(json.dumps(dict(total=len(rows), matched=sum(r['matched'] for r in rows), review=sum(not r['matched'] for r in rows))))
