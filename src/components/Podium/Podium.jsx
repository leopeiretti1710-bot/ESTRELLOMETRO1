// Cierre épico: top 3 con spotlight, corona de estrellas y confetti CSS
import {useState,useMemo} from "react";
import "./Podium.css";
export default function Podium({ev}){
 const [show,setShow]=useState(false),top=[...ev.photos.filter(p=>!p.hidden)].sort((a,b)=>b.stars-a.stars).slice(0,3);
 const conf=useMemo(()=>Array.from({length:60},()=>({x:Math.random()*100,d:Math.random()*2,t:3+Math.random()*3,c:["#F6C56B","#8b7cf6","#fff","#4a7fd6"][Math.floor(Math.random()*4)]})),[show]);
 if(top.length<3)return<p className="empty">Hacen falta al menos 3 fotos para armar el podio.</p>;
 if(!show)return(<div className="pd-ask"><div className="pd-trophy">🏆</div><h2>Podio final</h2><p>¿Están listos para conocer las fotos más votadas de la noche?</p><button className="btn" onClick={()=>setShow(true)}>✨ Revelar ganadores</button></div>);
 const o=[[top[1],2,110,.6],[top[0],1,160,0],[top[2],3,80,1.2]];
 return(<div className="pd"><div className="pd-conf">{conf.map((c,i)=><i key={i} style={{left:c.x+"%",background:c.c,animationDelay:c.d+"s",animationDuration:c.t+"s"}}/>)}</div>
 <h2>Las más votadas de la noche</h2><div className="pd-cols">{o.map(([p,n,h,d])=><div key={p.id} className={"pd-col"+(n===1?" w":"")} style={{animationDelay:d+.2+"s"}}>
 {n===1&&<div className="pd-crown">⭐⭐⭐⭐⭐<span>👑</span></div>}<img src={p.src} alt={"Puesto "+n}/><small>⭐ {p.stars}</small><div className="pd-bar" style={{height:h}}>{n}º</div></div>)}</div></div>)}
