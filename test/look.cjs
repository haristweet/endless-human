// 写真の顔を、画面で見るのと同じ設定（ポリゴン・走査線あり）で大きく描いて並べる：正面・斜め・横顔の寄り・目の寄り・口を開けた横顔・頭全体の斜め後ろ
//   python3 -m http.server 8804 &  node test/look.cjs 顔写真.png [横顔.png] 出力.png
//   STYLE=wire や CRT=0 で描き方を変えられる。写真はリポジトリに入れない
const { chromium } = require('playwright');
(async()=>{const args=process.argv.slice(2),out=args.pop();
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1300,height:900}});p.on('pageerror',e=>console.error('pageerror',e.message));
await p.goto('http://localhost:8804/');await p.evaluate(()=>localStorage.clear());await p.reload();
await p.setInputFiles('#pfile',args);
await p.waitForFunction(()=>/作りました|見つから/.test(document.querySelector('#pinfo').textContent),null,{timeout:180000});
console.log('pinfo:',await p.textContent('#pinfo'));
const style=process.env.STYLE||'solid',crt=process.env.CRT!=='0',cells=[];
for(const[eye,target,open]of[[[0,0,3],[0,0,.3],0],[[1.9,.2,2.3],[0,0,.3],0],[[2.7,0,.3],[0,0,.3],0],[[.5,.25,1.9],[0,.2,.5],0],[[2.4,-.3,1],[0,-.3,.4],1],[[-3.4,.8,-3.6],[0,.2,-.3],0]])
  cells.push(await p.evaluate(([eye,target,open,style,crt])=>{playing=false;exporting=true;Object.assign(cfg,{style,crt,pixel:'full'});const s=newSim();s.time=.25;window.mouthOpen=()=>open;
    const c=document.createElement('canvas');c.width=960;c.height=540;s.shot=()=>({eye,target,roll:0});drawFrame(c.getContext('2d'),960,540,s,lookFor(s));return c.toDataURL();},[eye,target,open,style,crt]));
await p.setContent('<body style="margin:0;background:#222">'+cells.map(u=>`<img src="${u}" width=640>`).join('')+'</body>');await p.setViewportSize({width:1280,height:1080});
await p.screenshot({path:out,fullPage:true});await b.close();})();
