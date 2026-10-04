// Ingreso por QR simulado (se "detecta" solo) o código manual
import {useState,useEffect} from "react";
import {act,useDB} from "../../store.js";
import "./EventLogin.css";
export default function EventLogin({onJoin,onBack}){
 const [mode,setMode]=useState("qr"),[val,setVal]=useState(""),[err,setErr]=useState(""),[found,setFound]=useState(false);
 const events=Object.values(useDB().events);
 const join=async c=>{const r=await act.join(c);if(r==="nofound")return setErr("Ese código no existe. Revisalo con el organizador.");if(r==="closed")return setErr("Este evento está cerrado por el organizador.");onJoin(r)};
 useEffect(()=>{if(mode!=="qr")return;setFound(false);const a=setTimeout(()=>setFound(true),2200),b=setTimeout(()=>{const e=events.find(x=>x.active);e?join(e.code):setMode("manual")},3600);return()=>{clearTimeout(a);clearTimeout(b)}},[mode]);
 return(<section className="lg"><div className="lg-h"><button className="lg-back" onClick={onBack} aria-label="Volver">←</button><div><h2>Unirse al evento</h2><small>Escaneá el QR o ingresá el código</small></div></div>
 <div className="lg-tabs glass"><button className={mode==="qr"?"on":""} onClick={()=>setMode("qr")}>📷 Escanear QR</button><button className={mode==="manual"?"on":""} onClick={()=>setMode("manual")}>⌨️ Código manual</button></div>
 {mode==="qr"?<div className="lg-qr"><div className="lg-frame"><div className="lg-line"/></div><p>Apuntá la cámara al código QR del evento</p>{found&&<span className="lg-pill glass">QR detectado · Uniéndose automáticamente...</span>}</div>
 :<form className="glass lg-card" onSubmit={e=>{e.preventDefault();join(val)}}><b>Código del evento</b><small>Ingresá el código que te compartió el organizador</small>
 <input className="input lg-in" placeholder="Ej: ESTRELLA2026" value={val} onChange={e=>{setVal(e.target.value);setErr("")}} autoFocus/><p className="lg-err">{err}</p>
 <button className="btn" disabled={!val.trim()}>Unirse →</button><small>Eventos recientes:</small><div>{events.map(e=><span key={e.code} className="lg-chip" onClick={()=>setVal(e.code)}>{e.code}</span>)}</div></form>}</section>)}
