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
    if(w.type==='noun') return [w.sv, `${w.article} ${w.sv}`, ...(w.altSv||[])];
    if(w.type==='verb') return [w.sv, `att ${w.sv}`, ...(w.altSv||[])];
    return [w.sv, ...(w.altSv||[])];
  }
  function expected(w){
    if(direction==='sv-de') return w.de;
    if(w.type==='noun' || w.type==='verb') return w.sv;
    return w.sv;
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
      $('#promptForms').textContent='';
      $('#answerInput').placeholder='Schwedische Vokabel …';
    } else {
      $('#promptLabel').textContent='Übersetze ins Deutsche';
      $('#promptWord').textContent=current.sv;
      $('#promptForms').textContent='';
      $('#answerInput').placeholder='Deutsche Bedeutung …';
    }
    updateStats();
  }
  function grammarInfo(w){
    if(w.type==='noun') {
      const pluralIndef=w.plural==='-'?'—':w.plural;
      const pluralDef=w.definitePlural==='-'?'—':w.definitePlural;
      return `<div class="grammar-card"><div class="grammar-title">Formen</div><div class="grammar-grid"><span>Singular unbestimmt</span><strong>${w.article} ${w.sv}</strong><span>Singular bestimmt</span><strong>${w.definiteSingular}</strong><span>Plural unbestimmt</span><strong>${pluralIndef}</strong><span>Plural bestimmt</span><strong>${pluralDef}</strong></div></div>`;
    }
    if(w.type==='verb') return `<div class="grammar-card"><div class="grammar-title">Verbformen</div><div class="grammar-grid"><span>Infinitiv</span><strong>att ${w.sv}</strong><span>Präsens</span><strong>${w.present}</strong></div></div>`;
    return '';
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
    $('#solution').innerHTML=good ? `<strong>${expected(current)}</strong>${grammarInfo(current)}` : `<strong>${expected(current)}</strong><br><span class="muted">Die Karte erscheint gleich erneut.</span>`;
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
