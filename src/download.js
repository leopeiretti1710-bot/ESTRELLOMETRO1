// Descargas sin librerías: una foto suelta o todas en un .zip (ZIP "store", sin compresión: los JPEG ya vienen comprimidos)
const type=s=>s.slice(5,s.indexOf(";"));
const ext=s=>({"image/jpeg":"jpg","image/png":"png","image/svg+xml":"svg"}[type(s)]||"jpg");
const bytes=src=>{const i=src.indexOf(","),meta=src.slice(0,i),d=src.slice(i+1);
 if(meta.includes(";base64")){const b=atob(d),u=new Uint8Array(b.length);for(let k=0;k<b.length;k++)u[k]=b.charCodeAt(k);return u}
 return new TextEncoder().encode(decodeURIComponent(d))};
const save=(blob,name)=>{const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)};
const T=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t.push(c>>>0)}return t})();
const crc=u=>{let c=-1;for(let i=0;i<u.length;i++)c=T[(c^u[i])&255]^(c>>>8);return(~c)>>>0};
function zip(files){const enc=new TextEncoder(),parts=[],cd=[];let off=0;
 for(const f of files){const nm=enc.encode(f.name),c=crc(f.data),n=f.data.length;
  const h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(12,0x21,true);h.setUint32(14,c,true);h.setUint32(18,n,true);h.setUint32(22,n,true);h.setUint16(26,nm.length,true);
  parts.push(h,nm,f.data);
  const d=new DataView(new ArrayBuffer(46));d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x0800,true);d.setUint16(14,0x21,true);d.setUint32(16,c,true);d.setUint32(20,n,true);d.setUint32(24,n,true);d.setUint16(28,nm.length,true);d.setUint32(42,off,true);
  cd.push(d,nm);off+=30+nm.length+n}
 const size=cd.reduce((a,x)=>a+x.byteLength,0),e=new DataView(new ArrayBuffer(22));
 e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,size,true);e.setUint32(16,off,true);
 return new Blob([...parts,...cd,e],{type:"application/zip"})}
export const downloadPhoto=p=>save(new Blob([bytes(p.src)],{type:type(p.src)}),"foto-"+new Date(p.t).toISOString().slice(11,19).replace(/:/g,"-")+"."+ext(p.src));
export const downloadAll=(ph,code)=>save(zip(ph.map((p,i)=>({name:"foto-"+String(i+1).padStart(3,"0")+"."+ext(p.src),data:bytes(p.src)}))),code+"-fotos.zip");
