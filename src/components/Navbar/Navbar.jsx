// Barra inferior en mobile, menú lateral en desktop. "Admin" solo para organizadores.
import "./Navbar.css";
const T=[["gal","▦","Galería"],["des","⚡","Desafíos"],["pod","🏆","Podio"],["adm","⚙️","Admin"]];
export default function Navbar({tab,setTab,role}){
 return(<nav className="nv glass"><div className="nv-brand">⭐ Estrellómetro</div>{T.filter(t=>t[0]!=="adm"||role==="organizer").map(([k,i,l])=>
 <button key={k} className={tab===k?"on":""} onClick={()=>setTab(k)}><span>{i}</span>{l}</button>)}</nav>)}
