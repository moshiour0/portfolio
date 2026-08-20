import { chromium } from "playwright";
const base = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true });
const p = await ctx.newPage();
await p.goto(base,{waitUntil:"load"});
await p.waitForTimeout(2000);
const out=[];
for (const id of ["hero","intro","pillars","research","skills","journey","about","contact"]) {
  const y = await p.evaluate(s=>{const e=document.getElementById(s);return e?e.getBoundingClientRect().top+scrollY:null;},id);
  if (y==null){out.push([id,"no section"]);continue;}
  // scroll in steps so scroll events fire, then rest
  await p.evaluate(async ty=>{
    await new Promise(res=>{
      const step=()=>{const d=ty-scrollY; if(Math.abs(d)<12){scrollTo(0,ty);return res();} scrollBy(0,Math.sign(d)*Math.min(60,Math.abs(d))); requestAnimationFrame(step);};
      requestAnimationFrame(step);
    });
  }, y+40);
  await p.waitForTimeout(1400);   // well past the 180ms idle timer
  const st = await p.evaluate(()=>{
    const v=[...document.querySelectorAll("video")].filter(v=>v.currentSrc);
    const live=v.filter(x=>!x.paused);
    return {playing:live.length, rate:live.map(x=>+x.playbackRate.toFixed(3)), src:live.map(x=>x.currentSrc.split("/").pop())};
  });
  out.push([id, JSON.stringify(st)]);
}
for(const [a,c] of out) console.log(a.padEnd(14), c);
await b.close();
