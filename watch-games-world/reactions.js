/* ARVION public reactions. Counts are starting values plus live shared clicks. */
(function () {
  'use strict';
  const api='https://countapi.mileshilliard.com/api/v1';
  const lang=(document.documentElement.lang||'en').toLowerCase();
  const polish=lang.startsWith('pl');
  const configs=[
    {buttonId:'goldButton',countId:'goldCount',start:21154,key:'arvion_lukaszednarski998_gold_21154_v1',localKey:'arvionGoldAddedV1',name:polish?'sztabkę złota':'gold bar'},
    {buttonId:'heartButton',countId:'heartCount',start:45135,key:'arvion_lukaszednarski998_hearts_45135_v1',localKey:'arvionHeartAdded20261030V1',name:polish?'serduszko':'heart'}
  ];
  const format=new Intl.NumberFormat(document.documentElement.lang||'en');
  function saved(key){try{return localStorage.getItem(key)==='1'}catch(e){return false}}
  function save(key){try{localStorage.setItem(key,'1')}catch(e){}}
  async function request(key,action){
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),8000);
    try{
      const res=await fetch(api+'/'+action+'/'+encodeURIComponent(key)+'?t='+Date.now(),
        {cache:'no-store',mode:'cors',credentials:'omit',signal:controller.signal});
      if(action==='get'&&res.status===404)return 0;
      if(!res.ok)throw new Error('HTTP '+res.status);
      const data=await res.json();
      const count=Number(data.value);
      if(!Number.isSafeInteger(count)||count<0)throw new Error('Invalid counter');
      return count;
    }catch(e){
      console.warn('ARVION reactions temporarily unavailable:',action,e);
      return null;
    }finally{clearTimeout(timeout)}
  }
  function notice(message){
    let el=document.getElementById('arvionReactionNotice');
    if(!el){
      el=document.createElement('div');
      el.id='arvionReactionNotice';
      el.setAttribute('role','status');
      el.setAttribute('aria-live','polite');
      el.style.cssText='position:fixed;bottom:18px;left:50%;transform:translateX(-50%);padding:12px 18px;border:1px solid #d8aa43;background:#17130d;color:#ffe09b;border-radius:12px;z-index:11000;max-width:90vw;text-align:center;font:600 13px system-ui';
      document.body.appendChild(el);
    }
    el.textContent=message;
    clearTimeout(el._hideTimer);
    el._hideTimer=setTimeout(()=>el.remove(),3500);
  }
  for(const cfg of configs){
    const button=document.getElementById(cfg.buttonId);
    const output=document.getElementById(cfg.countId);
    if(!button||!output)continue;
    let revision=0;
    function paint(n){output.textContent=format.format(cfg.start+n)}
    function mark(){
      const done=saved(cfg.localKey);
      button.classList.toggle('is-added',done);
      button.setAttribute('aria-pressed',done?'true':'false');
      if(done)button.title=polish?'Już dodano z tej przeglądarki':'Already added from this browser';
    }
    paint(0);
    mark();
    async function refresh(){
      const version=revision;
      const count=await request(cfg.key,'get');
      if(count!==null&&revision===version)paint(count);
    }
    button.addEventListener('click',async()=>{
      if(saved(cfg.localKey)){
        notice(polish?'Już dodano z tej przeglądarki.':'You already added one from this browser.');
        return;
      }
      const version=++revision;
      button.disabled=true;
      const count=await request(cfg.key,'hit');
      button.disabled=false;
      if(count===null){
        notice(polish?'Nie można teraz zapisać. Spróbuj ponownie.':'Cannot save right now. Please try again.');
        return;
      }
      if(revision===version)paint(count);
      save(cfg.localKey);
      mark();
    });
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh()});
    window.addEventListener('storage',e=>{if(e.key===cfg.localKey)mark()});
    refresh();
  }
})();
