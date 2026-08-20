import { chromium } from "playwright";
const b = await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport:{width:1440,height:900}});
const vids=[]; p.on("response",r=>{ if(/\.(mp4|webm)$/i.test(r.url())) vids.push(r.url().split("/").slice(-2).join("/")); });
const errs=[]; p.on("pageerror",e=>errs.push(String(e)));
await p.goto(process.argv[2],{waitUntil:"load"}); await p.waitForTimeout(3000);
const r = await p.evaluate(()=>({
  coarse: matchMedia("(pointer: coarse)").matches,
  lenis: !!document.documentElement.className.match(/lenis/),
  webgl: !!document.querySelector("canvas"),
  backdropFilters: [...document.querySelectorAll("*")].filter(e=>getComputedStyle(e).backdropFilter!=="none").length,
}));
await p.evaluate(()=>document.getElementById("journey")?.scrollIntoView({block:"start"}));
await p.waitForTimeout(2200);
console.log(JSON.stringify({...r, videos:[...new Set(vids)], mobileEncodesUsed: vids.some(v=>v.startsWith("m/")), errors:errs},null,1));
await b.close();
