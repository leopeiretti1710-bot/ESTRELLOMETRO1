// Acceso del organizador: crear un evento nuevo (con código y clave propios) o entrar a uno ya creado
import {useState} from "react";
import {act} from "../../store.js";
import "./OrganizerAccess.css";
const clean=v=>v.toUpperCase().replace(/[^A-Z0-9-]/g,"");
export default function OrganizerAccess({onEnter,onBack}){
 const [mode,setMode]=useState("new"),[f,setF]=useState({name:"",code:"",pin:"",h:4}),[err,setErr]=useState(""),[busy,setBusy]=useState(false),[sp,setSp]=useState(false);
 const set=(k,v)=>{setF(x=>({...x,[k]:v}));setErr("")};
 const ok=mode==="new"?f.name.trim()&&f.code.length>=4&&f.pin.length>=4:f.code&&f.pin;
 const submit=async e=>{e.preventDefault();setBusy(true);
  try{onEnter(mode==="new"?await act.create(f.name.trim(),+f.h,f.code,f.pin):await act.adminLogin(f.code,f.pin))}
  catch(x){setErr(x.message)}
  setBusy(false)};
 return(<section className="oa"><div className="oa-h"><button className="oa-back" onClick={onBack} aria-label="Volver">←</button><div><h2>Panel del organizador</h2><small>Creá tu evento o entrá a uno existente</small></div></div>
 <div className="oa-tabs glass"><button className={mode==="new"?"on":""} onClick={()=>{setMode("new");setErr("")}}>✨ Crear evento</button><button className={mode==="old"?"on":""} onClick={()=>{setMode("old");setErr("")}}>🔑 Ya tengo un evento</button></div>
 <form className="glass oa-card" onSubmit={submit}>
  {mode==="new"&&<><label>Nombre del evento<input className="input" placeholder="Ej: Boda Sofía & Lucas" value={f.name} onChange={e=>set("name",e.target.value)}/></label>
  <label>Duración<select className="input" value={f.h} onChange={e=>set("h",e.target.value)}>{[3,4,6,12,24].map(x=><option key={x} value={x}>{x} horas</option>)}</select></label></>}
  <label>{mode==="new"?"Código del evento (lo elegís vos)":"Código del evento"}<input className="input oa-code" placeholder="Ej: BODA-SOFI26" maxLength={14} value={f.code} onChange={e=>set("code",clean(e.target.value))}/></label>
  {mode==="new"&&<small>De 4 a 14 letras, números o guiones. Es el que van a escribir los invitados.</small>}
  <label>Clave de organizador{mode==="new"?" (mínimo 4 caracteres)":""}<span className="oa-pw"><input className="input" type={sp?"text":"password"} autoComplete="off" value={f.pin} onChange={e=>set("pin",e.target.value)}/><button type="button" onClick={()=>setSp(!sp)} aria-label="Mostrar u ocultar clave">{sp?"🙈":"👁"}</button></span></label>
  {mode==="new"&&<small>Guardala: la necesitás para volver a entrar como organizador.</small>}
  <p className="oa-err">{err}</p>
  <button className="btn" disabled={!ok||busy}>{busy?"Un momento...":mode==="new"?"Crear evento y entrar":"Entrar como organizador"}</button></form></section>)}
