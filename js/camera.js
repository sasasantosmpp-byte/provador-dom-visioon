let stream = null;
export async function startCamera(video){
  stopCamera();
  stream = await navigator.mediaDevices.getUserMedia({ audio:false,
    video:{ facingMode:'user', width:{ideal:1280}, height:{ideal:720} } });
  video.srcObject = stream; video.muted = true; video.setAttribute('playsinline','');
  await video.play();
  return video;
}
export function stopCamera(){ if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; } }
export const cameraSupported = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
