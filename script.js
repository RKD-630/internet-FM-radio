const $=s=>document.querySelector(s);
const video=$('#video'),stage=$('#stage'),idleBtn=$('#btnEnable');
const FILTERS={standard:'none',vivid:'saturate(1.4) contrast(1.1)',noir:'grayscale(1) contrast(1.2)',
  night:'sepia(1) hue-rotate(72deg) saturate(3.2) brightness(1.25) contrast(1.05)'};
let stream=null,live=false,facing='user',deviceId=null,mirrored=true,filterName='standard',zoom=1;
let recording=false,recorder=null,recChunks=[],recTimer=null,recSec=0;
let uptimeInt=null,uptimeSec=0,fpsVal=0,fpsInt=null;
let bcOn=false,bc=null,bcTimer=null,bcCanvas=null;
let capN=0;

/* ---------- toast ---------- */
let toastT=null;
function toast(msg,err){const t=$('#toast');t.textContent=msg;t.classList.toggle('err',!!err);t.classList.add('show');
  clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2800);}

/* ---------- clock ---------- */
const p2=n=>String(n).padStart(2,'0');
function clock(){const d=new Date();
  $('#clockTime').textContent=p2(d.getHours())+':'+p2(d.getMinutes())+':'+p2(d.getSeconds());
  $('#clockDate').textContent=d.toLocaleDateString('en-GB',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}).toUpperCase();
  $('#hudTime').textContent=d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())+' · '+p2(d.getHours())+':'+p2(d.getMinutes())+':'+p2(d.getSeconds());}
setInterval(clock,1000);clock();

/* ---------- camera ---------- */
async function startCamera(){
  if(live)return;
  const v={width:{ideal:1920},height:{ideal:1080}};
  if(deviceId)v.deviceId={exact:deviceId};else v.facingMode=facing;
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:v,audio:false});
  }catch(e){
    const m={NotAllowedError:'Permission denied — allow camera access in your browser settings',
      NotFoundError:'No camera found on this device',NotReadableError:'Camera is busy in another application',
      SecurityError:'Camera requires HTTPS or localhost',OverconstrainedError:'Camera unavailable — retrying with defaults'}[e.name]||('Camera error: '+e.name);
    toast(m,true);
    if(e.name==='OverconstrainedError'&&deviceId){deviceId=null;return startCamera();}
    return;
  }
  video.srcObject=stream;live=true;uptimeSec=0;
  if(!deviceId)mirrored=(facing==='user');
  applyVideoFX();
  stage.classList.add('live');
  $('#ledCam').classList.add('on');$('#sig').classList.add('on');
  $('#tStatus').textContent='LIVE';$('#tStatus').classList.remove('off');
  $('#tFace').textContent=(facing==='user'?'FRONT':'REAR')+(deviceId?' · EXT':'');
  $('#hudCam').textContent='CAM 01 · '+((stream.getVideoTracks()[0]?.label||'SENSOR').toUpperCase().slice(0,26));
  $('#powerLabel').textContent='STOP';$('#btnPower').classList.add('on');
  ['#btnShot','#btnRec','#btnFlip'].forEach(s=>$(s).disabled=false);$('#devSelect').disabled=false;
  $('#btnMirror').classList.toggle('on',mirrored);
  startFPS();loadDevices();fetchLANIP();
  uptimeInt=setInterval(()=>{uptimeSec++;$('#tUp').textContent=fmtHMS(uptimeSec);},1000);
  stream.getVideoTracks()[0].addEventListener('ended',()=>{if(live)stopCamera(true);});
  toast('Camera online — feed is live');
}
function stopCamera(silent){
  if(recording)stopRec(true);
  if(bcOn)stopBroadcast();
  if(stream)stream.getTracks().forEach(t=>t.stop());
  stream=null;live=false;video.srcObject=null;
  clearInterval(uptimeInt);clearInterval(fpsInt);fpsVal=0;
  stage.classList.remove('live','rec');
  $('#ledCam').classList.remove('on');$('#sig').classList.remove('on');
  $('#tStatus').textContent='STANDBY';$('#tStatus').classList.add('off');
  $('#tRes').textContent='—';$('#tFps').textContent='—';$('#tUp').textContent='00:00:00';
  $('#hudSpec').textContent='— × —';$('#hudCam').textContent='CAM 01 · STANDBY';
  $('#powerLabel').textContent='START';$('#btnPower').classList.remove('on');
  ['#btnShot','#btnRec','#btnFlip'].forEach(s=>$(s).disabled=true);
  if(!silent)toast('Camera offline');
}
function fmtHMS(s){return p2(Math.floor(s/3600))+':'+p2(Math.floor(s/60)%60)+':'+p2(s%60);}

