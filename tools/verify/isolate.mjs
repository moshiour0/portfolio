import { chromium } from 'playwright';
const URL = process.argv[2];
const b = await chromium.launch({ channel:'chromium', args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'] });

async function run(label, opts) {
  const c = await b.newContext({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true, deviceScaleFactor:2, ...opts.ctx });
  const p = await c.newPage();
  const cdp = await c.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await p.addInitScript(()=>{ window.__long=[]; new PerformanceObserver(l=>{for(const e of l.getEntries())window.__long.push(Math.round(e.duration));}).observe({entryTypes:['longtask']}); });
  await p.goto(URL,{waitUntil:'load',timeout:90000});
  await p.waitForTimeout(4000);
  if (opts.killVideo) await p.evaluate(()=>document.querySelectorAll('video').forEach(v=>{v.pause(); v.removeAttribute('src'); v.load();}));
  await p.waitForTimeout(1200);
  await p.evaluate(()=>{ window.__long=[]; window.__frames=[]; let last=performance.now();
    const t=(x)=>{window.__frames.push(x-last); last=x; if(window.__frames.length<300) requestAnimationFrame(t);}; requestAnimationFrame(t); });
  for (let i=0;i<20;i++){ await p.mouse.wheel(0,420); await p.waitForTimeout(120); }
  await p.waitForTimeout(1200);
  const r = await p.evaluate(()=>{ const f=window.__frames.filter(x=>x>0).sort((a,b)=>a-b);
    return { median:+(f[Math.floor(f.length*0.5)]||0).toFixed(0), janky:f.filter(x=>x>50).length, total:f.length,
             longTasks:window.__long.length, maxLong:Math.max(0,...window.__long),
             videos:document.querySelectorAll('video').length,
             playing:[...document.querySelectorAll('video')].filter(v=>!v.paused).length }; });
  console.log(`${label.padEnd(28)} median=${String(r.median).padStart(4)}ms  janky=${r.janky}/${r.total}  longTasks=${String(r.longTasks).padStart(3)} (max ${r.maxLong}ms)  playing=${r.playing}`);
  await c.close();
}

await run('current (video on)', {});
await run('video stopped', { killVideo:true });
await run('reduced-motion (no video)', { ctx:{ reducedMotion:'reduce' } });
await b.close();
