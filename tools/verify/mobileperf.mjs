import { chromium } from 'playwright';
const URL = process.argv[2];
const b = await chromium.launch({ channel:'chromium', args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'] });
const c = await b.newContext({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true, deviceScaleFactor:2 });
const p = await c.newPage();
const cdp = await c.newCDPSession(p);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });   // mid-range phone

await p.addInitScript(() => {
  window.__raf = 0; window.__long = [];
  const orig = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => { window.__raf++; return orig(cb); };
  new PerformanceObserver((l)=>{ for(const e of l.getEntries()) window.__long.push(Math.round(e.duration)); })
    .observe({entryTypes:['longtask']});
});

await p.goto(URL,{waitUntil:'load',timeout:90000});
await p.waitForTimeout(5000);

const env = await p.evaluate(()=>({
  lenisActive: document.documentElement.classList.contains('lenis'),
  carousels: document.querySelectorAll('[aria-roledescription="carousel"]').length,
  webglCanvas: !!document.querySelector('canvas'),
  backdropFilters: [...document.querySelectorAll('*')].filter(e=>{
    const f=getComputedStyle(e).backdropFilter; return f && f!=='none';
  }).length,
  blurFilters: [...document.querySelectorAll('*')].filter(e=>{
    const f=getComputedStyle(e).filter; return f && f!=='none' && f.includes('blur');
  }).length,
}));
console.log('environment:', JSON.stringify(env,null,1));

// measure frame pacing while scrolling
await p.evaluate(()=>{ window.__long=[]; window.__frames=[]; let last=performance.now();
  const tick=(t)=>{ window.__frames.push(t-last); last=t; if(window.__frames.length<400) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});
for (let i=0;i<26;i++){ await p.mouse.wheel(0,420); await p.waitForTimeout(120); }
await p.waitForTimeout(1500);

const perf = await p.evaluate(()=>{
  const f=window.__frames.filter(x=>x>0);
  f.sort((a,b)=>a-b);
  const pct=(q)=>f[Math.floor(f.length*q)]||0;
  return { frames:f.length, medianMs:+pct(0.5).toFixed(1), p95Ms:+pct(0.95).toFixed(1),
           worstMs:+f[f.length-1].toFixed(1),
           janky: f.filter(x=>x>50).length,
           longTasks: window.__long.length, longTaskMax: Math.max(0,...window.__long),
           rafCalls: window.__raf };
});
console.log('scroll perf (4x CPU throttle):', JSON.stringify(perf,null,1));
await b.close();
