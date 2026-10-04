// Panel Admin: estado del evento, código, clave y acciones (descargar fotos / estadísticas detalladas)
import {useState} from "react";
import {savedPin,act} from "../../store.js";
import {downloadAll} from "../../download.js";
import "./OrganizerDashboard.css";
function QR({code}){let h=0;for(const c of code)h=(h*31+c.charCodeAt(0))>>>0;const cells=[];
 for(let y=0;y<11;y++)for(let x=0;x<11;x++){h=(h*1664525+1013904223)>>>0;const f=(x<3||x>7)&&(y<3||y>7)&&!(x>7&&y>7);cells.push(<b key={x+"-"+y} className={f||(h>>>29)>3?"on":""}/>)}
 return<div className="od-qr">{cells}</div>}
const Bars=({rows})=>{const m=Math.max(1,...rows.map(r=>r[1]));return rows.map(([l,n])=><div className="od-bar" key={l}><span>{l}</span><div><i style={{width:Math.max(n?4:0,n/m*100)+"%"}}/></div><em>{n}</em></div>)};
function Stats({ev,onClose}){
 const ph=ev.photos,vis=ph.filter(p=>!p.hidden),stars=ph.reduce((a,p)=>a+p.stars,0),top=[...vis].sort((a,b)=>b.stars-a.stars).slice(0,3),ch=ev.challenges||[],g=ev.guests.length;
 const rows=[...ch.map(c=>[c.e+" "+c.t,ph.filter(p=>p.ch===c.id).length]),["Sin desafío",ph.filter(p=>!ch.some(c=>c.id===p.ch)).length]];
 const hrs={};ph.forEach(p=>{const h=new Date(p.t).getHours();hrs[h]=(hrs[h]||0)+1});
 const hr=Object.entries(hrs).sort((a,b)=>a[0]-b[0]).map(([h,n])=>[h+":00",n]);
 return(<div className="od-ov" onClick={onClose}><div className="od-md glass" onClick={e=>e.stopPropagation()}>
  <div className="od-top"><h2>Estadísticas detalladas</h2><button className="btn ghost sm" onClick={onClose}>Cerrar</button></div>
  <div className="od-st"><div><b>{ph.length}</b>Fotos totales</div><div><b>{ph.length-vis.length}</b>Ocultas</div><div><b>{stars}</b>Estrellas</div>
   <div><b>{ph.length?(stars/ph.length).toFixed(1):0}</b>⭐ por foto</div><div><b>{g}</b>Invitados</div><div><b>{g?(ph.length/g).toFixed(1):0}</b>Fotos por invitado</div></div>
  {top.length>0&&<><b>Fotos más votadas</b><div className="od-tp">{top.map((p,i)=><div key={p.id}><img src={p.src} alt=""/>{["🥇","🥈","🥉"][i]} ⭐ {p.stars}</div>)}</div></>}
  <b>Fotos por desafío</b><Bars rows={rows}/>
  {hr.length>0&&<><b>Actividad por hora</b><Bars rows={hr}/></>}</div></div>)}
export default function OrganizerDashboard({ev,onBack}){
 const [show,setShow]=useState(false),[modal,setModal]=useState(false),[busy,setBusy]=useState(false);
 if(!ev)return<div className="od"><p className="empty">Cargando evento...</p><button className="btn ghost sm" onClick={onBack}>← Salir</button></div>;
 const pin=savedPin(ev.code),ph=ev.photos,stars=ph.reduce((a,p)=>a+p.stars,0);
 const dl=async()=>{setBusy(true);await new Promise(r=>setTimeout(r,60));try{downloadAll(ph,ev.code)}finally{setBusy(false)}};
 return(<div className="od"><div className="od-top"><button className="btn ghost sm" onClick={onBack}>← Salir</button><h2>Panel · {ev.name}</h2></div>
 <div className="od-g"><section className="glass od-c"><b>Estado del evento</b><div className="od-r"><small className={ev.active?"ok":"off"}>● {ev.active?"Activo · los invitados pueden unirse":"Cerrado · sin subidas ni votos"}</small>
 <button className={"od-sw"+(ev.active?" on":"")} onClick={()=>act.setActive(ev.code,!ev.active)} aria-label="Activar o desactivar"/></div>
 <div className="od-st"><div><b>{ph.length}</b>Fotos</div><div><b>{ev.guests.length}</b>Invitados</div><div><b>{stars}</b>Estrellas</div></div></section>
 <section className="glass od-c od-q"><b>Código del evento</b><QR code={ev.code}/><h3>{ev.code}</h3><small>Compartí este código con los invitados (el QR es decorativo en este prototipo).</small></section>
 <section className="glass od-c"><b>Clave de organizador</b>
 {pin?<div className="od-pin"><code>{show?pin:"•".repeat(pin.length)}</code><button onClick={()=>setShow(!show)} aria-label="Mostrar u ocultar clave">{show?"🙈":"👁"}</button><button onClick={()=>{try{navigator.clipboard.writeText(pin)}catch{}}} aria-label="Copiar clave">📋</button></div>
 :<small>Esta clave no está guardada en este dispositivo. Usá la que elegiste al crear el evento.</small>}
 <small>Con ella entrás como organizador desde cualquier dispositivo. En la base de datos solo queda una versión cifrada; la clave visible se recuerda únicamente en este dispositivo.</small></section>
 <section className="glass od-c"><b>Acciones</b>
 <button className="od-act" disabled={!ph.length||busy} onClick={dl}><span>⬇️</span>{busy?"Preparando archivo...":"Descargar todas las fotos ("+ph.length+")"}<i>›</i></button>
 <button className="od-act" onClick={()=>setModal(true)}><span>📊</span>Ver estadísticas detalladas<i>›</i></button></section></div>
 {modal&&<Stats ev={ev} onClose={()=>setModal(false)}/>}</div>)}
