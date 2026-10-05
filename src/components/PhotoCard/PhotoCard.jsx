// Foto estilo polaroid con estrellas animadas. Anónima: solo muestra la hora.
// Si el usuario es organizador, la foto suma un menú de opciones (ocultar, descargar, eliminar).
import {useState,useEffect,useRef} from "react";
import {act} from "../../store.js";
import {downloadPhoto} from "../../download.js";
import "./PhotoCard.css";
export const hora=t=>new Date(t).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"});
export const whoIs=(ev,p)=>(ev.members||[]).find(m=>m.id===p.uid)?.name||"";
// El número sube/baja de a uno hasta llegar al valor real (se nota también cuando otros votan al mismo tiempo)
function useCount(target){const [n,setN]=useState(target);
 useEffect(()=>{if(n===target)return;const t=setTimeout(()=>setN(n+(target>n?1:-1)),Math.min(120,600/Math.abs(target-n)));return()=>clearTimeout(t)},[n,target]);return n}
export function StarBtn({p,voted,onVote}){
 const [boom,setBoom]=useState(0),[busy,setBusy]=useState(false),[opt,setOpt]=useState(null);
 useEffect(()=>{setOpt(null)},[p.stars,voted]); // el servidor ya confirmó el voto
 const on=opt?opt.v:voted,shown=useCount(opt?opt.s:p.stars);
 // Respuesta inmediata (+1 / -1) y bloqueo mientras se guarda, para que no se pueda spamear el botón
 const click=async e=>{e.stopPropagation();if(busy)return;const add=!on;if(add)setBoom(b=>b+1);setBusy(true);setOpt({v:add,s:Math.max(0,p.stars+(add?1:-1))});
  try{await onVote(p.id)}finally{setBusy(false);setTimeout(()=>setOpt(null),1500)}};
 return(<button className={"pc-st"+(on?" on":"")} onClick={click} aria-pressed={on}>⭐ <b key={shown}>{shown}</b>{boom>0&&<i key={boom} className="pc-burst">✨ ⭐ ✨</i>}</button>)}
// Menú "⋯" del organizador (se usa en la galería y en la lista de cada desafío)
export function AdminMenu({p,code,who}){
 const [o,setO]=useState(false),ref=useRef();
 useEffect(()=>{if(!o)return;const f=e=>{if(!ref.current?.contains(e.target))setO(false)};document.addEventListener("pointerdown",f);return()=>document.removeEventListener("pointerdown",f)},[o]);
 const run=fn=>{setO(false);fn()};
 return(<div className="pc-am" ref={ref} onClick={e=>e.stopPropagation()}>
  <button className="pc-dots" onClick={()=>setO(!o)} aria-label="Opciones de administrador">⋯</button>
  {o&&<div className="pc-menu glass"><small className="pc-who">👤 {who||"Anónimo"}</small>
   <button onClick={()=>run(()=>act.hide(code,p.id))}>{p.hidden?"👁 Mostrar a invitados":"🙈 Ocultar a invitados"}</button>
   <button onClick={()=>run(()=>downloadPhoto(p))}>⬇️ Descargar foto</button>
   <button className="dng" onClick={()=>run(()=>confirm("¿Eliminar esta foto para siempre?")&&act.del(code,p.id))}>🗑 Eliminar</button></div>}</div>)}
export default function PhotoCard({p,voted,onVote,onOpen,i=0,admin,code,who}){
 return(<figure className={"pc"+(p.hidden?" hid":"")} style={{animationDelay:i*60+"ms"}} onClick={()=>onOpen(p)}>
 <div className="pc-im"><img src={p.src} alt="Foto del evento" loading="lazy"/>{p.hidden&&<span className="pc-badge">Oculta</span>}{admin&&<AdminMenu p={p} code={code} who={who}/>}</div>
 <figcaption><StarBtn p={p} voted={voted} onVote={onVote}/><time>{hora(p.t)}</time></figcaption></figure>)}
