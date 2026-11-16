// Server component: branded intro + block-stacking loading game.
//
// Everything here ships in the initial HTML. The inline <script> runs while the
// browser parses the page, so the intro and game appear before React or any JS
// chunk (three.js, gsap, …) has downloaded. React later drives it through the
// tiny `window.__boot` API (see src/lib/preloadAssets.ts) to report load
// progress and to hand over to the intro video.
//
// Flow: intro (brand reveal, ~2.8s or tap) → game. A slim strip on the bottom
// edge shows load progress; once everything is loaded it counts down 3s and
// enters the site automatically (Enter key skips the wait).
//
// The script only mutates data-* attributes, a few text nodes, one inline style
// and the canvas pixels; those elements carry `suppressHydrationWarning`.
// Colours mirror the site theme in globals.css (--background, --black, --gray,
// --light-gray and the drafting-grid body background).

const css = `
#boot-loader{position:fixed;inset:0;z-index:10000;color:#0c0c0c;overflow:hidden;
  background-color:#f4f3ef;
  background-image:radial-gradient(rgba(12,12,12,.22) 1.2px,transparent 1.2px),
    linear-gradient(to right,rgba(12,12,12,.05) 1px,transparent 1px),
    linear-gradient(to bottom,rgba(12,12,12,.05) 1px,transparent 1px),
    linear-gradient(to right,rgba(12,12,12,.1) 1px,transparent 1px),
    linear-gradient(to bottom,rgba(12,12,12,.1) 1px,transparent 1px);
  background-size:24px 24px,24px 24px,24px 24px,120px 120px,120px 120px;
  background-position:-.5px -.5px,0 0,0 0,0 0,0 0;
  transition:opacity .55s ease;user-select:none;-webkit-user-select:none;touch-action:manipulation}
#boot-loader[data-state=hidden]{opacity:0;pointer-events:none}
#boot-loader canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;
  opacity:0;transition:opacity .9s ease .15s}
#boot-loader[data-phase=game] canvas{opacity:1}
#boot-loader .bl-eyebrow{font-size:9px;letter-spacing:.3em;text-transform:uppercase;color:#888}

/* ── Intro ── */
#boot-loader .bl-intro{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:0 16px 60px;text-align:center;transition:opacity .6s ease,transform .8s cubic-bezier(.16,1,.3,1)}
#boot-loader[data-phase=game] .bl-intro{opacity:0;transform:translateY(-24px);pointer-events:none}
#boot-loader .bl-intro-logo{width:64px;height:64px;object-fit:contain;mix-blend-mode:multiply;
  animation:bl-logo 1.1s cubic-bezier(.16,1,.3,1) both}
#boot-loader .bl-intro .bl-eyebrow{margin-top:28px;animation:bl-rise .9s cubic-bezier(.16,1,.3,1) .35s both}
#boot-loader .bl-title{font-weight:800;font-size:clamp(40px,7vw,84px);line-height:.92;letter-spacing:-.04em;margin:14px 0 0;
  display:flex;gap:.25em;flex-wrap:wrap;justify-content:center}
#boot-loader .bl-title span{display:inline-block;animation:bl-rise 1.1s cubic-bezier(.16,1,.3,1) both}
#boot-loader .bl-title span:nth-child(1){animation-delay:.5s}
#boot-loader .bl-title span:nth-child(2){animation-delay:.65s}
#boot-loader .bl-tag{margin-top:16px;font-size:clamp(16px,2vw,22px);font-style:italic;color:#888;
  animation:bl-rise 1s cubic-bezier(.16,1,.3,1) .85s both}
#boot-loader .bl-rule{width:min(220px,50vw);height:1px;background:#0c0c0c;margin-top:28px;transform-origin:left;
  animation:bl-rule 2.6s cubic-bezier(.65,0,.35,1) .3s both}
#boot-loader .bl-intro-hint{margin-top:16px;animation:bl-fade .8s ease 1.4s both}

/* ── Game HUD ── */
#boot-loader .bl-brand{position:absolute;top:0;left:0;right:0;height:56px;display:flex;align-items:center;gap:12px;padding:0 24px;
  border-bottom:1px solid #d8d6d0;background:rgba(255,255,255,.7);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  opacity:0;transition:opacity .6s ease .2s;pointer-events:none}
#boot-loader .bl-brand img{width:28px;height:28px;object-fit:contain;mix-blend-mode:multiply}
#boot-loader .bl-brand b{font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase}
#boot-loader .bl-hud{position:absolute;top:84px;left:16px;right:16px;display:flex;flex-direction:column;align-items:center;
  pointer-events:none;opacity:0;transform:translateY(10px);transition:opacity .6s ease .25s,transform .8s cubic-bezier(.16,1,.3,1) .25s}
#boot-loader[data-phase=game] .bl-brand,#boot-loader[data-phase=game] .bl-hud{opacity:1;transform:none}
#boot-loader .bl-score{font-weight:800;font-size:64px;letter-spacing:-.05em;line-height:1}
#boot-loader .bl-hud .bl-eyebrow{margin-top:10px}

/* ── Loading strip (bottom edge, mirrors the top bar; never covers the tower) ── */
#boot-loader .bl-strip{position:absolute;left:0;right:0;bottom:0;height:44px;display:flex;align-items:center;justify-content:space-between;
  padding:0 24px;border-top:1px solid #d8d6d0;background:rgba(255,255,255,.7);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  pointer-events:none;animation:bl-fade .8s ease .2s both}
#boot-loader .bl-strip .bl-eyebrow{color:#0c0c0c}
#boot-loader .bl-strip-pct{font-weight:700;font-size:11px;letter-spacing:.1em}
#boot-loader .bl-track{position:absolute;left:0;right:0;top:-1px;height:2px;overflow:hidden}
#boot-loader .bl-bar{height:100%;background:#0c0c0c;transform:scaleX(0);transform-origin:left;transition:transform .35s ease}
#boot-loader[data-state=ready] .bl-bar{transition:none;animation:bl-count 3s linear both}
#boot-loader[data-state=ready] .bl-strip-pct{display:none}
/* Native cursor until the site's custom cursor has mounted (it hides the native one site-wide). */
html:not([data-custom-cursor]) #boot-loader,html:not([data-custom-cursor]) #boot-loader *{cursor:default!important}

@keyframes bl-logo{from{opacity:0;transform:scale(.8) rotate(-8deg)}to{opacity:1;transform:none}}
@keyframes bl-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes bl-fade{from{opacity:0}to{opacity:1}}
@keyframes bl-rule{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes bl-count{from{transform:scaleX(1)}to{transform:scaleX(0)}}
@media (prefers-reduced-motion:reduce){#boot-loader *{animation-duration:.01s!important;animation-delay:0s!important}}
`;

