import "./Welcome.css";
export default function Welcome({onEnter,onOrganizer}){
 return(<section className="wl"><div className="wl-logo">⭐<i>✨</i></div><h1>Estrellómetro</h1><div className="wl-st">★★★★★</div>
 <p>Las mejores noches merecen<b>recordarse entre estrellas.</b></p>
 <div className="wl-b"><button className="btn" onClick={onEnter}>✨ Entrar a un evento</button><button className="btn ghost" onClick={onOrganizer}>Soy organizador →</button></div><small className="wl-v">versión 5 · nombres y cámara</small></section>)}
