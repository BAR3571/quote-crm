import React, { useEffect, useMemo, useRef, useState } from 'react';
import jsPDF from 'jspdf';

// =========================
//  QUOTE CRM (ASCII Safe)
// =========================

const STATUSES = ['Draft', 'Sent', 'Accepted', 'Declined', 'Expired'] as const;
const APPROVAL_STATES = ['Not Required', 'Requested', 'Approved', 'Declined'] as const;
const CURRENCIES = ['GBP', 'USD', 'EUR'] as const;

type Status = typeof STATUSES[number];
type ApprovalState = typeof APPROVAL_STATES[number];
type Currency = typeof CURRENCIES[number];

type Approval = {
  state: ApprovalState;
  approver: string;
  requestedAt: string;
  decidedAt: string;
  note: string;
};

type Quote = {
  id: string;
  title: string;
  client: string;
  contact: string;
  value: number;
  currency: Currency;
  probability: number;
  status: Status;
  owner: string;
  createdBy: string;
  validUntil: string;
  notes: string;
  approval: Approval;
  createdAt: string;
  updatedAt: string;
};

const STORE_KEY = 'quote_crm_data';
const USER_KEY = 'quote_crm_user';

const uid = () => Math.random().toString(36).slice(2, 8) + '-' + Date.now().toString(36).slice(-6);
const todayISO = () => new Date().toISOString().slice(0, 10);
const addDays = (d: number) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);
const fmt = (n: number, c: Currency = 'GBP') => new Intl.NumberFormat(undefined, { style: 'currency', currency: c }).format(n);

function Pill({ text, color }: { text: string; color: string }) {
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{text}</span>;
}

const statusColor: Record<Status, string> = {
  Draft: 'bg-gray-100 text-gray-800',
  Sent: 'bg-blue-100 text-blue-800',
  Accepted: 'bg-green-100 text-green-800',
  Declined: 'bg-rose-100 text-rose-800',
  Expired: 'bg-amber-100 text-amber-800'
};
const approvalColor: Record<ApprovalState, string> = {
  'Not Required': 'bg-gray-100 text-gray-800',
  Requested: 'bg-amber-100 text-amber-800',
  Approved: 'bg-green-100 text-green-800',
  Declined: 'bg-rose-100 text-rose-800'
};

function Modal({ open, onClose, title, children }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-3xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{title}</h3>
            <button onClick={onClose}>✕</button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function QuoteForm({ initial, onSubmit }: { initial?: Quote; onSubmit: (q: Quote) => void }) {
  const [form, setForm] = useState<Quote>(
    initial || {
      id: '',
      title: '',
      client: '',
      contact: '',
      value: 0,
      currency: 'GBP',
      probability: 50,
      status: 'Draft',
      owner: '',
      createdBy: '',
      validUntil: addDays(30),
      notes: '',
      approval: { state: 'Not Required', approver: '', requestedAt: '', decidedAt: '', note: '' },
      createdAt: '',
      updatedAt: ''
    }
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ ...form, value: Number(form.value), probability: Number(form.probability) });
      }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1">Title</label>
        <input className="border rounded-xl w-full p-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Client</label>
        <input className="border rounded-xl w-full p-2" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Contact</label>
        <input className="border rounded-xl w-full p-2" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Value</label>
        <input type="number" className="border rounded-xl w-full p-2" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Currency</label>
        <select className="border rounded-xl w-full p-2" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}>
          {CURRENCIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Probability (%)</label>
        <input type="number" className="border rounded-xl w-full p-2" value={form.probability} onChange={(e) => setForm({ ...form, probability: Number(e.target.value) })} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select className="border rounded-xl w-full p-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status })}>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea className="border rounded-xl w-full p-2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
      <div className="md:col-span-2 text-right">
        <button className="bg-black text-white px-4 py-2 rounded-xl">Save</button>
      </div>
    </form>
  );
}

export default function QuoteCRM() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editQuote, setEditQuote] = useState<Quote | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) setQuotes(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(quotes));
  }, [quotes]);

  const saveQuote = (q: Quote) => {
    if (q.id) setQuotes(quotes.map((x) => (x.id === q.id ? { ...q, updatedAt: new Date().toISOString() } : x)));
    else setQuotes([{ ...q, id: uid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...quotes]);
    setModalOpen(false);
  };

  const generatePDF = (q: Quote) => {
    const pdf = new jsPDF();
    pdf.text(`Quotation for ${q.client}`, 20, 20);
    pdf.text(`Title: ${q.title}`, 20, 30);
    pdf.text(`Value: ${fmt(q.value, q.currency)}`, 20, 40);
    pdf.text(`Status: ${q.status}`, 20, 50);
    pdf.text(`Notes: ${q.notes}`, 20, 60);
    pdf.save(`${q.client}_quote.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Quote CRM</h1>
        <button className="bg-black text-white px-4 py-2 rounded-xl" onClick={() => { setEditQuote(null); setModalOpen(true); }}>New Quote</button>
      </header>

      <div className="grid gap-4">
        {quotes.map((q) => (
          <div key={q.id} className="bg-white p-4 rounded-2xl shadow flex justify-between items-center">
            <div>
              <h2 className="font-semibold">{q.title}</h2>
              <p className="text-sm text-gray-500">{q.client} • {fmt(q.value, q.currency)}</p>
              <div className="mt-1 flex gap-2">
                <Pill text={q.status} color={statusColor[q.status]} />
                <Pill text={q.approval.state} color={approvalColor[q.approval.state]} />
              </div>
            </div>
            <div className="flex gap-2">
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
