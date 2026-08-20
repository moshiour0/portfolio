import { chromium } from 'playwright';
const b = await chromium.launch({ channel:'chromium', args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport:{width:1440,height:900} });
await p.goto(process.argv[2],{waitUntil:'load',timeout:60000});
await p.waitForTimeout(2500);
console.log('section     stageH  tallestCard  cropped?   cardZ  headingZ  cardOverHeading?');
for (const id of ['pillars','projects','research','skills','exploring']) {
  await p.evaluate(i=>document.getElementById(i).scrollIntoView({behavior:'instant',block:'start'}),id);
  await p.waitForTimeout(2600);
  const r = await p.evaluate((id)=>{
    const sec=document.getElementById(id);
    const stage=sec.querySelector('.carousel-stage');
    if(!stage) return null;
    const sh=Math.round(stage.getBoundingClientRect().height);
    let tallest=0, z=0;
    for(const c of sec.querySelectorAll('.card-face')){
      tallest=Math.max(tallest, c.scrollHeight);
      const w=c.parentElement;
      z=Math.max(z, parseInt(getComputedStyle(w).zIndex)||0);
    }
    const head=sec.querySelector('.reveal');
    const hz=parseInt(getComputedStyle(head).zIndex)||0;
    return { sh, tallest, z, hz,
             overflowStyle: getComputedStyle(stage).overflow };
  }, id);
  if(!r){ console.log(`${id.padEnd(11)} (no stage)`); continue; }
  const crop = r.tallest - r.sh;
  console.log(`${id.padEnd(11)} ${String(r.sh).padStart(5)}  ${String(r.tallest).padStart(10)}  ${(crop>0?`CUT ${crop}px`:'ok').padEnd(10)} ${String(r.z).padStart(5)}  ${String(r.hz).padStart(7)}  ${r.z>r.hz?'YES ✗':'no ✓'}`);
}
await b.close();
