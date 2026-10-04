// Store conectado a Firebase Firestore. Misma API que la versión localStorage:
//   useDB() -> {events:{CODE:{...evento, photos:[...]}}}   act.* -> acciones (ahora async)
// Estructura:  events/{CODE}  (datos del evento)  +  events/{CODE}/photos/{id}  (una foto por documento,
// porque Firestore limita cada documento a 1 MB). Tiempo real vía onSnapshot.
import {useSyncExternalStore} from "react";
import {collection,doc,getDoc,setDoc,addDoc,updateDoc,deleteDoc,onSnapshot,query,orderBy,runTransaction,arrayUnion} from "firebase/firestore";
import {db} from "./firebase.js";
const ME="estrellometro:me";
export const me=(()=>{let m=localStorage.getItem(ME);if(!m){m=Math.random().toString(36).slice(2);localStorage.setItem(ME,m)}return m})();
const SAMPLES=[["💐","#f6c56b","#7c3a2a"],["🎆","#3b4a8f","#0b1020"],["💃","#c4488f","#3a1c5e"],["🥂","#e8b04a","#4a2a1a"],["🎂","#f08a9b","#5a2a6a"],["📸","#4a7fd6","#1b2a5a"],["💍","#a78bfa","#2a1f5a"],["🎶","#2fb7a3","#13365a"]];
const art=(e,a,b,h=480)=>"data:image/svg+xml;utf8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 ${h}"><defs><radialGradient id="g" cx=".3" cy=".2"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient></defs><rect width="400" height="${h}" fill="url(#g)"/><text x="200" y="${h/2+45}" font-size="140" text-anchor="middle">${e}</text></svg>`);
export const sample=()=>{const s=SAMPLES[Math.floor(Math.random()*SAMPLES.length)];return art(...s,400+Math.floor(Math.random()*160))};
const CH=()=>[{id:1,e:"😂",t:"Sacá la foto más divertida",d:"Capturá el momento más gracioso"},{id:2,e:"💕",t:"Foto más romántica",d:"Lo mejor del amor de esta noche"},{id:3,e:"🤳",t:"Selfie grupal",d:"Juntá a toda la mesa"},{id:4,e:"💃",t:"Capturá el mejor baile",d:"Pasos, giros y pista llena"}];
export const shrink=file=>new Promise(res=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,720/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=im.width*k;c.height=im.height*k;c.getContext("2d").drawImage(im,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",.72))};im.src=r.result};r.readAsDataURL(file)});

/* ---- Estado local alimentado por los listeners de Firestore ---- */
let cache={events:{}};const subs=new Set();
const set=fn=>{cache=fn(cache);subs.forEach(f=>f())};
export const useDB=()=>useSyncExternalStore(f=>(subs.add(f),()=>subs.delete(f)),()=>cache);
// Lista de eventos en tiempo real (conserva las fotos ya cargadas de cada uno)
onSnapshot(collection(db,"events"),snap=>set(c=>{const events={};snap.forEach(d=>{events[d.id]={...d.data(),photos:c.events[d.id]?.photos||[]}});return{events}}),e=>console.error("Firestore events:",e));
// Fotos de UN evento en tiempo real. App.jsx lo llama al entrar a un evento; devuelve el "unsubscribe".
export const watch=code=>onSnapshot(query(collection(db,"events",code,"photos"),orderBy("t","desc")),
 snap=>set(c=>({events:{...c.events,[code]:{...c.events[code],photos:snap.docs.map(d=>({id:d.id,...d.data()}))}}})),e=>console.error("Firestore photos:",e));

/* ---- Acciones (todas async; Firestore actualiza la UI al instante por caché local) ---- */
// Hash simple (determinístico, funciona también por http en la red local). Ofusca la clave en Firestore,
// pero NO es seguridad fuerte: para eso hace falta Firebase Auth + reglas (ver nota en la respuesta).
const hash=t=>{let a=0xdeadbeef,b=0x41c6ce57;for(let i=0;i<t.length;i++){const c=t.charCodeAt(i);a=Math.imul(a^c,2654435761);b=Math.imul(b^c,1597334677)}a=Math.imul(a^(a>>>16),2246822507)^Math.imul(b^(b>>>13),3266489909);b=Math.imul(b^(b>>>16),2246822507)^Math.imul(a^(a>>>13),3266489909);return(4294967296*(2097151&b)+(a>>>0)).toString(36)};
const pinHash=(code,pin)=>hash(code+"|"+pin);
// La clave en sí no se puede recuperar del hash, así que se recuerda solo en este dispositivo para poder mostrarla.
const keep=(c,p)=>{try{localStorage.setItem("estrellometro:pin:"+c,p)}catch{}};
export const savedPin=c=>{try{return localStorage.getItem("estrellometro:pin:"+c)||""}catch{return""}};
const ev=c=>doc(db,"events",c),ph=(c,id)=>doc(db,"events",c,"photos",id);
export const act={
 async create(name,hours,code,pin){code=(code||"").trim().toUpperCase();
  if(!name)throw new Error("Poné un nombre para el evento.");
  if(!/^[A-Z0-9-]{4,14}$/.test(code))throw new Error("El código debe tener de 4 a 14 letras, números o guiones.");
  if((pin||"").length<4)throw new Error("La clave debe tener al menos 4 caracteres.");
  if((await getDoc(ev(code))).exists())throw new Error("Ese código ya está en uso. Elegí otro.");
  await setDoc(ev(code),{code,name,active:true,end:Date.now()+hours*36e5,guests:[],challenges:[],adminHash:pinHash(code,pin)});keep(code,pin);return code},
 async adminLogin(code,pin){const c=(code||"").trim().toUpperCase(),s=await getDoc(ev(c));
  if(!s.exists())throw new Error("No existe un evento con ese código.");
  if(s.data().adminHash!==pinHash(c,pin))throw new Error("Clave incorrecta.");keep(c,pin);return c},
 async join(code){const c=code.trim().toUpperCase();if(!c)return"nofound";const s=await getDoc(ev(c));
  if(!s.exists())return"nofound";if(!s.data().active)return"closed";await updateDoc(ev(c),{guests:arrayUnion(me)});return c},
 addPhoto:(c,src,ch)=>addDoc(collection(db,"events",c,"photos"),{src,t:Date.now(),stars:0,voters:[],hidden:false,ch:ch??null}),
 // Transacción: evita contar dos veces si dos personas votan a la vez o hay estado viejo
 vote:(c,id)=>cache.events[c]?.active?runTransaction(db,async t=>{const r=ph(c,id),s=await t.get(r);if(!s.exists())return;
  const v=s.data().voters,i=v.indexOf(me);i<0?t.update(r,{voters:[...v,me],stars:s.data().stars+1}):t.update(r,{voters:v.filter(x=>x!==me),stars:s.data().stars-1})}):Promise.resolve(),
 setActive:(c,v)=>updateDoc(ev(c),{active:v}),
 hide:(c,id)=>updateDoc(ph(c,id),{hidden:!cache.events[c].photos.find(p=>p.id===id)?.hidden}),
 del:(c,id)=>deleteDoc(ph(c,id)),
 saveCh:(c,list)=>updateDoc(ev(c),{challenges:list})};

/* ---- Evento de demo (clave de organizador: 1234). Se crea solo la primera vez ---- */
(async()=>{try{const s=await getDoc(ev("ESTRELLA2026")),adminHash=pinHash("ESTRELLA2026","1234");
 if(s.exists()){if(!s.data().adminHash)await updateDoc(ev("ESTRELLA2026"),{adminHash});return}
 await setDoc(ev("ESTRELLA2026"),{code:"ESTRELLA2026",name:"Boda Sofía & Lucas 💍",active:true,end:Date.now()+3*36e5,guests:[],challenges:CH(),adminHash});
 await Promise.all(SAMPLES.map((s,i)=>setDoc(ph("ESTRELLA2026","s"+i),{src:art(...s,[480,420,520,440,500,460,430,490][i]),t:Date.now()-i*17*6e4,stars:[47,38,33,29,24,19,15,9][i],voters:[],hidden:false,ch:null})))}catch(e){console.error("Seed demo:",e)}})();
