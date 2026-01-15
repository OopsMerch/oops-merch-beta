const fs = require('fs');
const p = require('path');
const L = p.join('.', 'src/layouts/Layout.astro');
const PW = "oops-beta-2026"; 

console.log('🚀 Чистим и ставим финальную защиту...');

const code = `
<div id="lock" style="position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:9999999;display:flex;align-items:center;justify-content:center;color:#fff;font-family:sans-serif;">
<div style="text-align:center;max-width:300px;"><div style="font-size:3rem;margin-bottom:20px;">🔒</div>
<h2 style="text-transform:uppercase;margin-bottom:10px;">OOPS BETA</h2>
<input id="p" type="text" placeholder="Код" style="width:100%;padding:10px;margin-bottom:10px;border-radius:8px;border:1px solid #333;background:#111;color:#fff;text-align:center;">
<button id="b" style="width:100%;padding:10px;border-radius:8px;border:none;background:#fff;font-weight:bold;cursor:pointer;">ВОЙТИ</button>
</div></div>
<script is:inline>
(function(){
  const k='oops_beta', l=document.getElementById('lock'), b=document.getElementById('b'), i=document.getElementById('p');
  const check=()=>{
    if(localStorage.getItem(k)==='1') { if(l) l.remove(); document.body.style.overflow='auto'; }
    else { if(l) l.style.display='flex'; document.body.style.overflow='hidden'; }
  };
  const go=()=>{ if(i.value.trim()==='${PW}'){ localStorage.setItem(k,'1'); check(); } else { i.style.borderColor='red'; } };
  
  if(l){
     check();
     // Клонируем чтобы убрать старые эвенты
     const nB=b.cloneNode(true); b.parentNode.replaceChild(nB,b); nB.onclick=go;
     const nI=i.cloneNode(true); i.parentNode.replaceChild(nI,i); nI.onkeypress=(e)=>{if(e.key==='Enter')go()};
  }
  document.addEventListener('astro:page-load', check);
})();
</script>`;

if (fs.existsSync(L)) {
    let c = fs.readFileSync(L, 'utf8');
    // Удаляем старые версии
    c = c.replace(/
