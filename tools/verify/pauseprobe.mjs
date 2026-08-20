import { chromium } from "playwright";
const base = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});
await p.goto(base,{waitUntil:"load"});
await p.waitForTimeout(2500);

const r = await p.evaluate(async () => {
  const coarse = matchMedia("(pointer: coarse)").matches;
  const vids = () => [...document.querySelectorAll("video")];
  const playingNow = () => vids().filter(v=>!v.paused && !v.ended).length;
  const samples = [];
  let stop = false;
  const poll = setInterval(()=>samples.push(playingNow()), 60);
  // scroll continuously for 3s
  const t0 = performance.now();
  await new Promise(res=>{
    const step = () => {
      window.scrollBy(0, 22);
      if (performance.now()-t0 > 3000) return res();
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  const during = samples.slice();
  samples.length = 0;
  await new Promise(r=>setTimeout(r,900));   // idle
  const after = samples.slice();
  clearInterval(poll);
  return {
    coarse,
    layers: vids().length,
    withSources: vids().filter(v=>v.querySelector("source")).length,
    srcUsed: vids().map(v=>v.currentSrc).filter(Boolean).map(s=>s.split("/").slice(-2).join("/")),
    playingDuringScroll: during.length ? (during.reduce((a,c)=>a+c,0)/during.length).toFixed(2) : "n/a",
    maxDuringScroll: Math.max(0,...during),
    playingAfterIdle: after.length ? (after.reduce((a,c)=>a+c,0)/after.length).toFixed(2) : "n/a",
  };
});
console.log(JSON.stringify(r,null,1));
await b.close();