/* ---------- FPS + spec meter ---------- */
function startFPS(){
  const frames=[];
  if('requestVideoFrameCallback' in HTMLVideoElement.prototype){
    const loop=now=>{if(!live)return;frames.push(now);
      while(frames.length&&now-frames[0]>1000)frames.shift();
      fpsVal=Math.max(0,frames.length-1);video.requestVideoFrameCallback(loop);};
    video.requestVideoFrameCallback(loop);
  }else{
    fpsInt=setInterval(()=>{const s=stream?.getVideoTracks()[0]?.getSettings();
      fpsVal=s&&s.frameRate?Math.round(s.frameRate):30;},1000);
  }
}
setInterval(()=>{if(!live)return;
  $('#tRes').textContent=video.videoWidth+'×'+video.videoHeight;
  $('#tFps').textContent=fpsVal+' fps';
  $('#tZoom').textContent=zoom.toFixed(1)+'×';
  $('#hudSpec').textContent=video.videoWidth+'×'+video.videoHeight+' · '+fpsVal+'FPS';
},500);

/* ---------- video FX ---------- */
function applyVideoFX(){
  video.style.filter=FILTERS[filterName];
  video.style.transform='scale('+zoom+') scaleX('+(mirrored?-1:1)+')';
}
$('#btnMirror').onclick=()=>{mirrored=!mirrored;$('#btnMirror').classList.toggle('on',mirrored);applyVideoFX();};
$('#btnGrid').onclick=()=>{const g=$('#gridfx');g.classList.toggle('show');$('#btnGrid').classList.toggle('on',g.classList.contains('show'));};
$('#btnFull').onclick=()=>{document.fullscreenElement?document.exitFullscreen():stage.requestFullscreen?.();};
$('#zoom').oninput=e=>{zoom=+e.target.value;$('#zoomVal').textContent=zoom.toFixed(1)+'×';applyVideoFX();};
$('#filterChips').addEventListener('click',e=>{const c=e.target.closest('.chip');if(!c)return;
  document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
  c.classList.add('active');filterName=c.dataset.f;applyVideoFX();});

/* ---------- snapshot ---------- */
function snapshot(){
  if(!live||!video.videoWidth)return;
  const w=video.videoWidth,h=video.videoHeight,c=document.createElement('canvas');
  c.width=w;c.height=h;const x=c.getContext('2d');
  if(mirrored){x.translate(w,0);x.scale(-1,1);}
  if(FILTERS[filterName]!=='none'){try{x.filter=FILTERS[filterName];}catch(e){}}
  x.drawImage(video,0,0,w,h);
  c.toBlob(b=>{if(!b)return;
    addCapture({type:'photo',url:URL.createObjectURL(b),name:fname('jpg')});
    const f=$('#flash');f.classList.remove('go');void f.offsetWidth;f.classList.add('go');
    toast('Snapshot captured');
  },'image/jpeg',0.92);
}

/* ---------- recording ---------- */
function pickMime(){const list=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm','video/mp4'];
  return list.find(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m))||'';}
function toggleRec(){
  if(!live)return toast('Start the camera first',true);
  recording?stopRec():startRec();
}
function startRec(){
  if(!window.MediaRecorder)return toast('Recording not supported in this browser',true);
  recChunks=[];const mime=pickMime();
  try{recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);}catch(e){return toast('Recorder failed to start',true);}
  recorder.ondataavailable=e=>{if(e.data.size)recChunks.push(e.data);};
  recorder.onstop=()=>{
    const blob=new Blob(recChunks,{type:recorder.mimeType||'video/webm'});
    addCapture({type:'video',url:URL.createObjectURL(blob),name:fname(mime.includes('mp4')?'mp4':'webm')});
    toast('Recording saved ('+(blob.size/1048576).toFixed(1)+' MB)');
  };
  recorder.start(250);recording=true;recSec=0;
  stage.classList.add('rec');$('#ledRec').classList.add('on');
  $('#btnRec').classList.add('recording');$('#recLabel').textContent='STOP';
  recTimer=setInterval(()=>{recSec++;const t=p2(Math.floor(recSec/60))+':'+p2(recSec%60);
    $('#recTime').textContent='REC '+t;$('#recLabel').textContent='STOP · '+t;},1000);
}
function stopRec(silent){
  if(recorder&&recorder.state!=='inactive')recorder.stop();
  recording=false;clearInterval(recTimer);
  stage.classList.remove('rec');$('#ledRec').classList.remove('on');
  $('#btnRec').classList.remove('recording');$('#recLabel').textContent='RECORD';
  if(silent)toast('Recording stopped (camera closed)');
}

