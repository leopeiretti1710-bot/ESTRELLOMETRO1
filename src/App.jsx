// Controlador de vistas: welcome → login → evento (galería | desafíos | podio | admin)
import {useState,useMemo,useEffect} from 'react';
import {useDB,watch} from './store.js';
import Welcome from './components/Welcome/Welcome.jsx';
import EventLogin from './components/EventLogin/EventLogin.jsx';
import EventFeed from './components/EventFeed/EventFeed.jsx';
import Challenges from './components/Challenges/Challenges.jsx';
import Podium from './components/Podium/Podium.jsx';
import OrganizerDashboard from './components/OrganizerDashboard/OrganizerDashboard.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import OrganizerAccess from './components/OrganizerAccess/OrganizerAccess.jsx';
import './App.css';
export default function App(){
 const [view,setView]=useState('welcome'),[code,setCode]=useState(null),[tab,setTab]=useState('gal'),[role,setRole]=useState('guest'),[upCh,setUpCh]=useState(null);
 const ev=useDB().events[code];
 useEffect(()=>code?watch(code):undefined,[code]); // escucha las fotos del evento en tiempo real
 const sky=useMemo(()=>Array.from({length:70},(_,i)=>({x:Math.random()*100,y:Math.random()*100,s:Math.random()*2+1,d:Math.random()*5})),[]);
 const exit=()=>{setView('welcome');setCode(null);setRole('guest')};
 return(<div className="app"><div className="sky">{sky.map((s,i)=><span key={i} style={{left:s.x+'%',top:s.y+'%',width:s.s,height:s.s,animationDelay:s.d+'s'}}/>)}</div>
 {view==='welcome'&&<Welcome onEnter={()=>setView('login')} onOrganizer={()=>setView('org')}/>}
 {view==='org'&&<OrganizerAccess onBack={()=>setView('welcome')} onEnter={c=>{setCode(c);setRole('organizer');setTab('adm');setView('event')}}/>}
 {view==='login'&&<EventLogin onBack={()=>setView('welcome')} onJoin={c=>{setCode(c);setRole('guest');setTab('gal');setView('event')}}/>}
 {view==='event'&&<div className="event"><Navbar tab={tab} setTab={setTab} role={role}/>
  <main>{tab==='gal'&&ev&&<EventFeed ev={ev} onBack={exit} upCh={upCh} clearUp={()=>setUpCh(null)} admin={role==='organizer'}/>}
  {tab==='des'&&ev&&<Challenges ev={ev} admin={role==='organizer'} onPick={c=>{setUpCh(c.id);setTab('gal')}}/>}
  {tab==='pod'&&ev&&<Podium ev={ev}/>}
  {tab==='adm'&&role==='organizer'&&<OrganizerDashboard ev={ev} onBack={exit}/>}
  {!ev&&tab!=='adm'&&<p className="empty">Evento no disponible.</p>}</main></div>}</div>)}
