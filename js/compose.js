// Foto final 9:16 (1080x1920): frase, data, foto + armação + mascote, "Dom Visioon" ao centro e modelo
const W=1080, H=1920, EMOJI="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji'";
const rr=(c,x,y,w,h,r)=>{ c.beginPath(); c.roundRect(x,y,w,h,r); };
export async function composeFinal({ photo, mascot, logo, glasses }){
  try{ await Promise.all([document.fonts.load('900 80px Fraunces'), document.fonts.load('700 40px Figtree')]); }catch(e){}
  const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const c=cv.getContext('2d');
  const bg=c.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#0c0906'); bg.addColorStop(.6,'#1b0f08'); bg.addColorStop(1,'#3a1c0c');
  c.fillStyle=bg; c.fillRect(0,0,W,H);
  const gl=c.createRadialGradient(W/2,900,50,W/2,900,900); gl.addColorStop(0,'rgba(201,162,74,.22)'); gl.addColorStop(1,'rgba(201,162,74,0)');
  c.fillStyle=gl; c.fillRect(0,0,W,H);
  c.textAlign='center';
  // 1ª frase
  c.fillStyle='#f6efe2'; c.font=`900 70px Fraunces, Georgia, serif, ${EMOJI}`; c.fillText('Eu escolhi meu óculos! 👓', W/2, 120);
  // 2ª frase
  c.fillStyle='#c9a24a'; c.font='700 46px Figtree, Arial, sans-serif'; c.fillText('Dia das Crianças 2026', W/2, 190);
  // foto (recorte "cover")
  const px=60, py=250, pw=960, ph=1190;
  c.save(); rr(c,px,py,pw,ph,56); c.clip();
  const s=Math.max(pw/photo.width, ph/photo.height), dw=photo.width*s, dh=photo.height*s;
  c.drawImage(photo, px+(pw-dw)/2, py+(ph-dh)/2, dw, dh); c.restore();
  c.lineWidth=8; c.strokeStyle='#c9a24a'; rr(c,px,py,pw,ph,56); c.stroke();
  // mascote no canto inferior direito da foto
  const mh=500, mw=mh*mascot.width/mascot.height;
  c.save(); c.shadowColor='rgba(0,0,0,.55)'; c.shadowBlur=30; c.shadowOffsetY=12;
  c.drawImage(mascot, px+pw-mw-20, py+ph-mh+40, mw, mh); c.restore();
  // 3ª frase: centralizada
  c.fillStyle='#f6efe2'; c.font='900 112px Fraunces, Georgia, serif'; c.fillText('Dom Visioon', W/2, 1640);
  // 4ª frase: modelo
  if(glasses){ c.fillStyle='rgba(246,239,226,.75)'; c.font='700 38px Figtree, Arial, sans-serif'; c.fillText('Modelo '+glasses.id, W/2, 1710); }
  // logo
  const lh=150, lw=lh*logo.width/logo.height; c.drawImage(logo,(W-lw)/2,1745,lw,lh);
  return await new Promise(r=>cv.toBlob(r,'image/png'));
}
