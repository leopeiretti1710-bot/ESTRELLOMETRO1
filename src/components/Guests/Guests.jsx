// Invitados (solo organizador): arma la lista de invitados y compara con quienes entraron al evento
import {useState} from "react";
import {act} from "../../store.js";
import "./Guests.css";
const norm=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();
// Coinciden si son iguales o si todas las palabras del nombre más corto (2 o más) están en el otro
const same=(a,b)=>{const x=norm(a),y=norm(b);if(!x||!y)return false;if(x===y)return true;const p=x.split(" "),q=y.split(" "),[s,l]=p.length<=q.length?[p,q]:[q,p];return s.length>1&&s.every(w=>l.includes(w))};
export default function Guests({ev}){
 const list=ev.guestList||[],mem=ev.members||[],[txt,setTxt]=useState(list.join("\n")),[f,setF]=useState("all"),[ok,setOk]=useState(false);
 const rows=mem.map(m=>({m,hit:list.find(n=>same(n,m.name)),n:ev.photos.filter(p=>p.uid===m.id).length}));
 const out=rows.filter(r=>list.length&&!r.hit),blk=rows.filter(r=>r.m.blocked),pend=list.filter(n=>!mem.some(m=>same(n,m.name)));
 const shown=f==="out"?out:f==="blk"?blk:rows;
 const save=async()=>{await act.saveList(ev.code,[...new Set(txt.split("\n").map(s=>s.trim()).filter(Boolean))]);setOk(true);setTimeout(()=>setOk(false),1800)};
 return(<div><h2 className="gs-t">Invitados</h2><div className="gs-g">
 <section className="glass gs-c"><b>Lista de invitados</b><small>Escribí un nombre por línea. Después se compara con los nombres que ponen los invitados al entrar.</small>
  <textarea className="input gs-ta" placeholder={"Martina Gómez\nLucas Pérez"} value={txt} onChange={e=>setTxt(e.target.value)}/>
  <button className="btn sm" onClick={save}>{ok?"✓ Guardada":"Guardar lista"}</button>
  {list.length>0&&<details className="gs-pend"><summary>Faltan por ingresar ({pend.length})</summary>{pend.length?pend.join(" · "):"¡Ya entraron todos!"}</details>}</section>
 <section className="glass gs-c"><div className="gs-sum"><div><b>{mem.length}</b>Ingresaron</div><div><b>{list.length?out.length:"–"}</b>Fuera de la lista</div><div><b>{blk.length}</b>Bloqueados</div></div>
  <div className="gs-f">{[["all","Todos"],["out","Fuera de la lista"],["blk","Bloqueados"]].map(([k,l])=><button key={k} className={f===k?"on":""} onClick={()=>setF(k)}>{l}</button>)}</div>
  {shown.length?shown.map(({m,hit,n})=><div key={m.id} className={"gs-row"+(m.blocked?" blk":"")}><div className="gs-i"><b>{m.name}</b>
   <small>{hit?<span className="gs-ok">✓ En la lista</span>:list.length?<span className="gs-warn">⚠ No figura en la lista</span>:"Sin lista cargada"} · 📷 {n}{m.blocked&&" · 🚫 Bloqueado"}</small></div>
   <button className={m.blocked?"":"dng"} onClick={()=>(m.blocked||confirm("¿Bloquear a "+m.name+"? No va a poder subir fotos ni votar."))&&act.block(ev.code,m.id,!m.blocked)}>{m.blocked?"Desbloquear":"Bloquear"}</button>
   <button disabled={!n} onClick={()=>confirm("¿Borrar las "+n+" fotos de "+m.name+"?")&&act.delPhotosOf(ev.code,m.id)}>🗑 Fotos</button></div>)
  :<p className="empty">{mem.length?"No hay invitados en este filtro.":"Todavía no entró nadie al evento."}</p>}</section></div></div>)}