/* ---------- captures gallery ---------- */
function fname(ext){const d=new Date();
  return 'SENTRYCAM_'+d.getFullYear()+p2(d.getMonth()+1)+p2(d.getDate())+'_'+p2(d.getHours())+p2(d.getMinutes())+p2(d.getSeconds())+'.'+ext;}
function addCapture(cap){
  const box=$('#caps');box.querySelector('.caps-empty')?.remove();
  const el=document.createElement('div');el.className='cap';el.tabIndex=0;
  el.innerHTML=(cap.type==='photo'
    ?'<img src="'+cap.url+'" alt="snapshot">'
    :'<video src="'+cap.url+'" muted playsinline loop preload="metadata"></video>')
    +'<span class="cap-tag'+(cap.type==='video'?' vid':'')+'">'+(cap.type==='video'?'▶ CLIP':'PHOTO')+'</span>'
    +'<div class="cap-actions">'
    +'<a href="'+cap.url+'" download="'+cap.name+'" title="Download"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16"/></svg></a>'
    +'<button title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13"/></svg></button>'
    +'</div>';
  el.querySelector('button').onclick=e=>{e.stopPropagation();URL.revokeObjectURL(cap.url);el.remove();capN--;
    $('#capCount').textContent=capN+' FILES';if(!capN)box.innerHTML='<div class="caps-empty">NO CAPTURES YET</div>';};
  el.onclick=()=>window.open(cap.url,'_blank');
  if(cap.type==='video')el.querySelector('video').onmouseenter=e=>e.target.play?.();
  box.prepend(el);capN++;$('#capCount').textContent=capN+' FILES';
}

/* ---------- devices ---------- */
async function loadDevices(){
  try{
    const ds=await navigator.mediaDevices.enumerateDevices();
    const vs=ds.filter(d=>d.kind==='videoinput'),sel=$('#devSelect');
    sel.innerHTML='';vs.forEach((d,i)=>{const o=document.createElement('option');
      o.value=d.deviceId;o.textContent=d.label||('Camera '+(i+1));sel.appendChild(o);});
    const cur=stream?.getVideoTracks()[0]?.getSettings().deviceId;
    if(cur)sel.value=cur;
  }catch(e){}
}
$('#devSelect').onchange=e=>{deviceId=e.target.value||null;if(live){stream.getTracks().forEach(t=>t.stop());live=false;startCamera();}};
$('#btnFlip').onclick=()=>{deviceId=null;facing=facing==='user'?'environment':'user';
  if(live){stream.getTracks().forEach(t=>t.stop());live=false;}startCamera();};

/* ---------- remote access: IPs ---------- */
fetch('https://api.ipify.org?format=json').then(r=>r.json())
  .then(d=>$('#pubIp').textContent=d.ip).catch(()=>$('#pubIp').textContent='offline');
async function fetchLANIP(){
  if($('#lanIp').textContent!=='scanning…'&&$('#lanIp').textContent!=='hidden by browser')return;
  try{
    const pc=new RTCPeerConnection({iceServers:[]});pc.createDataChannel('');
    await pc.setLocalDescription(await pc.createOffer());
    const ip=await new Promise(res=>{
      const t=setTimeout(()=>res(null),2500);
      pc.onicecandidate=e=>{if(!e.candidate){clearTimeout(t);return res(null);}
        const m=e.candidate.candidate.match(/(\d{1,3}\.){3}\d{1,3}/);
        if(m&&!m[0].startsWith('0.')){clearTimeout(t);pc.close();res(m[0]);}};
    });
    if(ip){$('#lanIp').textContent=ip;$('#streamUrl').textContent='http://'+ip+':8080';}
    else $('#lanIp').textContent='hidden by browser';
  }catch(e){$('#lanIp').textContent='unavailable';}
}
fetchLANIP();
document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>{
  const txt=$('#'+b.dataset.copy).textContent;
  (navigator.clipboard?.writeText(txt)||Promise.reject()).then(()=>toast('Copied: '+txt)).catch(()=>toast('Copy failed',true));
});

