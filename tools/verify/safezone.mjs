import { chromium } from 'playwright';
import fs from 'node:fs';
const URL = process.argv[2], OUT = process.argv[3];
fs.mkdirSync(OUT, { recursive: true });

// Entity boxes straight from Ai-Text-Placement-Config.json (percent of frame)
const ENTITY = {
  hero:       { name:'YOU_FIRST', left:11.2, right:38.9 },
  experience: { name:'MONKEY',    left:24.0, right:38.5 },
  projects:   { name:'FISH',      left:44.4, right:62.3 },
  contact:    { name:'YOU_PEAK',  left:21.1, right:52.6 },
};

const browser = await chromium.launch({ channel:'chromium', args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport:{ width:1440, height:900 } });
const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
await page.goto(URL,{waitUntil:'load',timeout:60000});
await page.waitForTimeout(3000);

console.log('Does content stay clear of the subject? (viewport width 1440)\n');
for (const [id, ent] of Object.entries(ENTITY)) {
  await page.evaluate(i => document.getElementById(i).scrollIntoView({behavior:'instant',block:'start'}), id);
  await page.waitForTimeout(3200);

  const r = await page.evaluate((id) => {
    const sec = document.getElementById(id);
    // widest meaningful content box in this section
    const nodes = [...sec.querySelectorAll('h1,h2,p,article,[role="group"],a,button')]
      .filter(el => el.getBoundingClientRect().width > 40 && el.checkVisibility());
    if (!nodes.length) return null;
    let min = Infinity, max = -Infinity;
    for (const el of nodes) {
      const b = el.getBoundingClientRect();
      if (b.width < 40 || b.height < 8) continue;
      min = Math.min(min, b.left); max = Math.max(max, b.right);
    }
    return { minPct:+(min/window.innerWidth*100).toFixed(1), maxPct:+(max/window.innerWidth*100).toFixed(1) };
  }, id);

  const clear = r && r.minPct >= ent.right;
  console.log(`  ${id.padEnd(11)} subject ${ent.name.padEnd(10)} spans ${ent.left}%-${ent.right}%  |  content spans ${r.minPct}%-${r.maxPct}%  => ${clear ? 'CLEAR ✓' : 'OVERLAPS ✗'}`);
  await page.screenshot({ path:`${OUT}/sz-${id}.png` });
}
console.log('\nerrors:', errs);
await browser.close();
