// Foto estilo polaroid con estrellas animadas. Anónima: solo muestra la hora.
// Si el usuario es organizador, la foto suma un menú de opciones (ocultar, descargar, eliminar).
import {useState,useEffect,useRef} from "react";
import {act} from "../../store.js";
import {downloadPhoto} from "../../download.js";
import "./PhotoCard.css";
export const hora=t=>new Date(t).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"});
export function StarBtn({p,voted,onVote}){
 const [boom,setBoom]=useState(0);
 return(<button className={"pc-st"+(voted?" on":"")} onClick={e=>{e.stopPropagation();if(!voted)setBoom(b=>b+1);onVote(p.id)}}>⭐ <b key={p.stars}>{p.stars}</b>{boom>0&&<i key={boom} className="pc-burst">✨ ⭐ ✨</i>}</button>)}
// Menú "⋯" del organizador (se usa en la galería y en la lista de cada desafío)
export function AdminMenu({p,code}){
 const [o,setO]=useState(false),ref=useRef();
 useEffect(()=>{if(!o)return;const f=e=>{if(!ref.current?.contains(e.target))setO(false)};document.addEventListener("pointerdown",f);return()=>document.removeEventListener("pointerdown",f)},[o]);
 const run=fn=>{setO(false);fn()};
 return(<div className="pc-am" ref={ref} onClick={e=>e.stopPropagation()}>
  <button className="pc-dots" onClick={()=>setO(!o)} aria-label="Opciones de administrador">⋯</button>
  {o&&<div className="pc-menu glass">
   <button onClick={()=>run(()=>act.hide(code,p.id))}>{p.hidden?"👁 Mostrar a invitados":"🙈 Ocultar a invitados"}</button>
   <button onClick={()=>run(()=>downloadPhoto(p))}>⬇️ Descargar foto</button>
   <button className="dng" onClick={()=>run(()=>confirm("¿Eliminar esta foto para siempre?")&&act.del(code,p.id))}>🗑 Eliminar</button></div>}</div>)}
export default function PhotoCard({p,voted,onVote,onOpen,i=0,admin,code}){
 return(<figure className={"pc"+(p.hidden?" hid":"")} style={{animationDelay:i*60+"ms"}} onClick={()=>onOpen(p)}>
 <div className="pc-im"><img src={p.src} alt="Foto del evento" loading="lazy"/>{p.hidden&&<span className="pc-badge">Oculta</span>}{admin&&<AdminMenu p={p} code={code}/>}</div>
 <figcaption><StarBtn p={p} voted={voted} onVote={onVote}/><time>{hora(p.t)}</time></figcaption></figure>)}
