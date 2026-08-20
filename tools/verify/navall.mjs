import { chromium } from 'playwright';
const b = await chromium.launch({ channel:'chromium', args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport:{width:1440,height:900} });
for (const from of ['/projects','/research','/achievements','/about','/contact']) {
  for (const to of ['Skills','Contact']) {
    await p.goto(process.argv[2]+from,{waitUntil:'load',timeout:60000});
    await p.waitForTimeout(1200);
    await p.click(`header nav a:has-text("${to}")`).catch(()=>{});
    await p.waitForTimeout(5600);
    const r = await p.evaluate((t)=>{ const id=t.toLowerCase();
      const el=document.getElementById(id);
      return { path:location.pathname, top: el?Math.round(el.getBoundingClientRect().top):null }; }, to);
    console.log(`  ${from.padEnd(14)} -> ${to.padEnd(9)} path=${r.path.padEnd(3)} sectionTop=${String(r.top).padStart(5)}  ${r.path==='/'&&Math.abs(r.top)<40?'✓':'✗'}`);
  }
}
await b.close();
