/* E-Wnuczek: optional, minimal EU analytics. No SDK, replay or autocapture. */
(function () {
  'use strict';
  if (!['ewnuczek.pl','www.ewnuczek.pl'].includes(location.hostname)) return;
  const C='ewnuczek_analytics_consent_v1', I='ewnuczek_analytics_internal_v1';
  const V='ewnuczek_analytics_visitor_v1';
  const get=k=>{try{return localStorage.getItem(k)}catch{return null}};
  const put=(k,v)=>{try{localStorage.setItem(k,v);return true}catch{return false}};
  const clear=()=>{try{localStorage.removeItem(V)}catch{}};
  const allowed=()=>get(C)==='granted'&&get(I)!=='1';
  let counted=false;
  function send(event, extra) {
    if (!allowed() || !['$pageview','landing_app_click'].includes(event)) return;
    try {
      let id=get(V);
      if(!id){id=crypto.randomUUID();if(!put(V,id))return}
      let referring='direct';
      try{if(document.referrer)referring=new URL(document.referrer).hostname}catch{}
      const properties={
        distinct_id:id,$process_person_profile:false,$geoip_disable:true,
        $ip:null,$current_url:'https://ewnuczek.pl/',$pathname:'/',
        $host:location.hostname,surface:'landing',referring_domain:referring
      };
      if(extra) properties.destination='app.ewnuczek.pl';
      fetch('https://eu.i.posthog.com/i/v0/e/',{
        method:'POST',headers:{'Content-Type':'application/json'},
        credentials:'omit',referrerPolicy:'no-referrer',keepalive:true,
        body:JSON.stringify({api_key:'phc_oEmSSQGJZzVYwn3iCeu2wZJySnNQhw2eomRZqw2Pera3',event,properties,timestamp:new Date().toISOString()})
      }).catch(()=>{});
    }catch{}
  }
  function page(){if(!counted&&allowed()){counted=true;send('$pageview')}}
  const style=document.createElement('style');
  style.textContent='#ew-analytics{position:fixed;bottom:12px;left:12px;right:12px;margin:auto;max-width:640px;background:#fff;color:#173d2a;border:1px solid #d5e4db;border-radius:16px;padding:18px;box-shadow:0 8px 32px #173d2a22;z-index:10000;font:15px/1.5 system-ui}#ew-analytics[hidden]{display:none}#ew-analytics p{margin:0 0 12px}#ew-analytics button,#ew-analytics-settings{font:inherit;cursor:pointer;border:1px solid #40694e;background:#fff;color:#173d2a;border-radius:8px;padding:10px 14px;margin:4px}#ew-analytics button:focus-visible,#ew-analytics-settings:focus-visible{outline:3px solid #146d3e;outline-offset:3px}#ew-analytics-settings{display:block;margin:16px auto;font:13px system-ui}';
  document.head.appendChild(style);
  const box=document.createElement('section');box.id='ew-analytics';
  box.setAttribute('aria-label','Opcjonalne statystyki');
  const p=document.createElement('p');
  p.textContent='Czy zgadzasz się na opcjonalne statystyki PostHog (region UE)? Mierzymy odwiedziny i kliknięcia przejścia do aplikacji, używając losowego identyfikatora przeglądarki. Nie nagrywamy ekranu ani treści formularzy. PostHog otrzymuje dane techniczne połączenia. Zgodę możesz wycofać przyciskiem „Ustawienia statystyk”. Odmowa nie ogranicza działania strony.';
  box.appendChild(p);
  const status=document.createElement('p');status.setAttribute('aria-live','polite');box.appendChild(status);
  function hide(){box.hidden=true;settings.focus()}
  function button(label,action){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',action);box.appendChild(b);return b}
  button('Zgadzam się',()=>{if(put(C,'granted')){hide();page()}else status.textContent='Nie można zapisać zgody. Statystyki pozostają wyłączone.'});
  button('Odrzucam / wycofuję zgodę',()=>{put(C,'denied');clear();counted=false;hide()});
  const internal=button('',()=>{const next=get(I)==='1'?'0':'1';put(I,next);if(next==='1'){put(C,'denied');clear();counted=false}refresh()});
  button('Zamknij',hide);
  const settings=document.createElement('button');settings.type='button';settings.id='ew-analytics-settings';settings.textContent='Ustawienia statystyk';
  function refresh(){internal.textContent=get(I)==='1'?'Wyłącz tryb testowy':'Nie licz tej przeglądarki (tryb testowy)';status.textContent=get(I)==='1'?'Tryb testowy: ta przeglądarka nie wysyła statystyk.':get(C)==='granted'?'Statystyki włączone za Twoją zgodą.':'Statystyki wyłączone.'}
  settings.addEventListener('click',()=>{refresh();box.hidden=false;box.querySelector('button').focus()});
  document.body.appendChild(settings);document.body.appendChild(box);refresh();
  box.hidden=get(C)!==null||get(I)==='1';
  document.addEventListener('click',e=>{
    const a=e.target.closest&&e.target.closest('a[href]');if(!a)return;
    try{const u=new URL(a.href,location.href);if(u.hostname==='app.ewnuczek.pl')send('landing_app_click',true)}catch{}
  });
  window.addEventListener('storage',()=>{refresh();if(!allowed()){clear();counted=false}});
  page();
})();
