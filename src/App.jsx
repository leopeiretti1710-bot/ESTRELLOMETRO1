// Controlador de vistas: welcome → login → evento (galería | desafíos | podio | invitados | admin)
import {useState,useMemo,useEffect,useRef} from 'react';
import {useDB,watch,me} from './store.js';
import Welcome from './components/Welcome/Welcome.jsx';
import EventLogin from './components/EventLogin/EventLogin.jsx';
import EventFeed from './components/EventFeed/EventFeed.jsx';
import Challenges from './components/Challenges/Challenges.jsx';
import Podium from './components/Podium/Podium.jsx';
import OrganizerDashboard from './components/OrganizerDashboard/OrganizerDashboard.jsx';
import Guests from './components/Guests/Guests.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import OrganizerAccess from './components/OrganizerAccess/OrganizerAccess.jsx';
import './App.css';
const Notice=({icon,title,text,onClick})=><section className="notice"><div className="ic">{icon}</div><h2>{title}</h2><p>{text}</p><button className="btn" onClick={onClick}>Volver al inicio</button></section>;
export default function App(){
 const [view,setView]=useState('welcome'),[code,setCode]=useState(null),[tab,setTab]=useState('gal'),[role,setRole]=useState('guest'),[upCh,setUpCh]=useState(null),
 [pre,setPre]=useState(()=>new URLSearchParams(location.search).get('code')||''),db=useDB(),ev=db.events[code],seen=useRef(false);
 useEffect(()=>{if(pre)setView('login')},[]); // llegaste escaneando el QR con la cámara del celular (?code=XXXX)
 useEffect(()=>code?watch(code):undefined,[code]);
 useEffect(()=>{seen.current=false},[code]);
 // Si el evento desaparece mientras estás adentro, es porque terminó el contador y se borró
 useEffect(()=>{if(ev)seen.current=true;else if(seen.current&&view==='event'&&db.loaded)setView('ended')},[ev,view,db.loaded]);
 const sky=useMemo(()=>Array.from({length:70},()=>({x:Math.random()*100,y:Math.random()*100,s:Math.random()*2+1,d:Math.random()*5})),[]);
 const clearPre=()=>{setPre('');try{history.replaceState(null,'',location.pathname)}catch{}};
 const exit=()=>{setView('welcome');setCode(null);setRole('guest')};
 const mine=ev?.members?.find(m=>m.id===me),blocked=role==='guest'&&mine?.blocked;
 return(<div className="app"><div className="sky">{sky.map((s,i)=><span key={i} style={{left:s.x+'%',top:s.y+'%',width:s.s,height:s.s,animationDelay:s.d+'s'}}/>)}</div>
 {view==='welcome'&&<Welcome onEnter={()=>setView('login')} onOrganizer={()=>setView('org')}/>}
 {view==='org'&&<OrganizerAccess onBack={()=>setView('welcome')} onEnter={c=>{setCode(c);setRole('organizer');setTab('adm');setView('event')}}/>}
 {view==='login'&&<EventLogin initialCode={pre} onBack={()=>{clearPre();setView('welcome')}} onJoin={c=>{clearPre();setCode(c);setRole('guest');setTab('gal');setView('event')}}/>}
 {view==='event'&&(blocked?<Notice icon="🚫" title="No podés participar" text="El organizador bloqueó tu acceso a este evento." onClick={exit}/>:
 <div className="event"><Navbar tab={tab} setTab={setTab} role={role}/>
  <main>{tab==='gal'&&ev&&<EventFeed ev={ev} onBack={exit} upCh={upCh} clearUp={()=>setUpCh(null)} admin={role==='organizer'}/>}
  {tab==='des'&&ev&&<Challenges ev={ev} admin={role==='organizer'} onPick={c=>{setUpCh(c.id);setTab('gal')}}/>}
  {tab==='pod'&&ev&&<Podium ev={ev}/>}
  {tab==='usr'&&role==='organizer'&&ev&&<Guests ev={ev}/>}
  {tab==='adm'&&role==='organizer'&&<OrganizerDashboard ev={ev} onBack={exit}/>}
  {!ev&&tab!=='adm'&&<p className="empty">Cargando evento...</p>}</main></div>)}
 {view==='ended'&&<Notice icon="⭐" title="El evento terminó" text="Se acabó el tiempo y el evento fue eliminado. ¡Gracias por participar!" onClick={exit}/>}</div>)}