const script = String.raw`(function(){
var root=document.getElementById('boot-loader');if(!root||window.__boot)return;
var cv=root.querySelector('canvas'),ctx=cv.getContext('2d');
function $(id){return document.getElementById(id);}
var scoreEl=$('bl-score'),hintEl=$('bl-hint'),pctEl=$('bl-pct'),barEl=$('bl-bar');
var W=0,H=0,DPR=1,S=1,C=0.866,SN=0.5,BH=0.55,RANGE=3.6;
function resize(){DPR=Math.min(window.devicePixelRatio||1,2);W=window.innerWidth;H=window.innerHeight;
  cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);S=W<640?W/8.2:Math.min(W,H)/11.5;}
resize();window.addEventListener('resize',resize);

/* ── game ── */
var stack,moving=null,debris=[],camY=0,score=0,state='idle',axis,dir,speed,overT=0,flash=null,started=false;
function shade(i){return 93-3*Math.abs(Math.sin(i*0.45));}
function top(){return stack[stack.length-1];}
function hint(t){hintEl.textContent=t;}
function reset(){stack=[{x:0,z:0,w:3,d:3,y0:-14,y1:0,l:shade(0)}];score=0;scoreEl.textContent='0';
  if(started){state='play';hint('Tap or press space to stack');spawn();}}
function spawn(){var p=top();axis=stack.length%2?'x':'z';dir=1;speed=3.1+Math.min(score*0.12,3.4);
  moving={x:p.x,z:p.z,w:p.w,d:p.d,y0:p.y1,y1:p.y1+BH,l:shade(stack.length)};moving[axis]=p[axis]-RANGE;}
function drop(){var p=top(),m=moving,k=axis,sz=k==='x'?'w':'d',delta=m[k]-p[k],over=p[sz]-Math.abs(delta);
  if(over<=0.02){debris.push({b:m,vy:0});moving=null;state='over';overT=0;hint('Tower fell — tap to rebuild');return;}
  if(Math.abs(delta)<0.1){m[k]=p[k];flash={b:m,t:0};hint('Perfect');}
  else{var cut=Math.abs(delta),nc=p[k]+delta/2,piece={x:m.x,z:m.z,w:m.w,d:m.d,y0:m.y0,y1:m.y1,l:m.l};
    piece[sz]=cut;piece[k]=nc+(delta>0?1:-1)*(over/2+cut/2);debris.push({b:piece,vy:0});m[sz]=over;m[k]=nc;
    hint('Keep stacking');}
  stack.push(m);score++;scoreEl.textContent=String(score);spawn();}

function P(x,y,z){return [W/2+(x-z)*C*S,H*0.6+(x+z)*SN*S-(y-camY)*S];}
function poly(pts,fill){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
  for(var i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.stroke();}
function box(b,a){var x0=b.x-b.w/2,x1=b.x+b.w/2,z0=b.z-b.d/2,z1=b.z+b.d/2;ctx.globalAlpha=a;
  poly([P(x0,b.y1,z0),P(x1,b.y1,z0),P(x1,b.y1,z1),P(x0,b.y1,z1)],'hsl(45,18%,'+(b.l+4)+'%)');
  poly([P(x1,b.y1,z0),P(x1,b.y1,z1),P(x1,b.y0,z1),P(x1,b.y0,z0)],'hsl(42,10%,'+(b.l-8)+'%)');
  poly([P(x0,b.y1,z1),P(x1,b.y1,z1),P(x1,b.y0,z1),P(x0,b.y0,z1)],'hsl(40,8%,'+(b.l-17)+'%)');ctx.globalAlpha=1;}

function update(dt){
  if(state==='play'&&moving){var p=top(),off=moving[axis]-p[axis];moving[axis]+=dir*speed*dt;
    if(off>RANGE)dir=-1;else if(off<-RANGE)dir=1;}
  if(state==='over'){overT+=dt;if(overT>1.6)reset();}
  for(var i=debris.length-1;i>=0;i--){var d=debris[i];d.vy-=16*dt;d.b.y0+=d.vy*dt;d.b.y1+=d.vy*dt;
    if(d.b.y1<camY-14)debris.splice(i,1);}
  var target=Math.max(0,top().y1-1.6);camY+=(target-camY)*Math.min(1,dt*(state==='over'?2.5:5));
  if(flash){flash.t+=dt;if(flash.t>0.45)flash=null;}}

function draw(){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);
  ctx.lineJoin='round';ctx.lineWidth=1;ctx.strokeStyle='rgba(12,12,12,.55)';
  for(var i=0;i<stack.length;i++){var b=stack[i];if(b.y1<camY-12)continue;box(b,1);}
  if(moving)box(moving,1);
  for(var j=0;j<debris.length;j++){var d=debris[j];box(d.b,Math.max(0,Math.min(1,1+(d.b.y1-top().y1)/8)));}
  if(flash){var f=flash.b,g=1+flash.t*0.9,hw=f.w/2*g,hd=f.d/2*g;ctx.globalAlpha=1-flash.t/0.45;
    ctx.strokeStyle='#0c0c0c';ctx.lineWidth=1.5;ctx.beginPath();
    var q=[P(f.x-hw,f.y1,f.z-hd),P(f.x+hw,f.y1,f.z-hd),P(f.x+hw,f.y1,f.z+hd),P(f.x-hw,f.y1,f.z+hd)];
    ctx.moveTo(q[0][0],q[0][1]);for(var k=1;k<4;k++)ctx.lineTo(q[k][0],q[k][1]);ctx.closePath();ctx.stroke();ctx.globalAlpha=1;}}

/* ── intro → game ── */
var introTimer=setTimeout(startGame,2800);
function startGame(){if(started)return;started=true;clearTimeout(introTimer);
  root.setAttribute('data-phase','game');reset();}

var hidden=false,raf=0,last=performance.now();
function frame(now){var dt=Math.min((now-last)/1000,0.05);last=now;update(dt);draw();if(!hidden)raf=requestAnimationFrame(frame);}
function act(){if(hidden)return;if(!started){startGame();return;}
  if(state==='play'&&moving)drop();else if(state==='over'&&overT>0.35)reset();}
root.addEventListener('pointerdown',function(e){e.preventDefault();act();});
var enterCb=null,pending=false;
function enter(){if(enterCb)enterCb();else pending=true;}
function onKey(e){if(hidden)return;
  if(e.key===' '||e.code==='Space'){e.preventDefault();act();}
  else if(e.key==='Enter'&&root.getAttribute('data-state')==='ready'){e.preventDefault();enter();}}
window.addEventListener('keydown',onKey);

/* ── auto-enter countdown once loading completes ── */
var COUNT=3,countT=null,statusEl=$('bl-status');
function stopCount(){clearInterval(countT);countT=null;}
function label(n){return 'Studio ready — entering the site in '+n+'s';}
function startCount(){var left=COUNT;statusEl.textContent=label(left);
  countT=setInterval(function(){left--;if(left<=0){stopCount();statusEl.textContent='Entering…';enter();}
    else statusEl.textContent=label(left);},1000);}

/* ── loading progress ── */
var shown=0;
window.__boot={
  setProgress:function(p){p=Math.max(0,Math.min(1,p||0));
    if(p<shown)return;shown=p;pctEl.textContent=Math.round(p*100)+'%';barEl.style.transform='scaleX('+p+')';},
  setReady:function(){this.setProgress(1);
    if(root.getAttribute('data-state')==='loading'){root.setAttribute('data-state','ready');startCount();}},
  onEnter:function(cb){enterCb=cb;if(pending){pending=false;cb();}},
  hide:function(instant){if(hidden)return;hidden=true;clearTimeout(introTimer);stopCount();root.setAttribute('data-state','hidden');
    window.removeEventListener('keydown',onKey);window.removeEventListener('resize',resize);cancelAnimationFrame(raf);
    setTimeout(function(){root.style.display='none';},instant?0:600);}
};
reset();raf=requestAnimationFrame(frame);
})();`;

