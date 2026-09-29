// Foto final 9:16 (1080x1920): foto + armação + mascote + logo + textos da campanha
const W=1080, H=1920;
const rr=(c,x,y,w,h,r)=>{ c.beginPath(); c.roundRect(x,y,w,h,r); };
export async function composeFinal({ photo, mascot, logo, glasses }){
  try{ await Promise.all([document.fonts.load('900 80px Fraunces'), document.fonts.load('700 40px Figtree')]); }catch(e){}
  const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const c=cv.getContext('2d');
  const bg=c.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#0c0906'); bg.addColorStop(.6,'#1b0f08'); bg.addColorStop(1,'#3a1c0c');
  c.fillStyle=bg; c.fillRect(0,0,W,H);
  const gl=c.createRadialGradient(W/2,900,50,W/2,900,900); gl.addColorStop(0,'rgba(201,162,74,.22)'); gl.addColorStop(1,'rgba(201,162,74,0)');
  c.fillStyle=gl; c.fillRect(0,0,W,H);
  // logo
  const lh=190, lw=lh*logo.width/logo.height; c.drawImage(logo,(W-lw)/2,20,lw,lh);
  // foto (recorte "cover" 3:4)
  const px=60, py=230, pw=960, ph=1280;
  c.save(); rr(c,px,py,pw,ph,56); c.clip();
  const s=Math.max(pw/photo.width, ph/photo.height), dw=photo.width*s, dh=photo.height*s;
  c.drawImage(photo, px+(pw-dw)/2, py+(ph-dh)/2, dw, dh); c.restore();
  c.lineWidth=8; c.strokeStyle='#c9a24a'; rr(c,px,py,pw,ph,56); c.stroke();
  // mascote (canto inferior direito, fora do rosto)
  const mh=520, mw=mh*mascot.width/mascot.height;
  c.save(); c.shadowColor='rgba(0,0,0,.55)'; c.shadowBlur=30; c.shadowOffsetY=12;
  c.drawImage(mascot, W-mw-40, py+ph-mh+250, mw, mh); c.restore();
  // textos
  c.textAlign='left'; c.fillStyle='#f6efe2'; c.font='900 84px Fraunces, Georgia, serif';
  c.fillText('EU ESCOLHI', 70, 1610); c.fillText('MEU ÓCULOS! 👓', 70, 1700);
  c.fillStyle='#c9a24a'; c.font='700 44px Figtree, Arial, sans-serif'; c.fillText('Dia das Crianças 2026', 74, 1770);
  c.fillStyle='#f6efe2'; c.font='600 36px Figtree, Arial, sans-serif';
  c.fillText('Armações infantis a partir de R$ 55', 74, 1826);
  if(glasses){ c.fillStyle='rgba(246,239,226,.6)'; c.font='600 30px Figtree, Arial, sans-serif'; c.fillText('Modelo '+glasses.id, 74, 1872); }
  return await new Promise(r=>cv.toBlob(r,'image/png'));
}
