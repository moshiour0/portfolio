import { chromium } from 'playwright';
const URL = process.argv[2];
const browser = await chromium.launch({ channel:'chromium', args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'] });

// A: reduced motion — must download ZERO video
const rc = await browser.newContext({ viewport:{width:1280,height:800}, reducedMotion:'reduce' });
const rp = await rc.newPage(); const rv=[]; const rerr=[];
rp.on('pageerror',e=>rerr.push(String(e)));
rp.on('response', r=>{ if(/\.(mp4|webm)$/i.test(r.url())) rv.push(r.url().split('/').pop()); });
await rp.goto(URL,{waitUntil:'load',timeout:60000}); await rp.waitForTimeout(3000);
for (const id of ['journey','projects','contact']) { await rp.evaluate(i=>document.getElementById(i)?.scrollIntoView({block:'start'}),id); await rp.waitForTimeout(1800); }
console.log('REDUCED MOTION -> videos downloaded:', rv.length ? rv.join(', ') : 'NONE ✓', '| errors:', rerr.length);
await rc.close();

// B: normal — video must still work
const nc = await browser.newContext({ viewport:{width:1440,height:900} });
const np = await nc.newPage(); const nv=[]; const nerr=[];
np.on('pageerror',e=>nerr.push(String(e)));
np.on('response', r=>{ if(/\.(mp4|webm)$/i.test(r.url())) nv.push(r.url().split('/').pop()); });
await np.goto(URL,{waitUntil:'load',timeout:60000}); await np.waitForTimeout(3500);
const heroPlaying = await np.evaluate(()=>{const v=document.querySelectorAll('video')[0];return {paused:v.paused,src:v.currentSrc.split('/').pop(),t:v.currentTime};});
console.log('NORMAL -> hero:', JSON.stringify(heroPlaying), '| downloaded:', nv.join(', '));
await np.evaluate(()=>document.getElementById('contact').scrollIntoView({block:'start'})); await np.waitForTimeout(3000);
const contactState = await np.evaluate(()=>{const vs=[...document.querySelectorAll('video')];return {playing:vs.filter(v=>!v.paused).length, which:vs.filter(v=>!v.paused).map(v=>v.currentSrc.split('/').pop())};});
console.log('NORMAL -> at contact:', JSON.stringify(contactState), '| errors:', nerr.length);

// C: mobile overflow
const mc = await browser.newContext({ viewport:{width:375,height:812}, isMobile:true, hasTouch:true });
const mp = await mc.newPage(); const merr=[];
mp.on('pageerror',e=>merr.push(String(e)));
await mp.goto(URL,{waitUntil:'load',timeout:60000}); await mp.waitForTimeout(3000);
const mo = await mp.evaluate(()=>({ overflow: document.documentElement.scrollWidth > window.innerWidth+1, sw: document.documentElement.scrollWidth }));
console.log('MOBILE -> horizontalOverflow:', mo.overflow, '| scrollWidth:', mo.sw, '| errors:', merr.length);
await mp.screenshot({ path: process.argv[3] });
await browser.close();
