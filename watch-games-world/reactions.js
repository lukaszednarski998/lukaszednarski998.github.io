/* Watch Games World independent public reactions, zero-based. */
(function () {
  'use strict';
  const api='https://countapi.mileshilliard.com/api/v1';
  const lang=(document.documentElement.lang||'en').toLowerCase();
  const polish=lang.startsWith('pl');
  const localized={
    en:{already:'Already added from this browser.',failure:'Cannot save right now. Please try again.'},
    pl:{already:'Już dodano z tej przeglądarki.',failure:'Nie można teraz zapisać. Spróbuj ponownie.'},
    de:{already:'Von diesem Browser bereits hinzugefügt.',failure:'Speichern momentan nicht möglich. Bitte später erneut versuchen.'},
    fr:{already:'Déjà ajouté depuis ce navigateur.',failure:'Enregistrement impossible. Veuillez réessayer plus tard.'},
    es:{already:'Ya se ha añadido desde este navegador.',failure:'No se puede guardar ahora. Inténtalo de nuevo.'},
    it:{already:'Già aggiunto da questo browser.',failure:'Impossibile salvare ora. Riprova più tardi.'},
    'pt-br':{already:'Já foi adicionado neste navegador.',failure:'Não foi possível salvar agora. Tente novamente.'},
    ja:{already:'このブラウザーから追加済みです。',failure:'現在保存できません。後でもう一度お試しください。'},
    ko:{already:'이 브라우저에서 이미 추가했습니다.',failure:'지금 저장할 수 없습니다. 나중에 다시 시도하세요.'},
    'zh-cn':{already:'此浏览器已添加。',failure:'暂时无法保存，请稍后重试。'},
    tr:{already:'Bu tarayıcıdan zaten eklendi.',failure:'Şu anda kaydedilemiyor. Daha sonra tekrar deneyin.'},
    id:{already:'Sudah ditambahkan dari browser ini.',failure:'Tidak dapat menyimpan sekarang. Coba lagi nanti.'},
    ru:{already:'Уже добавлено из этого браузера.',failure:'Сейчас не удалось сохранить. Повторите попытку позже.'},
    uk:{already:'Уже додано з цього браузера.',failure:'Зараз не вдалося зберегти. Спробуйте пізніше.'}
  };
  const msg=localized[lang]||localized.en;
  const configs=[
    {buttonId:'goldButton',countId:'goldCount',start:0,key:'wgw_watch_games_world_gold_20261107_v1_r8d45',localKey:'wgwGoldAdded20261107V1',name:polish?'sztabkę złota':'gold bar'},
    {buttonId:'heartButton',countId:'heartCount',start:0,key:'wgw_watch_games_world_hearts_20261107_v1_m27e1',localKey:'wgwHeartAdded20261107V1',name:polish?'serduszko':'heart'}
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
      console.warn('WGW reactions temporarily unavailable:',action,e);
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
      if(done)button.title=msg.already;
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
        notice(msg.already);
        return;
      }
      const version=++revision;
      button.disabled=true;
      const count=await request(cfg.key,'hit');
      button.disabled=false;
      if(count===null){
        notice(msg.failure);
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
