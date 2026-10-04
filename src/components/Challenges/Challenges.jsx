// Invitados: ven los desafíos y participan. Organizador: crea/edita desafíos y modera las fotos de cada uno.
import {useState} from "react";
import {act} from "../../store.js";
import {AdminMenu} from "../PhotoCard/PhotoCard.jsx";
import "./Challenges.css";
function AdminCard({c,ev}){
 const [ed,setEd]=useState(false),fs=ev.photos.filter(p=>p.ch===c.id);
 const upd=(k,v)=>act.saveCh(ev.code,ev.challenges.map(x=>x.id===c.id?{...x,[k]:v}:x));
 return(<article className="ch-card ch-adm glass"><div className="ch-top"><div className="ch-e">{c.e}</div>
  <div className="ch-tx">{ed?<><input className="input" defaultValue={c.e} maxLength={4} onBlur={e=>upd("e",e.target.value)}/><input className="input" defaultValue={c.t} onBlur={e=>upd("t",e.target.value)}/><input className="input" defaultValue={c.d} placeholder="Descripción" onBlur={e=>upd("d",e.target.value)}/></>:<><b>{c.t}</b><p>{c.d||"Sin descripción"}</p></>}</div>
  <div className="ch-ac"><button onClick={()=>setEd(!ed)} aria-label={ed?"Listo":"Editar desafío"}>{ed?"✓":"✏️"}</button><button onClick={()=>confirm("¿Eliminar este desafío? Sus fotos quedan en la galería.")&&act.saveCh(ev.code,ev.challenges.filter(x=>x.id!==c.id))} aria-label="Eliminar desafío">🗑</button></div></div>
  <div className="ch-ph"><small>📷 {fs.length} {fs.length===1?"foto":"fotos"}</small>
  {fs.length?<div className="ch-grid">{fs.map(p=><div key={p.id} className={"ch-th"+(p.hidden?" hid":"")}><img src={p.src} alt=""/>{p.hidden&&<i>Oculta</i>}<AdminMenu p={p} code={ev.code}/></div>)}</div>:<small>Todavía nadie subió fotos a este desafío.</small>}</div></article>)}
export default function Challenges({ev,admin,onPick}){
 const [n,setN]=useState({e:"⭐",t:"",d:""}),list=ev.challenges||[];
 const add=e=>{e.preventDefault();if(!n.t.trim())return;act.saveCh(ev.code,[...list,{id:Date.now(),e:n.e.trim()||"⭐",t:n.t.trim(),d:n.d.trim()}]);setN({e:"⭐",t:"",d:""})};
 if(admin)return(<div><form className="ch-new glass" onSubmit={add}><b>Crear desafío</b>
  <div className="row"><input className="input" value={n.e} maxLength={4} aria-label="Emoji" onChange={e=>setN({...n,e:e.target.value})}/><input className="input" placeholder="Título (ej: Selfie con los novios)" value={n.t} onChange={e=>setN({...n,t:e.target.value})}/></div>
  <input className="input" placeholder="Descripción (opcional)" value={n.d} onChange={e=>setN({...n,d:e.target.value})}/><button className="btn sm" disabled={!n.t.trim()}>＋ Agregar desafío</button></form>
  {list.length?list.map(c=><AdminCard key={c.id} c={c} ev={ev}/>):<p className="empty">Todavía no creaste desafíos. Los invitados los ven en esta pestaña.</p>}</div>);
 const cnt=id=>ev.photos.filter(p=>p.ch===id&&!p.hidden).length;
 return(<div><div className="ch-ban glass">⚡ Participá en los desafíos y subí una foto</div>
 {list.length?list.map(c=><article key={c.id} className="ch-card glass"><div className="ch-e">{c.e}</div><div><b>{c.t}</b><p>{c.d}</p><div className="ch-r"><small>👥 {cnt(c.id)} participantes</small><button className="btn sm" disabled={!ev.active} onClick={()=>onPick(c)}>Participar</button></div></div></article>):<p className="empty">El organizador todavía no cargó consignas.</p>}</div>)}
