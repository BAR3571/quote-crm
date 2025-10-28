import React, { useEffect, useState } from 'react';
const mapped: Quote[] = rows.map(r => {
const id = String(r.id || r.ID || '') || uid();
const title = String(r.title || r.Title || '');
const customer = String(r.customer || r.Customer || r.client || r.Client || '');
const contact = String(r.contact || r.Contact || '');
const value = Number(r.value || r.Value || 0);
const currency = (r.currency || r.Currency || 'GBP') as Currency;
const status = (r.status || r.Status || 'Draft') as Status;
const probability = Number(r.probability || r.Probability || 0);
const originator = String(r.originator || r.Originator || '');
const startDate = String(r.startDate || r['Start Date'] || todayISO());
const notes = String(r.notes || r.Notes || '');
const createdAt = new Date().toISOString();
const updatedAt = createdAt;
return { id, title, customer, contact, value, currency, status, probability, originator, startDate, notes, createdAt, updatedAt };
});
setQuotes(prev => {
const map = new Map<string, Quote>(prev.map(q => [q.id, q]));
for (const q of mapped) map.set(q.id, q);
return Array.from(map.values());
});
});
}


function pdf(q: Quote){
const d = new jsPDF();
d.text('Quotation', 20, 20);
d.text('Customer: ' + (q.customer || ''), 20, 30);
d.text('Title: ' + (q.title || ''), 20, 40);
d.text('Value: ' + money(q.value, q.currency), 20, 50);
d.text('Status: ' + q.status, 20, 60);
d.text('Originator: ' + (q.originator || ''), 20, 70);
d.text('Start Date: ' + (q.startDate || ''), 20, 80);
if (q.notes) d.text('Notes: ' + q.notes, 20, 90);
d.save((q.customer || 'quote') + '_quote.pdf');
}


return (
<div className="min-h-screen bg-gray-50 p-6">
<header className="flex items-end justify-between mb-6">
<div>
<h1 className="text-2xl font-bold">Quote CRM</h1>
<p className="text-sm text-gray-600">Start Date • Originator • Excel import</p>
</div>
<div className="flex gap-2">
<label className="border rounded-xl px-3 py-2 text-sm cursor-pointer">Import Excel (.xlsx)
<input type="file" accept=".xlsx" className="hidden" onChange={e => { if (e.target.files) importXLSX(e.target.files[0]); }} />
</label>
<button className="bg-black text-white rounded-xl px-4 py-2" onClick={() => { setEdit(null); setModalOpen(true); }}>New Quote</button>
</div>
</header>


<div className="grid gap-3">
{quotes.map(q => (
<div key={q.id} className="bg-white rounded-2xl shadow p-4 flex items-start justify-between">
<div>
<div className="font-semibold">{q.title}</div>
<div className="text-sm text-gray-600">Customer: <span className="font-medium">{q.customer}</span></div>
<div className="text-xs text-gray-500">Contact: {q.contact || '—'}</div>
<div className="text-xs text-gray-500">Originator: {q.originator || '—'} • Start: {q.startDate || '—'}</div>
</div>
<div className="text-right">
<div className="text-sm">{money(q.value, q.currency)}</div>
<div className="text-xs text-gray-500">{q.status} • {q.probability}%</div>
<div className="mt-2 flex gap-2 justify-end">
<button className="border rounded-xl px-3 py-1" onClick={() => { setEdit(q); setModalOpen(true); }}>Edit</button>
<button className="border rounded-xl px-3 py-1" onClick={() => pdf(q)}>PDF</button>
</div>
</div>
</div>
))}
{quotes.length === 0 && (<p className="text-center text-gray-500">No quotes yet.</p>)}
</div>


<Modal open={modalOpen} title={edit ? 'Edit Quote' : 'New Quote'} onClose={() => setModalOpen(false)}>
<QuoteForm initial={edit || undefined} onSubmit={save} />
</Modal>
</div>
);
}
