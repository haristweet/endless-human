// 歌詞から口の形の確認：曲（歌詞入りの m4a か、.lrc などを別に）を入れ、行ごとの音（母音・唇を閉じる音 m・時刻）と、26〜33 秒の 0.1 秒ごとの口を出す
//   python3 -m http.server 8804 &  node test/lyricmouth.cjs 曲.m4a
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1300,height:900}});p.on('pageerror',e=>console.log('pageerror',e.message));p.on('console',m=>{if(m.type()==='error')console.log('console',m.text().slice(0,200));});
await p.goto('http://localhost:8804/');await p.evaluate(()=>localStorage.clear());await p.reload();
const t0=Date.now();await p.setInputFiles('#afile',process.argv[2]);
await p.waitForFunction(()=>snd&&!snd.mtlBusy&&(snd.mtl||snd.mtlErr),null,{timeout:180000});
console.log('time',((Date.now()-t0)/1000).toFixed(1)+'s');console.log(await p.textContent('#linfo'));
console.log(await p.evaluate(()=>snd.lyrics.slice(0,9).map(l=>{const ms=snd.mtl.filter(m=>m.t0>=l.t0-.001&&m.t0<l.t1);return l.text+' ['+l.t0.toFixed(2)+'-'+l.t1.toFixed(2)+'] '+ms.map(m=>(m.lip?'m':'')+m.v+'@'+m.t0.toFixed(2)).join(' ');}).join('\n')));
// 26〜33 秒の 0.1 秒ごとの口
console.log(await p.evaluate(()=>{const s=newSim();const r=[];cfg.aoff=0;for(let t=26;t<33;t+=.1){s.time=t;r.push(mouthShape(s).v);}return r.join('');}));
await b.close();})();
