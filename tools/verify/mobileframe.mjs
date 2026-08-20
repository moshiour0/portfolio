import { chromium } from 'playwright';
import fs from 'node:fs';
const OUT=process.argv[3]; fs.mkdirSync(OUT,{recursive:true});
// subject x-ranges from the asset specs
const SUB={hero:[11.2,38.9],intro:[15,50],pillars:[15,50],skills:[25,65],journey:[24,38.5],
           education:[20,55],achievements:[10,48],about:[22,52],exploring:[55,95],contact:[21.1,52.6]};
const b = await chromium.launch({ channel:'chromium', args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'] });
const c = await b.newContext({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true });
const p = await c.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
await p.goto(process.argv[2],{waitUntil:'load',timeout:60000});
await p.waitForTimeout(3000);
console.log('section       subject x    visible window   subject visible?');
for (const [id,[s0,s1]] of Object.entries(SUB)) {
  await p.evaluate(i=>document.getElementById(i)?.scrollIntoView({behavior:'instant',block:'start'}),id);
  await p.waitForTimeout(2600);
  const r = await p.evaluate(()=>{
    const v=[...document.querySelectorAll('video')].find(x=>!x.paused) || document.querySelector('video');
    const cs=getComputedStyle(v);
    const bw=v.getBoundingClientRect().width, bh=v.getBoundingClientRect().height;
    const vw=v.videoWidth||1920, vh=v.videoHeight||1080;
    const scale=Math.max(bw/vw,bh/vh);
    const scaledW=vw*scale;
    const posX=parseFloat(cs.objectPosition.split(' ')[0])/100;   // fraction
    // left edge of the visible window within the scaled image
    const offset=(scaledW-bw)*posX;
    return { fit:cs.objectFit, pos:cs.objectPosition,
             winStart:+(offset/scaledW*100).toFixed(1),
             winEnd:+((offset+bw)/scaledW*100).toFixed(1) };
  });
  const covers = r.winStart <= s1 && r.winEnd >= s0;
  const midIn = ((s0+s1)/2) >= r.winStart && ((s0+s1)/2) <= r.winEnd;
  console.log(`${id.padEnd(13)} ${(s0+'–'+s1+'%').padEnd(12)} ${(r.winStart+'–'+r.winEnd+'%').padEnd(16)} ${midIn?'CENTRED ✓':covers?'partial ~':'MISSED ✗'}   fit=${r.fit}`);
  await p.screenshot({path:`${OUT}/f-${id}.png`});
}
console.log('errors:', errs.length?errs:'none');
await b.close();
