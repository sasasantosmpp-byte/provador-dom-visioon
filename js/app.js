import { glasses, PRICE_PREFIX, WHATSAPP, money } from './catalog.js?v=5';
import { startCamera, stopCamera, cameraSupported } from './camera.js?v=5';
import { loadTracker, detectVideo, detectImage, Smoother, drawGlasses } from './face.js?v=5';
import { composeFinal } from './compose.js?v=5';

const $ = s => document.querySelector(s);
const cv = $('#cv'), ctx = cv.getContext('2d'), vid = $('#vid');
const S = { idx:0, mode:null, run:0, sm:new Smoother(), lost:0, selfie:null, blob:null, tracker:false, seen:false };
const imgs = {}, load = src => imgs[src] ??= new Promise((ok,ko)=>{ const i=new Image(); i.onload=()=>ok(i); i.onerror=ko; i.src=src; });
const cur = () => glasses[S.idx];
S.adj = {}; const adj = () => S.adj[cur().id] ??= { scale:1, dx:0, dy:0, rot:0 };
const say = t => { const b=$('#bubble'); b.textContent=t; b.classList.add('show'); clearTimeout(say.t); say.t=setTimeout(()=>b.classList.remove('show'),3800); };
const hint = t => $('#hint').textContent = t || '';

function go(id){ document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active', s.id===id));
  if(id!=='s-try'){ S.run++; stopCamera(); } }
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));

/* catálogo */
const priceTxt = g => PRICE_PREFIX + money(g.price);
$('#pick-price').textContent = priceTxt(glasses[0]);
function fillGrid(el, onPick){
  el.innerHTML='';
  glasses.forEach((g,i)=>{ const b=document.createElement('button'); b.className='card'+(i===S.idx?' on':'');
    b.innerHTML=`<div class="img"><img src="${g.image}" alt="${g.name}"></div><b>${g.name}</b><small>${g.id} • ${g.color}</small><small class="pr">${priceTxt(g)}</small>`;
    b.onclick=()=>onPick(i); el.appendChild(b); });
}
fillGrid($('#grid'), i=>{ S.idx=i; enterTry(); });

/* provador */
async function enterTry(){
  go('s-try'); $('#perm').classList.add('hidden'); S.sm.reset(); S.selfie=null; S.seen=false; updateChip();
  await load(cur().image);
  if(!cameraSupported()) return denied();
  try{ await startCamera(vid); }catch(e){ return denied(); }
  S.mode='video'; const run=++S.run; hint('Procurando seu rostinho…'); startTracker(); loop(run); say('Será que essa é a sua?');
}
function denied(){ $('#perm').classList.remove('hidden'); }
async function startTracker(){
  try{ await loadTracker(); S.tracker=true; }catch(e){ hint('Não consegui carregar o rastreamento. Verifique sua internet.'); }
}
function updateChip(){ const g=cur(); $('#chip').textContent=`${g.id} • ${g.color} • ${priceTxt(g)}`; }
let lastT=-1;
async function loop(run){
  if(run!==S.run || S.mode!=='video') return;
  if(vid.readyState>=2 && vid.videoWidth){
    const W=vid.videoWidth, H=vid.videoHeight; if(cv.width!==W||cv.height!==H){ cv.width=W; cv.height=H; }
    ctx.save(); ctx.translate(W,0); ctx.scale(-1,1); ctx.drawImage(vid,0,0,W,H); ctx.restore();
    if(S.tracker && vid.currentTime!==lastT){ lastT=vid.currentTime;
      let p=null; try{ p=await detectVideo(vid, performance.now()); }catch(e){}
      if(p){ S.lost=0; S.pose=S.sm.push(p); } else if(++S.lost>8){ S.pose=null; S.sm.reset(); }
      if(p&&!S.seen){ S.seen=true; say('Uau! Ficou demais!'); }
      hint(S.pose ? '' : 'Coloque seu rosto na tela 🙂');
    }
    if(S.pose) drawGlasses(ctx, await load(cur().image), S.pose, cur(), true, W, adj());
  }
  requestAnimationFrame(()=>loop(run));
}
async function renderStatic(redetect=true){
  const s=S.selfie; cv.width=s.width; cv.height=s.height; ctx.drawImage(s,0,0);
  if(redetect){ S.pose=null; try{ await loadTracker(); S.pose=await detectImage(s); }catch(e){} }
  if(S.pose) drawGlasses(ctx, await load(cur().image), S.pose, cur(), false, s.width, adj());
  hint(S.pose ? '' : 'Não achei um rosto nessa foto. Tente outra selfie.');
}
function change(i){ S.idx=(i+glasses.length)%glasses.length; syncSliders(); updateChip(); load(cur().image); S.sm.reset();
  if(S.mode==='image') renderStatic(false); say(['Quer experimentar outra?','Uau! Ficou demais!','Será que essa é a sua?'][Math.floor(Math.random()*3)]); }
