(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const STORAGE_KEY = 'svenska300-state-v1';
  const SETTINGS_KEY = 'svenska300-settings-v1';
  const labels = { noun:'Nomen', verb:'Verb', prep:'Präposition', rest:'Restliche' };
  let direction = 'de-sv';
  let category = 'mixed';
  let queue = [];
  let current = null;
  let stats = { answered:0, correct:0, streak:0 };
  let feedbackOpen = false;
  let settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{"diacritics":false,"enterNext":true}');

  function saveSettings(){ localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
  function saveState(){
    if (!current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ direction, category, queue: [current.id, ...queue.map(w=>w.id)], stats }));
  }
  function clearState(){ localStorage.removeItem(STORAGE_KEY); }
  function shuffle(arr){
    const a=[...arr];
    for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  }
  function norm(s){
    let x=(s||'').toLowerCase().trim().replace(/[.!?;,]/g,'').replace(/\s+/g,' ');
    if(settings.diacritics) x=x.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    return x;
  }
  function acceptableAnswers(w){
    if(direction==='sv-de') return [w.de, ...(w.altDe||[])];
    if(w.type==='noun') {
      const full=`${w.article} ${w.sv}, ${w.plural}`;
      return [full, `${w.article} ${w.sv} ${w.plural}`, `${w.article} ${w.sv}`, w.sv, ...(w.altSv||[])];
    }
    if(w.type==='verb') {
      const full=`att ${w.sv}, ${w.present}`;
      return [full, `att ${w.sv} ${w.present}`, `${w.sv}, ${w.present}`, `${w.sv} ${w.present}`, w.sv, ...(w.altSv||[])];
    }
    return [w.sv, ...(w.altSv||[])];
  }
  function expected(w){
    if(direction==='sv-de') return w.de;
    if(w.type==='noun') return `${w.article} ${w.sv} · Plural: ${w.plural}`;
    if(w.type==='verb') return `att ${w.sv} · Präsens: ${w.present}`;
    return w.sv;
  }
  function matchesAnswer(input,w){
    const n=norm(input);
    return acceptableAnswers(w).some(a=>norm(a)===n);
  }
  function filteredWords(){ return WORDS.filter(w=>category==='mixed'||w.type===category); }
  function startTraining(){
    const words=shuffle(filteredWords());
    queue=words;
    stats={answered:0,correct:0,streak:0};
    $('#setupView').classList.add('hidden');
    $('#trainerView').classList.remove('hidden');
    nextCard();
  }
  function resumeTraining(data){
    direction=data.direction||direction; category=data.category||category; stats=data.stats||stats;
    const map=new Map(WORDS.map(w=>[w.id,w]));
    queue=(data.queue||[]).map(id=>map.get(id)).filter(Boolean);
    if(!queue.length) return false;
    setControls();
    $('#setupView').classList.add('hidden'); $('#trainerView').classList.remove('hidden'); nextCard(); return true;
  }
  function nextCard(){
    feedbackOpen=false;
    $('#feedback').className='feedback hidden';
    $('#answerForm').classList.remove('hidden');
    $('#answerInput').value='';
    if(!queue.length) queue=shuffle(filteredWords());
    current=queue.shift();
    renderCard(); saveState();
    setTimeout(()=>$('#answerInput').focus(),60);
  }
  function renderCard(){
    $('#categoryBadge').textContent=labels[current.type];
    $('#rankBadge').textContent=`#${current.rank}`;
    if(direction==='de-sv') {
      $('#promptLabel').textContent='Übersetze ins Schwedische';
      $('#promptWord').textContent=current.de;
      $('#promptForms').textContent=current.type==='noun'?'Artikel + Singular + Plural eingeben':current.type==='verb'?'Infinitiv + Präsens eingeben':'';
      $('#answerInput').placeholder=current.type==='noun'?'z. B. en bil, bilar':current.type==='verb'?'z. B. att komma, kommer':'Schwedische Antwort …';
    } else {
      $('#promptLabel').textContent='Übersetze ins Deutsche';
      $('#promptWord').textContent=current.type==='noun'?`${current.article} ${current.sv}`:current.type==='verb'?`att ${current.sv}`:current.sv;
      $('#promptForms').textContent=current.type==='noun'?`Plural: ${current.plural}`:current.type==='verb'?`Präsens: ${current.present}`:'';
      $('#answerInput').placeholder='Deutsche Bedeutung …';
    }
    updateStats();
  }
  function updateStats(){
    const total=filteredWords().length;
    $('#progressText').textContent=`${Math.min(stats.answered,total)} / ${total}`;
    $('#accuracyText').textContent=stats.answered?`${Math.round(stats.correct/stats.answered*100)} %`:'–';
    $('#streakText').textContent=stats.streak;
    $('#progressBar').style.width=`${Math.min(100,stats.answered/total*100)}%`;
  }
  function grade(){
    const answer=$('#answerInput').value;
    if(!answer.trim()) return;
    const good=matchesAnswer(answer,current);
    stats.answered++;
    if(good){ stats.correct++; stats.streak++; queue.push(current); }
    else { stats.streak=0; const pos=Math.min(queue.length, 3+Math.floor(Math.random()*3)); queue.splice(pos,0,current); }
    $('#answerForm').classList.add('hidden');
    const fb=$('#feedback'); fb.className=`feedback ${good?'good':'bad'}`;
    $('#feedbackTitle').textContent=good?'Richtig':'Noch einmal lernen';
    $('#solution').innerHTML=`<strong>${expected(current)}</strong>${good?'':'<br><span class="muted">Die Karte erscheint gleich erneut.</span>'}`;
    feedbackOpen=true; updateStats(); saveState();
  }
  function endTraining(){
    saveState(); current=null;
    $('#trainerView').classList.add('hidden'); $('#setupView').classList.remove('hidden');
  }
  function setControls(){
    $$('#directionControl .segment').forEach(b=>b.classList.toggle('active',b.dataset.value===direction));
    $$('#categoryControl .category').forEach(b=>b.classList.toggle('active',b.dataset.value===category));
  }

  $$('#directionControl .segment').forEach(b=>b.addEventListener('click',()=>{direction=b.dataset.value;setControls();}));
  $$('#categoryControl .category').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.value;setControls();}));
  $('#startBtn').addEventListener('click',startTraining);
  $('#answerForm').addEventListener('submit',e=>{e.preventDefault();grade();});
  $('#nextBtn').addEventListener('click',nextCard);
  $('#skipBtn').addEventListener('click',()=>{queue.splice(Math.min(queue.length,5),0,current);nextCard();});
  $('#endBtn').addEventListener('click',endTraining);
  $('#resetBtn').addEventListener('click',()=>{ if(confirm('Gespeicherten Lernstand wirklich löschen?')){clearState();alert('Lernstand wurde zurückgesetzt.');} });
  $$('.swedish-keys button').forEach(b=>b.addEventListener('click',()=>{const i=$('#answerInput'); const p=i.selectionStart; i.value=i.value.slice(0,p)+b.dataset.char+i.value.slice(i.selectionEnd); i.focus(); i.setSelectionRange(p+1,p+1);}));
  $('#settingsBtn').addEventListener('click',()=>$('#settingsDialog').showModal());
  $('#diacriticsToggle').checked=!!settings.diacritics;
  $('#enterNextToggle').checked=settings.enterNext!==false;
  $('#diacriticsToggle').addEventListener('change',e=>{settings.diacritics=e.target.checked;saveSettings();});
  $('#enterNextToggle').addEventListener('change',e=>{settings.enterNext=e.target.checked;saveSettings();});
  document.addEventListener('keydown',e=>{if(e.key==='Enter'&&feedbackOpen&&settings.enterNext){e.preventDefault();nextCard();}});

  if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
  const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
  if(saved && saved.queue?.length && confirm('Gespeichertes Training fortsetzen?')) resumeTraining(saved);
})();