export default function BootLoader() {
  return (
    <div
      id="boot-loader"
      data-phase="intro"
      data-state="loading"
      suppressHydrationWarning
      aria-label="Loading Noyyal Studios"
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {/* width/height are set by the inline script before hydration */}
      <canvas aria-hidden="true" suppressHydrationWarning />

      {/* Intro: brand reveal, then hands over to the game */}
      <div className="bl-intro">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="bl-intro-logo" src="/n3.png" alt="" />
        <div className="bl-eyebrow">— Architecture &amp; Research Studio</div>
        <h1 className="bl-title"><span>Noyyal</span><span>Studios</span></h1>
        <div className="bl-tag">Space as inquiry.</div>
        <div className="bl-rule" />
        <div className="bl-eyebrow bl-intro-hint">Build a tower while the studio loads · tap to start</div>
      </div>

      {/* Game HUD (mirrors the site's navigation bar) */}
      <div className="bl-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/n3.png" alt="" />
        <b>Noyyal Studios</b>
      </div>
      <div className="bl-hud">
        <div id="bl-score" className="bl-score" suppressHydrationWarning>0</div>
        <div id="bl-hint" className="bl-eyebrow" suppressHydrationWarning>Tap or press space to stack</div>
      </div>

      {/* Slim loading strip along the bottom edge; turns into the auto-enter countdown */}
      <div className="bl-strip" role="status">
        <div className="bl-track">
          <div id="bl-bar" className="bl-bar" suppressHydrationWarning />
        </div>
        <span id="bl-status" className="bl-eyebrow" suppressHydrationWarning>Loading the studio</span>
        <span id="bl-pct" className="bl-strip-pct" suppressHydrationWarning>0%</span>
      </div>

      <script dangerouslySetInnerHTML={{ __html: script }} />
    </div>
  );
}
