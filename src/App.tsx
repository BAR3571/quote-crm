import React, { useEffect, useState } from 'react';
setQuotes((prev) => {
const map = new Map<string, Quote>(prev.map((q) => [q.id, q]));
for (const q of mapped) map.set(q.id, q);
return Array.from(map.values());
});
};


const generatePDF = (q: Quote) => {
const pdf = new jsPDF();
pdf.text('Quotation for ' + (q.customer || q.client), 20, 20);
pdf.text('Title: ' + q.title, 20, 30);
pdf.text('Value: ' + fmt(q.value, q.currency), 20, 40);
pdf.text('Status: ' + q.status, 20, 50);
pdf.text('Originator: ' + (q.originator || '—'), 20, 60);
pdf.text('Start Date: ' + (q.startDate || '—'), 20, 70);
pdf.text('Notes: ' + (q.notes || ''), 20, 80);
pdf.save((q.customer || 'customer') + '_quote.pdf');
};


return (
<div className="min-h-screen bg-gray-50 p-6">
<header className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
<div>
<h1 className="text-2xl font-bold">Quote CRM</h1>
<p className="text-sm text-gray-600">Start Date & Originator included • Excel import</p>
</div>
<div className="flex gap-2 items-center">
<label className="border rounded-xl px-3 py-2 text-sm cursor-pointer">Import Excel (.xlsx)
<input type="file" accept=".xlsx" className="hidden" onChange={(e) => { if (e.target.files) onImportXLSX(e.target.files[0]); }} />
</label>
<button className="bg-black text-white px-4 py-2 rounded-xl" onClick={() => { setEditQuote(null); setModalOpen(true); }}>New Quote</button>
</div>
</header>


<div className="grid gap-4">
{quotes.map((q) => (
<div key={q.id} className="bg-white p-4 rounded-2xl shadow">
<div className="flex justify-between items-start">
<div>
<h2 className="font-semibold">{q.title}</h2>
<p className="text-sm text-gray-600">Customer: <span className="font-medium">{q.customer || q.client}</span></p>
<p className="text-xs text-gray-500">Contact: {q.contact || '—'}</p>
<p className="text-xs text-gray-500">Originator: {q.originator || '—'} • Start: {q.startDate || '—'}</p>
</div>
<div className="text-right">
<div className="text-sm">{fmt(q.value, q.currency)}</div>
<div className="mt-1 flex gap-2 justify-end">
<Pill text={q.status} color={statusColor[q.status]} />
<Pill text={q.approval.state} color={approvalColor[q.approval.state]} />
</div>
</div>
</div>
<div className="mt-3 flex gap-2">
<button className="border px-3 py-1 rounded-xl" onClick={() => { setEditQuote(q); setModalOpen(true); }}>Edit</button>
<button className="border px-3 py-1 rounded-xl" onClick={() => generatePDF(q)}>PDF</button>
</div>
</div>
))}
{quotes.length === 0 && <p className="text-center text-gray-500">No quotes yet.</p>}
</div>


<Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editQuote ? 'Edit Quote' : 'New Quote'}>
<QuoteForm initial={editQuote || undefined} onSubmit={saveQuote} />
</Modal>
</div>
);
}
