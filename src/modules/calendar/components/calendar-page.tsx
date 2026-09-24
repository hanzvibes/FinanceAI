"use client";

import { FormEvent, useMemo, useState } from "react";
import { Icon } from "@/shared/components/ui/icon";
import { Modal } from "@/shared/components/ui/modal";
import { useFinance } from "@/shared/providers/finance-provider";
import type { Agenda } from "@/shared/types/domain";
import { formatDate, formatTime } from "@/shared/utils/format";

function datePart(value: string | Date) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}
function timePart(value: string) { return new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }); }

export function CalendarPage() {
  const { state, addAgenda, updateAgenda, deleteAgenda, toggleAgenda } = useFinance();
  const [today] = useState(() => new Date());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Agenda | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState("");
  const items = useMemo(() => [...state.agendas].filter((item) => `${item.title} ${item.description ?? ""} ${item.category} ${item.location ?? ""}`.toLowerCase().includes(query.toLowerCase())).filter((item) => status === "all" || (status === "done" ? item.done : !item.done)).sort((a,b)=>a.startAt.localeCompare(b.startAt)), [state.agendas, query, status]);
  const upcoming = items.filter((item)=>new Date(item.startAt).getTime() >= today.getTime()-86400000);
  const pending = upcoming.filter((item)=>!item.done);

  function flash(text: string) { setMessage(text); window.setTimeout(() => setMessage(""), 2500); }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const date = String(form.get("date")); const start = String(form.get("time")); const end = String(form.get("endTime") || "");
    const startAt = new Date(`${date}T${start}`);
    const endAt = end ? new Date(`${date}T${end}`) : undefined;
    if (endAt && endAt.getTime() <= startAt.getTime()) { flash("Waktu selesai harus setelah waktu mulai."); return; }
    const input = { title: String(form.get("title")).trim(), description: String(form.get("description")||"").trim() || undefined, startAt: startAt.toISOString(), endAt: endAt?.toISOString(), category: String(form.get("category")||"Personal"), location: String(form.get("location")||"").trim() || undefined, done: editing?.done ?? false };
    if (editing) updateAgenda(editing.id, input); else addAgenda(input);
    setOpen(false); setEditing(null); flash(editing ? "Agenda diperbarui." : "Agenda ditambahkan.");
  }
  function remove(id: string) { if (window.confirm("Hapus agenda ini?")) { deleteAgenda(id); flash("Agenda dihapus."); } }

  return <div className="page-stack"><section className="page-heading"><div><span className="eyebrow">Calendar</span><h1>Agenda pribadi</h1><p>Jaga rencana tetap terlihat tanpa membuat kalender terasa penuh sesak.</p></div><button className="button primary" onClick={()=>{setEditing(null);setOpen(true);}}><Icon name="plus" size={17}/>Agenda</button></section>
  <section className="calendar-layout"><article className="card card-secondary calendar-hero"><span className="card-label">7 hari ke depan</span><h2>{pending.length} agenda menunggu</h2><p>{upcoming.length - pending.length > 0 ? `${upcoming.length - pending.length} agenda sudah selesai. ` : ""}Fokus pada hal yang benar-benar perlu muncul di radar.</p><div className="week-strip">{Array.from({length:7},(_,index)=>{const date=new Date(today.getTime());date.setDate(date.getDate()+index);const count=state.agendas.filter((item)=>new Date(item.startAt).toDateString()===date.toDateString()).length;return <div className={index===0?"day-box active":"day-box"} key={index}><small>{new Intl.DateTimeFormat("id-ID",{weekday:"short"}).format(date)}</small><strong>{date.getDate()}</strong>{count>0&&<i>{count}</i>}</div>})}</div></article>
  <article className="card card-secondary"><div className="card-head"><div><span className="card-label">Agenda manager</span><h2>Agenda berikutnya</h2></div></div><div className="agenda-filters"><input aria-label="Cari agenda" placeholder="Cari agenda" value={query} onChange={(e)=>setQuery(e.target.value)}/><select aria-label="Filter status agenda" value={status} onChange={(e)=>setStatus(e.target.value)}><option value="all">Semua status</option><option value="pending">Menunggu</option><option value="done">Selesai</option></select></div><div className="agenda-list">{upcoming.length?upcoming.map((item)=><div key={item.id} className={item.done?"agenda-item-wrap done":"agenda-item-wrap"}><button type="button" className="agenda-item" onClick={()=>toggleAgenda(item.id)}><span className="agenda-check">{item.done&&<Icon name="check" size={15}/>}</span><span className="agenda-date"><strong>{formatDate(item.startAt,{day:"2-digit"})}</strong><small>{formatDate(item.startAt,{month:"short"})}</small></span><span className="agenda-copy"><strong>{item.title}</strong><small>{formatTime(item.startAt)}{item.endAt ? `–${formatTime(item.endAt)}` : ""} · {item.category}{item.location ? ` · ${item.location}` : ""}</small>{item.description&&<em>{item.description}</em>}</span></button><div className="agenda-actions"><button type="button" onClick={()=>{setEditing(item);setOpen(true);}}>Edit</button><button type="button" className="danger-link" onClick={()=>remove(item.id)}>Hapus</button></div></div>):<div className="empty-inline"><Icon name="calendar"/><p>Belum ada agenda yang cocok.</p></div>}</div></article></section>
  <Modal open={open} onClose={()=>{setOpen(false);setEditing(null);}} title={editing ? "Edit agenda" : "Tambah agenda"} description="Jadwalkan komitmen penting tanpa membuat kalender menjadi padat."><form className="form-stack" onSubmit={submit}><label className="field"><span>Judul</span><input name="title" required placeholder="Contoh: Review keuangan" defaultValue={editing?.title ?? ""} autoFocus/></label><div className="form-grid"><label className="field"><span>Tanggal</span><input name="date" type="date" required defaultValue={editing ? datePart(editing.startAt) : datePart(today)}/></label><label className="field"><span>Mulai</span><input name="time" type="time" required defaultValue={editing ? timePart(editing.startAt) : "09:00"}/></label></div><div className="form-grid"><label className="field"><span>Selesai <small>(opsional)</small></span><input name="endTime" type="time" defaultValue={editing?.endAt ? timePart(editing.endAt) : ""}/></label><label className="field"><span>Kategori</span><select name="category" defaultValue={editing?.category ?? "Personal"}><option>Personal</option><option>Finance</option><option>Health</option><option>Work</option></select></label></div><label className="field"><span>Lokasi <small>(opsional)</small></span><input name="location" defaultValue={editing?.location ?? ""} placeholder="Contoh: Rumah"/></label><label className="field"><span>Deskripsi</span><textarea name="description" rows={3} defaultValue={editing?.description ?? ""}/></label><div className="modal-actions sticky-actions"><button type="button" className="button ghost" onClick={()=>{setOpen(false);setEditing(null);}}>Batal</button><button className="button primary">Simpan agenda</button></div></form></Modal>{message&&<div className="toast">{message}</div>}</div>;
}
