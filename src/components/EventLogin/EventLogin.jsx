// Ingreso: QR con cámara real (pide permiso), código manual, y luego el nombre del invitado
import {useState,useEffect,useRef} from "react";
import jsQR from "jsqr";
import {act,savedName} from "../../store.js";
import "./EventLogin.css";
const MSG={nofound:"Ese código no existe. Revisalo con el organizador.",closed:"Este evento está cerrado por el organizador.",expired:"Este evento ya terminó.",blocked:"El organizador no te permitió entrar a este evento."};
const parse=t=>{try{return(new URL(t).searchParams.get("code")||"").toUpperCase()}catch{return t.trim().toUpperCase()}};
const recent=()=>{try{return JSON.parse(localStorage.getItem("estrellometro:recent"))||[]}catch{return[]}};
export default function EventLogin({onJoin,onBack,initialCode}){
 const [mode,setMode]=useState(initialCode?"manual":"qr"),[val,setVal]=useState(initialCode||""),[err,setErr]=useState(""),[pend,setPend]=useState(null),[name,setName]=useState(savedName()),[cam,setCam]=useState("idle"),[retry,setRetry]=useState(0),[busy,setBusy]=useState(false),vid=useRef();
 const go=async c=>{setBusy(true);const r=await act.check(c);setBusy(false);if(MSG[r]){setErr(MSG[r]);setVal(c||"");setMode("manual");return}setErr("");setPend(r)};
 useEffect(()=>{if(initialCode)go(initialCode)},[]);
 // Cámara: el navegador muestra el pedido de permiso al abrir la pestaña "Escanear QR"
 useEffect(()=>{if(mode!=="qr"||pend)return;let stream,timer,stop=false;
  (async()=>{if(!navigator.mediaDevices?.getUserMedia){setCam("nosupport");return}
   setCam("asking");
   try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});
    if(stop){stream.getTracks().forEach(t=>t.stop());return}
    const v=vid.current;v.srcObject=stream;await v.play();setCam("on");
    const c=document.createElement("canvas"),x=c.getContext("2d",{willReadFrequently:true});
    const tick=()=>{if(stop)return;
     if(v.videoWidth){const k=Math.min(1,640/v.videoWidth);c.width=v.videoWidth*k;c.height=v.videoHeight*k;x.drawImage(v,0,0,c.width,c.height);
      const r=jsQR(x.getImageData(0,0,c.width,c.height).data,c.width,c.height);
      if(r?.data){const code=parse(r.data);if(code){stop=true;go(code);return}}}
     timer=setTimeout(tick,250)};tick()
   }catch(e){setCam(["NotAllowedError","SecurityError","PermissionDeniedError"].includes(e.name)?"denied":"nosupport")}})();
  return()=>{stop=true;clearTimeout(timer);stream?.getTracks().forEach(t=>t.stop())}},[mode,pend,retry]);
 const enter=async e=>{e.preventDefault();setBusy(true);const r=await act.join(pend,name);setBusy(false);
  if(MSG[r]){setErr(MSG[r]);setPend(null);setMode("manual");return}
  try{localStorage.setItem("estrellometro:recent",JSON.stringify([r,...recent().filter(x=>x!==r)].slice(0,5)))}catch{}
  onJoin(r)};
 if(pend)return(<section className="lg"><div className="lg-h"><button className="lg-back" onClick={()=>{setPend(null);setErr("")}} aria-label="Volver">←</button><div><h2>¿Cómo te llamás?</h2><small>Evento {pend}</small></div></div>
  <form className="glass lg-card" onSubmit={enter}><b>Tu nombre</b><small>Lo ve solo el organizador, para confirmar que estás en la lista de invitados. Tus fotos siguen siendo anónimas para el resto.</small>
  <input className="input lg-nm" placeholder="Ej: Martina Gómez" value={name} maxLength={40} autoFocus onChange={e=>setName(e.target.value)}/><p className="lg-err">{err}</p>
  <button className="btn" disabled={busy||name.trim().length<2}>{busy?"Entrando...":"Entrar al evento →"}</button></form></section>);
 return(<section className="lg"><div className="lg-h"><button className="lg-back" onClick={onBack} aria-label="Volver">←</button><div><h2>Unirse al evento</h2><small>Escaneá el QR o ingresá el código</small></div></div>
 <div className="lg-tabs glass"><button className={mode==="qr"?"on":""} onClick={()=>{setMode("qr");setErr("")}}>📷 Escanear QR</button><button className={mode==="manual"?"on":""} onClick={()=>setMode("manual")}>⌨️ Código manual</button></div>
 {mode==="qr"?<div className="lg-qr"><div className="lg-frame"><video ref={vid} playsInline muted/>{cam==="on"&&<div className="lg-line"/>}
  {cam==="asking"&&<div className="lg-msg">Aceptá el permiso de cámara que te muestra el navegador…</div>}
  {cam==="denied"&&<div className="lg-msg"><span>Necesitamos permiso para usar la cámara. Si lo bloqueaste, habilitalo en los ajustes del navegador.</span><button className="btn sm" onClick={()=>setRetry(r=>r+1)}>Permitir cámara</button></div>}
  {cam==="nosupport"&&<div className="lg-msg">No se pudo abrir la cámara. En el celular hace falta abrir la página con https. Mientras tanto, usá el código manual.</div>}</div>
  <p>Apuntá la cámara al código QR del evento</p></div>
 :<form className="glass lg-card" onSubmit={e=>{e.preventDefault();go(val)}}><b>Código del evento</b><small>Ingresá el código que te compartió el organizador</small>
 <input className="input lg-in" placeholder="Ej: BODA2026" value={val} maxLength={14} onChange={e=>{setVal(e.target.value.toUpperCase());setErr("")}} autoFocus/><p className="lg-err">{err}</p>
 <button className="btn" disabled={!val.trim()||busy}>{busy?"Buscando...":"Continuar →"}</button>
 {recent().length>0&&<><small>Tus eventos recientes:</small><div>{recent().map(c=><span key={c} className="lg-chip" onClick={()=>setVal(c)}>{c}</span>)}</div></>}</form>}</section>)}