/* ---------- broadcast viewer (live remote preview) ---------- */
const VIEWER_HTML='<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
+'<title>SENTRYCAM · Remote Viewer</title><style>'
+'body{margin:0;background:#0b0f13;color:#9fb0bf;font-family:monospace;display:flex;flex-direction:column;height:100vh}'
+'header{padding:10px 16px;display:flex;justify-content:space-between;font-size:12px;letter-spacing:.15em;border-bottom:1px solid #22313f}'
+'img{flex:1;object-fit:contain;background:#000;min-height:0}'
+'.dot{color:#ff5252;animation:b 1s steps(2) infinite}@keyframes b{50%{opacity:.15}}'
+'</style></head><body><header><span>SENTRYCAM // REMOTE VIEWER</span><span><span class="dot">&#9679;</span> LIVE <span id="fps"></span></span></header>'
+'<img id="feed" alt="Waiting for signal…">'
+'<script>var img=document.getElementById("feed"),n=0;'
+'setInterval(function(){document.getElementById("fps").textContent=n+" FPS";n=0;},1000);'
+'var bc=new BroadcastChannel("sentrycam");'
+'bc.onmessage=function(e){if(e.data&&e.data.t==="f"){img.src=e.data.d;n++;}};'
+'<\/script></body></html>';

function startBroadcast(){
  if(typeof BroadcastChannel==='undefined')return toast('BroadcastChannel not supported here',true);
  bcOn=true;bc=new BroadcastChannel('sentrycam');
  bcCanvas=document.createElement('canvas');
  bcTimer=setInterval(()=>{
    if(!live||!video.videoWidth)return;
    const w=560,h=Math.round(w*video.videoHeight/video.videoWidth);
    if(bcCanvas.width!==w){bcCanvas.width=w;bcCanvas.height=h;}
    const x=bcCanvas.getContext('2d');
    if(mirrored){x.save();x.translate(w,0);x.scale(-1,1);}
    x.drawImage(video,0,0,w,h);if(mirrored)x.restore();
    try{bc.postMessage({t:'f',d:bcCanvas.toDataURL('image/jpeg',0.5)});}catch(e){}
  },120);
  $('#ledLink').classList.add('on');$('#btnBroadcast').classList.add('live');
  $('#bcLabel').textContent='STOP BROADCAST';
}
function stopBroadcast(){
  bcOn=false;clearInterval(bcTimer);bc?.close();bc=null;
  $('#ledLink').classList.remove('on');$('#btnBroadcast').classList.remove('live');
  $('#bcLabel').textContent='OPEN LIVE VIEWER WINDOW';
}
$('#btnBroadcast').onclick=()=>{
  if(!live)return toast('Start the camera first',true);
  if(bcOn)return stopBroadcast();
  startBroadcast();
  const w=window.open('','_blank','width=760,height=470');
  if(!w){
    stopBroadcast();
    toast('Popup blocked — allow popups to open the viewer',true);
  }else{
    w.document.write(VIEWER_HTML);
    w.document.close();
    toast('Broadcasting live feed to viewer window');
  }
};

/* ---------- main wiring ---------- */
function togglePower(){live?stopCamera():startCamera();}
$('#btnPower').onclick=togglePower;
idleBtn.onclick=()=>startCamera();
$('#btnShot').onclick=snapshot;
$('#btnRec').onclick=toggleRec;
document.addEventListener('keydown',e=>{
  if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;
  const k=e.key.toLowerCase();
  if(k==='p')togglePower();else if(k==='s'&&live)snapshot();else if(k==='r')toggleRec();
  else if(k==='g')$('#btnGrid').click();else if(k==='m')$('#btnMirror').click();else if(k==='f')$('#btnFull').click();
});
window.addEventListener('pagehide',()=>{if(stream)stream.getTracks().forEach(t=>t.stop());});