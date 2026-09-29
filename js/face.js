// Rastreamento facial real (MediaPipe Face Landmarker, roda 100% no navegador).
import { FaceLandmarker, FilesetResolver } from '../vendor/vision_bundle.mjs';
const MODELS = ['assets/models/face_landmarker.task',
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'];
let lm = null, mode = 'VIDEO', loading = null;

export function loadTracker(){
  return loading ??= (async () => {
    const fs = await FilesetResolver.forVisionTasks('vendor/wasm');
    for (const url of MODELS) for (const delegate of ['GPU','CPU']) {
      try { lm = await FaceLandmarker.createFromOptions(fs,
        { baseOptions:{ modelAssetPath:url, delegate }, runningMode:'VIDEO', numFaces:1 }); mode='VIDEO'; return lm; }
      catch(e){ console.warn('tracker', url, delegate, e); }
    }
    throw new Error('Não foi possível carregar o rastreador facial');
  })().catch(e => { loading = null; throw e; });
}
async function setMode(m){ if(mode!==m){ await lm.setOptions({ runningMode:m }); mode=m; } }

export async function detectVideo(video, ts){
  await setMode('VIDEO');
  return toPose(lm.detectForVideo(video, ts), video.videoWidth, video.videoHeight);
}
export async function detectImage(canvas){
  await setMode('IMAGE');
  return toPose(lm.detect(canvas), canvas.width, canvas.height);
}
// Converte os 478 pontos em posição/escala/rotação da armação (coordenadas da imagem original)
function toPose(r, W, H){
  const p = r.faceLandmarks && r.faceLandmarks[0]; if(!p) return null;
  const P = i => ({ x:p[i].x*W, y:p[i].y*H }), d = (a,b) => Math.hypot(a.x-b.x, a.y-b.y);
  const a=P(33), b=P(263), l=P(234), rt=P(454), n=P(1);   // cantos externos dos olhos, laterais do rosto, nariz
  const dl=d(n,l), dr=d(n,rt);
  return { cx:(a.x+b.x)/2, cy:(a.y+b.y)/2, angle:Math.atan2(b.y-a.y, b.x-a.x), width:d(l,rt), yaw:(dl-dr)/(dl+dr) };
}
// Suavização para a armação não tremer
export class Smoother {
  constructor(k=.55){ this.k=k; this.s=null; }
  push(p){ if(!p) return this.s; if(!this.s){ this.s={...p}; return this.s; }
    for(const key of ['cx','cy','angle','width','yaw']) this.s[key] += (p[key]-this.s[key])*this.k; return this.s; }
  reset(){ this.s=null; }
}
// Desenha a armação real sobre o rosto (mirror = pré-visualização espelhada da câmera frontal)
export function drawGlasses(ctx, img, p, g, mirror, W){
  if(!p || !img) return;
  const w = p.width*g.fit, h = w*img.height/img.width, sx = Math.max(.72, 1-Math.abs(p.yaw)*.9);
  ctx.save();
  ctx.translate(mirror ? W-p.cx : p.cx, p.cy + g.dy*w);
  ctx.rotate(mirror ? -p.angle : p.angle); ctx.scale(sx,1);
  ctx.drawImage(img, -w/2, -h/2, w, h);
  ctx.restore();
}
