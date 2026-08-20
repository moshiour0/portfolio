import { chromium } from 'playwright';
import fs from 'node:fs';
const URL=process.argv[2], OUT=process.argv[3];
fs.mkdirSync(OUT,{recursive:true});
const VIEWPORTS = [[1440,900],[1280,800],[1920,1080]];
const browser = await chromium.launch({ channel:'chromium', args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'] });

for (const [W,H] of VIEWPORTS) {
  const page = await browser.newPage({ viewport:{width:W,height:H} });
  const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
  await page.goto(URL,{waitUntil:'load',timeout:60000});
  await page.waitForTimeout(2500);
  console.log(`\n=== ${W}x${H} ===`);
  for (const id of ['hero','pillars','projects','research','skills','exploring','contact']) {
    await page.evaluate(i=>document.getElementById(i).scrollIntoView({behavior:'instant',block:'start'}),id);
    await page.waitForTimeout(2600);
    const r = await page.evaluate((id)=>{
      const sec=document.getElementById(id);
      const nav=64;
      const DECOR = /curtain|hero-orb|spiral-glow|video-scrim|grain|carousel-viewport/;
      const kids=[...sec.querySelectorAll('*')].filter(el=>{
        const b=el.getBoundingClientRect();
        if (el.getAttribute('aria-hidden')==='true') return false;
        if (typeof el.className==='string' && DECOR.test(el.className)) return false;
        return b.width>8 && b.height>4 && el.checkVisibility() &&
               getComputedStyle(el).position!=='fixed';
      });
      let top=Infinity, bot=-Infinity;
      for(const el of kids){ const b=el.getBoundingClientRect(); if(b.height>window.innerHeight*1.5) continue; top=Math.min(top,b.top); bot=Math.max(bot,b.bottom); }
      return { top:Math.round(top), bottom:Math.round(bot), vh:window.innerHeight, nav,
               overflowTop: top < nav-2, overflowBottom: bot > window.innerHeight+2,
               contentH: Math.round(bot-top) };
    }, id);
    const ok = !r.overflowTop && !r.overflowBottom;
    console.log(`  ${id.padEnd(11)} content ${String(r.top).padStart(4)}→${String(r.bottom).padStart(4)} of ${r.vh}  h=${r.contentH}  ${ok?'FITS ✓':(r.overflowBottom?`OVERFLOWS BOTTOM by ${r.bottom-r.vh}px ✗`:`CLIPPED BY NAV ✗`)}`);
  }
  console.log('  errors:', errs.length);
  if (W===1440) {
    for (const id of ['pillars','projects','exploring']) {
      await page.evaluate(i=>document.getElementById(i).scrollIntoView({behavior:'instant',block:'start'}),id);
      await page.waitForTimeout(2600);
      await page.screenshot({path:`${OUT}/fit-${id}.png`});
    }
  }
  await page.close();
}
await browser.close();
