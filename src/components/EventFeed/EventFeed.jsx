// Muro del evento: header + timer, galería masonry, fullscreen y subida de fotos
import {useState,useEffect,useRef} from "react";
import {act,me,sample,shrink} from "../../store.js";
import PhotoCard,{StarBtn,hora,whoIs} from "../PhotoCard/PhotoCard.jsx";
import "./EventFeed.css";
export function useCountdown(end){const [n,setN]=useState(Date.now());useEffect(()=>{const i=setInterval(()=>setN(Date.now()),1000);return()=>clearInterval(i)},[]);
 const d=Math.max(0,end-n),p=x=>String(x).padStart(2,"0");return`${p(Math.floor(d/36e5))}:${p(Math.floor(d/6e4)%60)}:${p(Math.floor(d/1e3)%60)}`}
export default function EventFeed({ev,onBack,upCh,clearUp,admin}){
 const [open,setOpen]=useState(null),[sheet,setSheet]=useState(false),[busy,setBusy]=useState(false),file=useRef(),cam=useRef(),t=useCountdown(ev.end);
 useEffect(()=>{if(upCh)setSheet(true)},[upCh]);
 const vis=ev.photos.filter(p=>!p.hidden),photos=admin?ev.photos:vis,cur=open&&photos.find(p=>p.id===open);
 const vote=id=>act.vote(ev.code,id);
 const add=async src=>{setBusy(true);await new Promise(r=>setTimeout(r,1100));act.addPhoto(ev.code,src,upCh);setBusy(false);setSheet(false);clearUp()};
 const close=()=>{setSheet(false);clearUp()};
 const openSheet=()=>ev.active?setSheet(true):alert("El evento está cerrado.");
 return(<div><header className="ef-h"><button className="ef-back" onClick={onBack} aria-label="Salir">←</button><div><h2>{ev.name}</h2><small>{vis.length} fotos · {ev.guests.length} invitados{!ev.active&&" · cerrado"}</small></div><span className="ef-t">⏱ {t}</span></header>
 <div className="ef-stats glass"><div><b>{vis.length}</b>Fotos</div><div><b>{vis.reduce((a,p)=>a+p.stars,0)}</b>Estrellas</div><div><b>{ev.guests.length}</b>Invitados</div></div>
 {photos.length?<div className="ef-grid">{photos.map((p,i)=><PhotoCard key={p.id} i={i} p={p} voted={p.voters.includes(me)} onVote={vote} onOpen={p=>setOpen(p.id)} admin={admin} code={ev.code} who={admin?whoIs(ev,p):""}/>)}</div>:<p className="empty">Todavía no hay fotos. ¡Subí la primera!</p>}
 <button className="ef-fab" onClick={openSheet} aria-label="Subir foto">+</button>
 {cur&&<div className="ef-fs" onClick={()=>setOpen(null)}><div className="ef-big glass" onClick={e=>e.stopPropagation()}><img src={cur.src} alt=""/><div><small>Subida a las {hora(cur.t)} · Anónima</small><StarBtn p={cur} voted={cur.voters.includes(me)} onVote={vote}/></div><button className="btn ghost sm" onClick={()=>setOpen(null)}>Cerrar</button></div></div>}
 {sheet&&<div className="ef-fs" onClick={close}><div className="ef-big glass" onClick={e=>e.stopPropagation()}><h3>Subir foto{upCh?" al desafío":""}</h3><small>Se publica sin tu nombre.</small>
 {busy?<div className="ef-ld"/>:<><input ref={file} type="file" accept="image/*" hidden onChange={async e=>e.target.files[0]&&add(await shrink(e.target.files[0]))}/><input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={async e=>e.target.files[0]&&add(await shrink(e.target.files[0]))}/>
 <button className="btn" onClick={()=>cam.current.click()}>📸 Sacar foto ahora</button><button className="btn ghost" onClick={()=>file.current.click()}>🖼 Elegir de la galería</button><button className="btn ghost" onClick={()=>add(sample())}>✨ Usar foto de muestra</button></>}</div></div>}</div>)}
