/* Shared with main site: same counter key, same per-session marker. */
(()=>{'use strict';
const root='https://countapi.mileshilliard.com/api/v1';
const key='arvion_lukaszednarski998_site_views_301087_v2';
const sessionKey='arvionVisitCounted301087V2';
const start=301087;
const output=document.getElementById('visitCount');
if(!output)return;
let counted=false;try{counted=sessionStorage.getItem(sessionKey)==='1'}catch(_){}
const fmt=new Intl.NumberFormat(document.documentElement.lang||'en');
output.textContent=fmt.format(start);
const controller=new AbortController();
const timeout=setTimeout(()=>controller.abort(),8000);
fetch(root+'/'+(counted?'get':'hit')+'/'+encodeURIComponent(key)+'?t='+Date.now(),{cache:'no-store',mode:'cors',credentials:'omit',signal:controller.signal}).then(res=>{if(!res.ok){if(res.status===404&&counted)return {value:0};throw Error('Counter unavailable')};return res.json()}).then(data=>{const n=Number(data.value);if(!Number.isSafeInteger(n)||n<0)return;output.textContent=fmt.format(start+n);if(!counted){try{sessionStorage.setItem(sessionKey,'1')}catch(_){}}}).catch(()=>{output.title='Live counter temporarily unavailable';}).finally(()=>clearTimeout(timeout));
})();