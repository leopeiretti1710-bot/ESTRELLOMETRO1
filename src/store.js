// Store conectado a Firebase Firestore (tiempo real).
// events/{CODE} (datos) + events/{CODE}/photos/{id} + events/{CODE}/members/{uid} (invitados con nombre).
// Al vencer el contador, cualquier dispositivo con la app abierta borra el evento y todo su contenido (purge).
import {useSyncExternalStore} from "react";
import {collection,doc,getDoc,getDocs,setDoc,addDoc,updateDoc,deleteDoc,onSnapshot,query,orderBy,runTransaction,arrayUnion,writeBatch} from "firebase/firestore";
import {db} from "./firebase.js";
const ME="estrellometro:me";
export const me=(()=>{let m=localStorage.getItem(ME);if(!m){m=Math.random().toString(36).slice(2);localStorage.setItem(ME,m)}return m})();
const SAMPLES=[["💐","#f6c56b","#7c3a2a"],["🎆","#3b4a8f","#0b1020"],["💃","#c4488f","#3a1c5e"],["🥂","#e8b04a","#4a2a1a"],["🎂","#f08a9b","#5a2a6a"],["📸","#4a7fd6","#1b2a5a"],["💍","#a78bfa","#2a1f5a"],["🎶","#2fb7a3","#13365a"]];
const art=(e,a,b,h=480)=>"data:image/svg+xml;utf8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 ${h}"><defs><radialGradient id="g" cx=".3" cy=".2"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient></defs><rect width="400" height="${h}" fill="url(#g)"/><text x="200" y="${h/2+45}" font-size="140" text-anchor="middle">${e}</text></svg>`);
export const sample=()=>{const s=SAMPLES[Math.floor(Math.random()*SAMPLES.length)];return art(...s,400+Math.floor(Math.random()*160))};
const CH=()=>[{id:1,e:"😂",t:"Sacá la foto más divertida",d:"Capturá el momento más gracioso"},{id:2,e:"💕",t:"Foto más romántica",d:"Lo mejor del amor de esta noche"},{id:3,e:"🤳",t:"Selfie grupal",d:"Juntá a toda la mesa"},{id:4,e:"💃",t:"Capturá el mejor baile",d:"Pasos, giros y pista llena"}];
export const shrink=file=>new Promise(res=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,720/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=im.width*k;c.height=im.height*k;c.getContext("2d").drawImage(im,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",.72))};im.src=r.result};r.readAsDataURL(file)});
// Hash simple (determinístico, funciona también por http). Ofusca la clave en Firestore, NO es seguridad fuerte.
const hash=t=>{let a=0xdeadbeef,b=0x41c6ce57;for(let i=0;i<t.length;i++){const c=t.charCodeAt(i);a=Math.imul(a^c,2654435761);b=Math.imul(b^c,1597334677)}a=Math.imul(a^(a>>>16),2246822507)^Math.imul(b^(b>>>13),3266489909);b=Math.imul(b^(b>>>16),2246822507)^Math.imul(a^(a>>>13),3266489909);return(4294967296*(2097151&b)+(a>>>0)).toString(36)};
const pinHash=(code,pin)=>hash(code+"|"+pin);
const keep=(c,p)=>{try{localStorage.setItem("estrellometro:pin:"+c,p)}catch{}};
export const savedPin=c=>{try{return localStorage.getItem("estrellometro:pin:"+c)||""}catch{return""}};
export const savedName=()=>{try{return localStorage.getItem("estrellometro:name")||""}catch{return""}};
const ev=c=>doc(db,"events",c),ph=(c,id)=>doc(db,"events",c,"photos",id);
// Estrellas = base + cantidad de votantes. Así el número nunca puede desfasarse de la lista de votos.
// base: 0 para fotos reales; para las 8 fotos de demo (ids s0..s7) es su puntaje inicial.
const baseOf=(id,x)=>x.base??(/^s\d$/.test(id)?Math.max(0,(x.stars||0)-(x.voters||[]).length):0);
const norm=d=>{const x=d.data(),v=x.voters||[];return{id:d.id,...x,voters:v,stars:baseOf(d.id,x)+v.length}};
const inflight=new Set();

/* ---- Estado local alimentado por Firestore ---- */
let cache={events:{},loaded:false};const subs=new Set(),extra={};
const set=fn=>{cache=fn(cache);subs.forEach(f=>f())};
const merge=(c,code)=>c.events[code]?{...c,events:{...c.events,[code]:{...c.events[code],...extra[code]}}}:c;
export const useDB=()=>useSyncExternalStore(f=>(subs.add(f),()=>subs.delete(f)),()=>cache);
onSnapshot(collection(db,"events"),snap=>{set(c=>{const events={};snap.forEach(d=>{events[d.id]={...d.data(),photos:[],members:[],...extra[d.id]}});return{events,loaded:true}});sweep()},e=>console.error("Firestore events:",e));
// Fotos e invitados de UN evento en tiempo real (App.jsx lo llama al entrar). Devuelve el "unsubscribe".
export const watch=code=>{extra[code]={photos:[],members:[],...extra[code]};
 const a=onSnapshot(query(collection(db,"events",code,"photos"),orderBy("t","desc")),s=>{extra[code].photos=s.docs.map(norm);set(c=>merge(c,code))},e=>console.error("Firestore photos:",e));
 const b=onSnapshot(collection(db,"events",code,"members"),s=>{extra[code].members=s.docs.map(d=>({id:d.id,...d.data()})).sort((x,y)=>x.joinedAt-y.joinedAt);set(c=>merge(c,code))},e=>console.error("Firestore members:",e));
 return()=>{a();b()}};

/* ---- Borrado automático al vencer el contador ---- */
const running={},failed={};
// Primero se borra el evento (la regla solo lo permite si ya venció según el servidor) y después su contenido.
function purge(code){if(running[code])return running[code];if(failed[code]&&Date.now()-failed[code]<30000)return Promise.resolve();
 return running[code]=(async()=>{try{await deleteDoc(ev(code));
  for(const sub of["photos","members"]){const s=await getDocs(collection(db,"events",code,sub));
   for(let i=0;i<s.docs.length;i+=400){const b=writeBatch(db);s.docs.slice(i,i+400).forEach(d=>b.delete(d.ref));await b.commit()}}
  delete extra[code];delete failed[code]}catch(e){failed[code]=Date.now();console.warn("No se pudo borrar el evento",code,e.code||e)}finally{delete running[code]}})()}
function sweep(){Object.values(cache.events).forEach(e=>e.end&&Date.now()>=e.end&&purge(e.code))}
setInterval(sweep,4000);

/* ---- Acciones ---- */
const blocked=c=>!!cache.events[c]?.members?.some(m=>m.id===me&&m.blocked);
export const act={
 async create(name,hours,code,pin){code=(code||"").trim().toUpperCase();
  if(!name)throw new Error("Poné un nombre para el evento.");
  if(!(hours>0)||hours>720)throw new Error("Elegí una duración válida (hasta 30 días).");
  if(!/^[A-Z0-9-]{4,14}$/.test(code))throw new Error("El código debe tener de 4 a 14 letras, números o guiones.");
  if((pin||"").length<4)throw new Error("La clave debe tener al menos 4 caracteres.");
  if((await getDoc(ev(code))).exists())throw new Error("Ese código ya está en uso. Elegí otro.");
  await setDoc(ev(code),{code,name,active:true,end:Date.now()+hours*36e5,guests:[],guestList:[],challenges:[],adminHash:pinHash(code,pin)});keep(code,pin);return code},
 async adminLogin(code,pin){const c=(code||"").trim().toUpperCase(),s=await getDoc(ev(c));
  if(!s.exists())throw new Error("No existe un evento con ese código.");
  if(Date.now()>=s.data().end){purge(c);throw new Error("Ese evento ya terminó y se eliminó.")}
  if(s.data().adminHash!==pinHash(c,pin))throw new Error("Clave incorrecta.");keep(c,pin);return c},
 // Valida el código sin registrar a nadie: devuelve el código o "nofound" | "expired" | "closed"
 async check(code){const c=(code||"").trim().toUpperCase();if(!c)return"nofound";const s=await getDoc(ev(c));if(!s.exists())return"nofound";
  if(Date.now()>=s.data().end){purge(c);return"expired"}if(!s.data().active)return"closed";return c},
 // Registra al invitado con su nombre (o devuelve "blocked" si el organizador lo bloqueó)
 async join(code,name){const c=await act.check(code);if(["nofound","expired","closed"].includes(c))return c;
  const m=doc(db,"events",c,"members",me),s=await getDoc(m);name=name.trim();
  if(s.exists()&&s.data().blocked)return"blocked";
  s.exists()?await updateDoc(m,{name}):await setDoc(m,{name,joinedAt:Date.now(),blocked:false});
  await updateDoc(ev(c),{guests:arrayUnion(me)});try{localStorage.setItem("estrellometro:name",name)}catch{}return c},
 addPhoto:(c,src,ch)=>blocked(c)?Promise.resolve():addDoc(collection(db,"events",c,"photos"),{src,t:Date.now(),stars:0,voters:[],hidden:false,ch:ch??null,uid:me}),
 vote:(c,id)=>{if(!cache.events[c]?.active||blocked(c)||inflight.has(id))return Promise.resolve();inflight.add(id);
  return runTransaction(db,async t=>{const r=ph(c,id),s=await t.get(r);if(!s.exists())return;const x=s.data(),v=x.voters||[],b=baseOf(id,x),nv=v.includes(me)?v.filter(u=>u!==me):[...v,me];
   t.update(r,{voters:nv,stars:b+nv.length,base:b})}).catch(e=>console.warn("Voto no registrado",e)).finally(()=>inflight.delete(id))},
 setActive:(c,v)=>updateDoc(ev(c),{active:v}),
 hide:(c,id)=>updateDoc(ph(c,id),{hidden:!cache.events[c].photos.find(p=>p.id===id)?.hidden}),
 del:(c,id)=>deleteDoc(ph(c,id)),
 saveCh:(c,list)=>updateDoc(ev(c),{challenges:list}),
 saveList:(c,names)=>updateDoc(ev(c),{guestList:names}),
 block:(c,uid,v)=>updateDoc(doc(db,"events",c,"members",uid),{blocked:v}),
 async delPhotosOf(c,uid){const b=writeBatch(db);cache.events[c].photos.filter(p=>p.uid===uid).forEach(p=>b.delete(ph(c,p.id)));await b.commit()}};

/* ---- Evento de demo (clave 1234). Se vuelve a crear solo si ya venció ---- */
(async()=>{try{const id="ESTRELLA2026",s=await getDoc(ev(id)),adminHash=pinHash(id,"1234");
 if(s.exists()){if(Date.now()<s.data().end){if(!s.data().adminHash)await updateDoc(ev(id),{adminHash});return}await purge(id)}
 await setDoc(ev(id),{code:id,name:"Boda Sofía & Lucas 💍",active:true,end:Date.now()+3*36e5,guests:[],guestList:[],challenges:CH(),adminHash});
 await Promise.all(SAMPLES.map((s,i)=>setDoc(ph(id,"s"+i),{src:art(...s,[480,420,520,440,500,460,430,490][i]),t:Date.now()-i*17*6e4,stars:[47,38,33,29,24,19,15,9][i],base:[47,38,33,29,24,19,15,9][i],voters:[],hidden:false,ch:null,uid:null})))}catch(e){console.error("Seed demo:",e)}})();