$('#prev').onclick=()=>change(S.idx-1); $('#next').onclick=()=>change(S.idx+1);
$('#back-try').onclick=()=>go('s-pick'); $('#retry').onclick=enterTry;
$('#list-btn').onclick=()=>{ fillGrid($('#sheet-grid'), i=>{ $('#sheet').classList.add('hidden'); change(i); }); $('#sheet').classList.remove('hidden'); };
$('#sheet-close').onclick=()=>$('#sheet').classList.add('hidden');

/* selfie */
$('#selfie-btn').onclick=()=>$('#file').click();
$('#file').onchange=async e=>{ const f=e.target.files[0]; if(!f) return;
  const bmp=await createImageBitmap(f,{imageOrientation:'from-image'}); const k=Math.min(1,1600/Math.max(bmp.width,bmp.height));
  const c=document.createElement('canvas'); c.width=Math.round(bmp.width*k); c.height=Math.round(bmp.height*k); c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);
  S.selfie=c; S.mode='image'; S.run++; stopCamera(); $('#perm').classList.add('hidden'); e.target.value=''; await renderStatic(); };

/* foto + resultado */
$('#shoot').onclick=async ()=>{
  $('#adj').classList.add('hidden');
  if(!cv.width || (S.mode==='video' && !S.pose && !confirm('Não estou vendo seu rosto. Tirar a foto mesmo assim?'))) return;
  const snap=document.createElement('canvas'); snap.width=cv.width; snap.height=cv.height; snap.getContext('2d').drawImage(cv,0,0);
  const [mascot,logo]=await Promise.all([load('assets/mascote.png'), load('assets/logo.png')]);
  S.blob=await composeFinal({ photo:snap, mascot, logo, glasses:cur() });
  $('#final').src=URL.createObjectURL(S.blob);
  const g=cur(), msg=`Oi! Experimentei uma armação no provador virtual da Dom Visioon e gostei desse modelo. 👓 Gostaria de saber mais sobre ele.\n\nModelo: ${g.id} (${g.color}) — armações a partir de ${money(g.price)},00.`;
  $('#wa').href=`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  go('s-result');
};
const file=()=>new File([S.blob],'meu-oculos-dom-visioon.png',{type:'image/png'});
$('#save').onclick=()=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(S.blob); a.download='meu-oculos-dom-visioon.png'; a.click(); };
$('#share').onclick=async ()=>{ try{ await navigator.share({ files:[file()], title:'Eu escolhi meu óculos!', text:'Dia das Crianças 2026 • Dom Visioon' }); }catch(e){} };
if(!(navigator.canShare && navigator.canShare({files:[new File([''],'a.png',{type:'image/png'})]}))) $('#share').classList.add('hidden');
$('#again').onclick=()=>{ S.mode==='image' ? (go('s-try'), renderStatic()) : enterTry(); };

/* ajuste manual da armação */
const sl = {scale:$('#a-scale'), dx:$('#a-dx'), dy:$('#a-dy'), rot:$('#a-rot')};
const syncSliders = () => { const o=adj(); for(const k in sl) sl[k].value=o[k]; };
for(const k in sl) sl[k].oninput = () => { adj()[k] = +sl[k].value; if(S.mode==='image') renderStatic(false); };
$('#adj-btn').onclick = () => { syncSliders(); $('#adj').classList.toggle('hidden'); };
$('#a-ok').onclick = () => $('#adj').classList.add('hidden');
$('#a-reset').onclick = () => { S.adj[cur().id] = { scale:1, dx:0, dy:0, rot:0 }; syncSliders(); if(S.mode==='image') renderStatic(false); };
