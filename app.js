/* LILI BELAJAR — progressive enhancement, interaction, progress and local results */
(function () {
  'use strict';
  const STORE_KEY = 'liliBelajarMatematika2027';
  const PAGES = ['index.html','profil.html','apersepsi.html','materi-1.html','materi-2.html','materi-3.html','video.html','aktivitas.html','latihan.html','game.html','evaluasi.html','refleksi.html','selesai.html'];
  const BANK = Array.isArray(window.LILI_BANK_SOAL) ? window.LILI_BANK_SOAL : [];

  function forceVisible() {
    document.documentElement.classList.add('js-fallback');
    document.documentElement.classList.remove('js-ready');
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    const critical = document.getElementById('critical-visibility-fallback');
    if (critical) critical.textContent = '.reveal{opacity:1!important;transform:none!important}';
  }
  window.__LILI_FORCE_VISIBLE__ = forceVisible;
  window.__LILI_APP_BOOT_OK__ = false;
  window.addEventListener('error', () => forceVisible(), true);
  window.addEventListener('unhandledrejection', () => forceVisible());
  window.setTimeout(() => { if (!window.__LILI_APP_BOOT_OK__) forceVisible(); }, 2600);

  function defaultState() { return { visited: [], profile: {}, practiceScore: null, gameHigh: 0, evalHistory: [], reflection: null }; }
  function readState() {
    try { return Object.assign(defaultState(), JSON.parse(localStorage.getItem(STORE_KEY) || '{}')); }
    catch (_) { return defaultState(); }
  }
  function writeState(state) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); return true; }
    catch (_) { return false; }
  }
  function updateState(mutator) { const state = readState(); mutator(state); writeState(state); return state; }
  function pageFile() { const leaf = location.pathname.split('/').pop(); return leaf || 'index.html'; }
  function markVisited() {
    const file = pageFile();
    if (PAGES.includes(file)) updateState(s => { if (!s.visited.includes(file)) s.visited.push(file); });
  }
  function updateProgress() {
    const state = readState();
    const count = state.visited.filter(x => PAGES.includes(x)).length;
    const pct = Math.round(count / PAGES.length * 100);
    document.querySelectorAll('[data-progress-fill]').forEach(el => el.style.width = pct + '%');
    document.querySelectorAll('[data-progress-text]').forEach(el => el.textContent = pct + '%');
    document.querySelectorAll('.nav-links a,.mobile-nav a').forEach(a => {
      if (a.getAttribute('href') === pageFile()) a.classList.add('active');
    });
  }
  function setupMenu() {
    const button = document.querySelector('.menu-toggle');
    const menu = document.getElementById('mobile-nav');
    if (!button || !menu) return;
    button.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
      button.textContent = open ? '×' : '☰';
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('open'); button.setAttribute('aria-expanded','false'); button.textContent = '☰';
    }));
  }
  function setupReveal() {
    const els = Array.from(document.querySelectorAll('.reveal'));
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('visible')); return; }
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
    }), { threshold: 0.08 });
    els.forEach(e => io.observe(e));
    // Guard any element that might remain unobserved due to layout/browser quirks.
    window.setTimeout(() => els.forEach(e => { if (e.getBoundingClientRect().top < window.innerHeight * 1.5) e.classList.add('visible'); }), 1200);
  }
  function shuffle(items) {
    const arr = items.slice();
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }
  function safeText(el, value) { if (el) el.textContent = value == null ? '' : String(value); }
  function makeEl(tag, cls, txt) {
    const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = String(txt); return e;
  }
  function escapeAttribute(s) { return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function renderChoices(container, choices, onChoose, selectedValue, lockValue) {
    if (!container) return;
    container.replaceChildren();
    choices.forEach((value, index) => {
      const b = makeEl('button', 'choice-btn', String.fromCharCode(65 + index) + '.  ' + value);
      b.type = 'button'; b.dataset.value = String(value);
      if (selectedValue != null && String(selectedValue) === String(value)) b.classList.add('selected');
      if (lockValue) b.disabled = true;
      b.addEventListener('click', () => onChoose(value, b));
      container.appendChild(b);
    });
  }
  function makeBalancedSlots(count) {
    const slots = [];
    for (let i = 0; i < count; i++) slots.push(i % 4);
    return shuffle(slots);
  }
  function prepareEvaluation(count) {
    const picked = shuffle(BANK).slice(0, count);
    const slots = makeBalancedSlots(picked.length);
    return picked.map((q, i) => {
      const wrong = shuffle(q.distractors).slice(0, 3);
      const answers = [];
      let wrongIndex = 0;
      for (let slot = 0; slot < 4; slot++) answers.push(slot === slots[i] ? q.correct : wrong[wrongIndex++]);
      return Object.assign({}, q, { choices: answers, answerIndex: slots[i] });
    });
  }

  function initInlineChecks() {
    document.querySelectorAll('[data-inline-check]').forEach(box => {
      box.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => {
        const correct = String(button.dataset.answer) === String(box.dataset.inlineCheck);
        box.querySelectorAll('[data-answer]').forEach(b => { b.classList.remove('good','bad'); if (b === button) b.classList.add(correct ? 'good' : 'bad'); });
        const feedback = box.querySelector('[data-inline-feedback]');
        if (feedback) { feedback.textContent = correct ? 'BENAR! Jawabanmu tepat. Coba jelaskan caramu menghitung.' : 'BELUM TEPAT. Coba hitung kembali setiap benda.'; feedback.className = 'feedback-line ' + (correct ? 'good' : 'bad'); }
      }));
    });
  }
  function initWarmup() {
    const options = document.getElementById('warmup-options');
    if (!options) return;
    options.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => {
      const ok = button.dataset.answer === '5';
      options.querySelectorAll('[data-answer]').forEach(b => b.classList.remove('good','bad'));
      button.classList.add(ok ? 'good' : 'bad');
      safeText(document.getElementById('warmup-feedback'), ok ? 'BENAR! 2 stik digabung dengan 3 stik menjadi 5 stik.' : 'BELUM TEPAT. Hitung 2 stik, lalu lanjutkan 3 stik berikutnya. Totalnya 5.');
      const fb = document.getElementById('warmup-feedback'); if (fb) fb.className = 'feedback-line ' + (ok ? 'good' : 'bad');
    }));
  }
  function renderSticks(container, count, tone, label) {
    if (!container) return;
    container.replaceChildren();
    container.className = 'stick-group ' + tone;
    container.setAttribute('role','img'); container.setAttribute('aria-label', label || (count + ' stik'));
    const actual = Math.min(20, Math.max(0, count));
    for (let i = 0; i < actual; i++) container.appendChild(makeEl('span','stick'));
  }
  function setupBagActivity() {
    const a = document.getElementById('add-a'), b = document.getElementById('add-b'), go = document.getElementById('combine-btn');
    if (!a || !b || !go) return;
    const visual = document.getElementById('combine-visual');
    function run() {
      const x = Number(a.value), y = Number(b.value), total = x + y;
      if (total > 20) { safeText(document.getElementById('combine-result'),'Jumlah lebih dari 20. Pilih dua bilangan dengan hasil paling banyak 20.'); return; }
      if (visual) {
        const groups = visual.querySelectorAll('.stick-group');
        renderSticks(groups[0], x, 'blue', x + ' stik pada kelompok A');
        renderSticks(groups[1], y, 'yellow', y + ' stik pada kelompok B');
        const labels = visual.querySelectorAll('div > strong');
        if (labels[0]) labels[0].textContent = 'Kelompok A: ' + x;
        if (labels[1]) labels[1].textContent = 'Kelompok B: ' + y;
      }
      safeText(document.getElementById('combine-result'), x + ' + ' + y + ' = ' + total + '. Jika perlu, hitung satu per satu untuk memeriksa hasil.');
    }
    go.addEventListener('click', run); a.addEventListener('change', () => {}); b.addEventListener('change', () => {});
  }
  function setupSwapActivity() {
    const a = document.getElementById('swap-a'), b = document.getElementById('swap-b'), go = document.getElementById('swap-btn'), out = document.getElementById('swap-output');
    if (!a || !b || !go || !out) return;
    let swapped = false;
    function draw() {
      const x = Number(a.value), y = Number(b.value);
      if (x + y > 20) { out.replaceChildren(makeEl('p','feedback-line bad','Pilih dua bilangan dengan hasil paling banyak 20.')); return; }
      const first = swapped ? y : x, second = swapped ? x : y;
      const row1 = makeEl('div','swap-equation'); row1.append(makeEl('span','number-pill blue-pill',first), document.createTextNode(' + '), makeEl('span','number-pill yellow-pill',second), document.createTextNode(' = '), makeEl('strong','',first + second));
      const row2 = makeEl('div','swap-equation'); row2.append(makeEl('span','number-pill yellow-pill',second), document.createTextNode(' + '), makeEl('span','number-pill blue-pill',first), document.createTextNode(' = '), makeEl('strong','',first + second));
      out.replaceChildren(row1,row2,makeEl('p','', 'Jumlahnya tetap sama: ' + (first + second) + '.'));
    }
    go.addEventListener('click', () => { swapped = !swapped; draw(); }); a.addEventListener('change',draw); b.addEventListener('change',draw);
  }
  function setupMatchActivity() {
    const question = document.getElementById('match-question'), options = document.getElementById('match-options'), feedback = document.getElementById('match-feedback'), next = document.getElementById('match-next');
    if (!question || !options || !feedback || !next) return;
    const items = [
      {a:4,b:3,fruit:'🍓',label:'stroberi'}, {a:3,b:2,fruit:'🍌',label:'pisang'}, {a:5,b:2,fruit:'🧁',label:'kue'},
      {a:4,b:4,fruit:'🥤',label:'cangkir'}, {a:6,b:3,fruit:'🍓',label:'stroberi'}, {a:5,b:4,fruit:'🍌',label:'pisang'}
    ];
    let order = shuffle(items), index = 0, locked = false;
    function draw() {
      if (index >= order.length) { index = 0; order = shuffle(items); }
      locked = false; const q = order[index], total = q.a + q.b;
      const scene = makeEl('div','fruit-scene'); scene.setAttribute('role','img'); scene.setAttribute('aria-label', q.a + ' ' + q.label + ' dan ' + q.b + ' ' + q.label);
      scene.textContent = Array(q.a).fill(q.fruit).join(' ') + '  +  ' + Array(q.b).fill(q.fruit).join(' ');
      question.replaceChildren(scene, makeEl('h3','',q.a + ' ' + q.label + ' + ' + q.b + ' ' + q.label + ' = ?'));
      const vals = shuffle([total, Math.max(1,total-1), Math.min(20,total+1), Math.max(1,total-2)] .map(String).filter((v,i,arr)=>arr.indexOf(v)===i));
      while(vals.length<4) vals.push(String(total+vals.length));
      options.replaceChildren(); vals.forEach(v => { const btn = makeEl('button','answer-chip',v); btn.type='button'; btn.dataset.answer=v; btn.addEventListener('click',()=>{
        if (locked) return; locked=true; const ok=Number(v)===total;
        options.querySelectorAll('button').forEach(x=>{x.disabled=true;if(x===btn)x.classList.add(ok?'good':'bad');if(Number(x.dataset.answer)===total)x.classList.add('good');});
        feedback.textContent=ok?'BENAR! Totalnya '+total+' '+q.label+'.':'BELUM TEPAT. Hitung '+q.a+' dan lanjutkan '+q.b+' lagi. Totalnya '+total+'.'; feedback.className='feedback-line '+(ok?'good':'bad');
      }); options.appendChild(btn); });
      feedback.textContent='Hitung semua gambar satu per satu.'; feedback.className='feedback-line';
    }
    next.addEventListener('click',()=>{index++;draw();}); draw();
  }

  function initPractice() {
    const start = document.getElementById('practice-start'), panel = document.getElementById('practice-quiz');
    if (!start || !panel || !BANK.length) return;
    const counter = document.getElementById('practice-counter'), scoreLabel = document.getElementById('practice-score-label'), progress = document.getElementById('practice-progress');
    const qEl = document.getElementById('practice-question'), choices = document.getElementById('practice-choices'), feedback = document.getElementById('practice-feedback'), next = document.getElementById('practice-next');
    let questions = [], i = 0, score = 0, locked = false;
    panel.classList.add('hidden');
    function showQuestion() {
      if (i >= questions.length) { finish(); return; }
      locked = false; const q = questions[i]; safeText(counter, 'Soal ' + (i+1) + ' dari ' + questions.length); safeText(scoreLabel,'Skor: '+score); progress.style.width = ((i+1)/questions.length*100)+'%';
      safeText(qEl, q.question); feedback.textContent='Pilih jawaban untuk memeriksa pemahaman.'; feedback.className='feedback-box'; next.disabled=true; next.textContent=i===questions.length-1?'Lihat hasil ✓':'Soal berikutnya →';
      const answers=shuffle([q.correct,...q.distractors]);
      renderChoices(choices,answers,(value,button)=>{ if(locked)return; locked=true; const ok=String(value)===String(q.correct); if(ok)score++;
        choices.querySelectorAll('button').forEach(btn=>{btn.disabled=true;if(String(btn.dataset.value)===String(q.correct))btn.classList.add('correct');if(btn===button&&!ok)btn.classList.add('wrong');});
        feedback.textContent=(ok?'BENAR! ':'BELUM TEPAT. ')+q.explanation;feedback.className='feedback-box '+(ok?'good':'bad'); safeText(scoreLabel,'Skor: '+score); next.disabled=false;
      });
    }
    function finish() {
      panel.innerHTML=''; const box=makeEl('div','practice-finish');
      box.append(makeEl('span','tag tag-blue','LATIHAN SELESAI'),makeEl('h2','', 'Skormu: '+score+' / '+questions.length),makeEl('p','', 'Nilai latihan: '+Math.round(score/questions.length*100)+'. '+(score/questions.length>=.75?'Bagus! Kamu dapat melanjutkan ke evaluasi.':'Ayo ulangi materi yang masih sulit lalu coba lagi.')));
      const replay=makeEl('button','btn btn-primary','Ulangi latihan ↻');replay.type='button';replay.addEventListener('click',startRun);box.appendChild(replay);panel.appendChild(box);
      updateState(s=>{s.practiceScore=Math.round(score/questions.length*100);s.lastPracticeCorrect=score;s.lastPracticeTotal=questions.length;});
    }
    function startRun() { questions=shuffle(BANK).slice(0,10); i=0;score=0;locked=false;panel.classList.remove('hidden');panel.classList.add('visible');panel.innerHTML='<div class="quiz-top"><span id="practice-counter">Soal 1 dari 10</span><span class="mini-badge" id="practice-score-label">Skor: 0</span></div><div class="progress-track light-track"><span id="practice-progress" style="width:10%"></span></div><h2 id="practice-question"></h2><p class="question-hint">Pilih satu jawaban.</p><div class="choice-grid" id="practice-choices"></div><div class="feedback-box" id="practice-feedback" aria-live="polite"></div><div class="quiz-actions"><button type="button" class="btn btn-primary" id="practice-next" disabled>Soal berikutnya →</button></div>';
      // Rebind the fresh controls after rebuilding the panel.
      start.disabled=true;
      const newNext=document.getElementById('practice-next');
      // Closures below use the current panel elements via fresh lookup at each step.
      function renderFresh(){
        const q=questions[i], qCount=document.getElementById('practice-counter'), sc=document.getElementById('practice-score-label'), pr=document.getElementById('practice-progress'), qText=document.getElementById('practice-question'), ch=document.getElementById('practice-choices'), fb=document.getElementById('practice-feedback');
        if(i>=questions.length){
          const finalScore=Math.round(score/questions.length*100);panel.innerHTML='<span class="tag tag-blue">LATIHAN SELESAI</span><h2>Skormu: '+score+' / '+questions.length+'</h2><p>Nilai latihan: '+finalScore+'. '+(finalScore>=75?'Bagus! Kamu dapat melanjutkan ke evaluasi.':'Ulangi materi yang masih sulit, kemudian coba lagi.')+'</p><button type="button" class="btn btn-primary" id="practice-again">Ulangi latihan ↻</button>';
          updateState(s=>{s.practiceScore=finalScore;s.lastPracticeCorrect=score;s.lastPracticeTotal=questions.length;});start.disabled=false;document.getElementById('practice-again').addEventListener('click',startRun);return;
        }
        locked=false; safeText(qCount,'Soal '+(i+1)+' dari '+questions.length);safeText(sc,'Skor: '+score);pr.style.width=((i+1)/questions.length*100)+'%';safeText(qText,q.question);fb.textContent='Pilih jawaban untuk memeriksa pemahaman.';fb.className='feedback-box';newNext.disabled=true;newNext.textContent=i===questions.length-1?'Lihat hasil ✓':'Soal berikutnya →';
        renderChoices(ch,shuffle([q.correct,...q.distractors]),(value,button)=>{if(locked)return;locked=true;const ok=String(value)===String(q.correct);if(ok)score++;ch.querySelectorAll('button').forEach(btn=>{btn.disabled=true;if(String(btn.dataset.value)===String(q.correct))btn.classList.add('correct');if(btn===button&&!ok)btn.classList.add('wrong');});fb.textContent=(ok?'BENAR! ':'BELUM TEPAT. ')+q.explanation;fb.className='feedback-box '+(ok?'good':'bad');safeText(sc,'Skor: '+score);newNext.disabled=false;});
      }
      newNext.addEventListener('click',()=>{if(!locked)return;i++;renderFresh();});renderFresh();
    }
    start.addEventListener('click', startRun);
  }

  function initGame() {
    const start=document.getElementById('game-start'), board=document.getElementById('game-board'); if(!start||!board)return;
    const sets=[
      [{a:2,b:1},{a:3,b:2},{a:4,b:1}],
      [{a:5,b:4},{a:6,b:3},{a:7,b:2}],
      [{a:8,b:5},{a:9,b:6},{a:12,b:7}]
    ];
    const bestEl=document.getElementById('game-best');safeText(bestEl,readState().gameHigh||0);let questions=[],i=0,score=0,time=60,timer=null,locked=false,active=false;
    function stopTimer(){if(timer){clearInterval(timer);timer=null;}}
    function updateStats(){safeText(document.getElementById('game-level'),Math.min(3,Math.floor(i/3)+1)+' / 3');safeText(document.getElementById('game-round'),Math.min(i+1,9)+' / 9');safeText(document.getElementById('game-score'),score);safeText(document.getElementById('game-time'),time+' dtk');const pg=document.getElementById('game-progress-fill');if(pg)pg.style.width=(i/9*100)+'%';}
    function endGame(timedOut){stopTimer();active=false;start.disabled=false;start.textContent='Mulai game ▶';const old=readState().gameHigh||0;const high=Math.max(old,score);updateState(s=>{s.gameHigh=high;});safeText(bestEl,high);safeText(document.getElementById('game-question'),timedOut?'Waktu habis!':'Game selesai!');safeText(document.getElementById('game-prompt'),timedOut?'Coba lagi dengan lebih tenang.':'Kamu menyelesaikan 9 ronde.');const c=document.getElementById('game-choices');c.replaceChildren();safeText(document.getElementById('game-feedback'),'Skor akhir '+score+'. Skor terbaik: '+high+'.');const b=makeEl('button','choice-btn','Main lagi ↻');b.type='button';b.addEventListener('click',startGame);c.appendChild(b);safeText(document.getElementById('game-level-label'),timedOut?'WAKTU SELESAI':'SELESAI · 3 LEVEL');updateStats();const pg=document.getElementById('game-progress-fill');if(pg)pg.style.width=(i/9*100)+'%';}
    function drawQuestion(){if(!active)return;if(i>=questions.length){endGame(false);return;}locked=false;const q=questions[i];safeText(document.getElementById('game-level-label'),'LEVEL '+(Math.floor(i/3)+1)+' · '+(['PEMANASAN','MANTAP','JUARA'][Math.floor(i/3)]));safeText(document.getElementById('game-question'),q.a+' + '+q.b+' = ...');safeText(document.getElementById('game-prompt'),'Pilih hasil yang tepat.');safeText(document.getElementById('game-feedback'),'Benar = 10 poin.');updateStats();const answers=shuffle([q.a+q.b,Math.max(0,q.a+q.b-1),Math.min(20,q.a+q.b+1),Math.max(0,q.a+q.b-2)].map(String).filter((v,idx,arr)=>arr.indexOf(v)===idx));while(answers.length<4)answers.push(String(Number(answers[answers.length-1])+1));renderChoices(document.getElementById('game-choices'),answers,(value,button)=>{if(locked||!active)return;locked=true;const ok=Number(value)===q.a+q.b;if(ok)score+=10;document.getElementById('game-choices').querySelectorAll('button').forEach(btn=>{btn.disabled=true;if(Number(btn.dataset.value)===q.a+q.b)btn.classList.add('correct');if(btn===button&&!ok)btn.classList.add('wrong');});safeText(document.getElementById('game-feedback'),ok?'BENAR! +10 poin.':'BELUM TEPAT. '+q.a+' + '+q.b+' = '+(q.a+q.b)+'.');safeText(document.getElementById('game-score'),score);window.setTimeout(()=>{if(active){i++;drawQuestion();}},450);});}
    function startGame(){stopTimer();questions=shuffle(sets.flat());i=0;score=0;time=60;locked=false;active=true;board.classList.remove('hidden');start.textContent='Game dimulai';start.disabled=true;updateStats();drawQuestion();timer=window.setInterval(()=>{if(!active)return;time--;safeText(document.getElementById('game-time'),time+' dtk');if(time<=0)endGame(true);},1000);}
    start.addEventListener('click',startGame);const restart=document.getElementById('game-restart');if(restart)restart.addEventListener('click',()=>{start.disabled=false;start.textContent='Mulai game ▶';startGame();});
    // Keep a static explanation visible until the user starts the game.
  }

  function formatDuration(seconds){const s=Math.max(0,Math.floor(seconds||0));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
  function formatDate(date){try{return new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short'}).format(date);}catch(_){return date.toLocaleString('id-ID');}}
  function initEvaluation(){
    const form=document.getElementById('eval-form'), session=document.getElementById('eval-session'), results=document.getElementById('eval-results'); if(!form||!session||!results||BANK.length<10)return;
    const next=document.getElementById('eval-next');let questions=[],i=0,answers=[],startedAt=0,elapsedTimer=null,tick=null,attempt=0,identity={};
    session.classList.add('hidden');results.classList.add('hidden');
    const old=readState();if(old.profile){const nameInput=document.getElementById('eval-name');const classInput=document.getElementById('eval-class');const absenInput=document.getElementById('eval-absen');if(nameInput)nameInput.value=old.profile.name||'';if(classInput)classInput.value=old.profile.kelas||'6/B';if(absenInput)absenInput.value=old.profile.absen||'';if(classInput&&!classInput.value)classInput.value='6/B';}
    function updateTimer(){safeText(document.getElementById('eval-timer'),formatDuration((Date.now()-startedAt)/1000));}
    function stopTimer(){if(elapsedTimer){clearInterval(elapsedTimer);elapsedTimer=null;}}
    function drawQuestion(){const q=questions[i];safeText(document.getElementById('eval-q-count'),'Soal '+(i+1)+' dari '+questions.length);safeText(document.getElementById('eval-category'),q.category);safeText(document.getElementById('eval-question-text'),q.question);document.getElementById('eval-progress').style.width=((i+1)/questions.length*100)+'%';safeText(document.getElementById('eval-save-note'),'Pilih satu jawaban. Nilai belum ditampilkan.');next.disabled=true;next.textContent=i===questions.length-1?'Selesaikan evaluasi ✓':'Berikutnya →';renderChoices(document.getElementById('eval-choices'),q.choices,(value,button)=>{if(answers[i]!==undefined)return;answers[i]={value:String(value),correct:String(value)===String(q.correct)};document.getElementById('eval-choices').querySelectorAll('button').forEach(b=>{b.disabled=true;if(b===button)b.classList.add('selected');});safeText(document.getElementById('eval-save-note'),'Jawaban tersimpan. Kebenaran jawaban akan terlihat setelah evaluasi selesai.');next.disabled=false;});}
    function complete(){stopTimer();updateTimer();const duration=Math.round((Date.now()-startedAt)/1000);const correctCount=questions.reduce((n,q,j)=>n+(answers[j]&&answers[j].correct?1:0),0);const wrongCount=questions.length-correctCount;const score=Math.round(correctCount/questions.length*100);const status=score>=75?'TUNTAS':'BELUM TUNTAS';attempt=(readState().evalHistory||[]).length+1;const date=new Date();const categoryMap={};questions.forEach((q,j)=>{if(!categoryMap[q.category])categoryMap[q.category]={total:0,correct:0,page:q.page};categoryMap[q.category].total++;if(answers[j]&&answers[j].correct)categoryMap[q.category].correct++;});const result={name:identity.name,kelas:identity.kelas,absen:identity.absen,score,correct:correctCount,wrong:wrongCount,status,date:date.toISOString(),dateLabel:formatDate(date),duration,attempt,categoryMap,questions:questions.map((q,j)=>({id:q.id,category:q.category,page:q.page,question:q.question,correct:q.correct,studentAnswer:answers[j]?answers[j].value:'(tidak dijawab)',isCorrect:!!(answers[j]&&answers[j].correct),explanation:q.explanation}))};updateState(s=>{s.profile=identity;s.evalHistory=s.evalHistory||[];s.evalHistory.push(result);});showResult(result);session.classList.add('hidden');results.classList.remove('hidden');results.classList.add('visible');results.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
    function showResult(r){const root=document.getElementById('eval-result-content');root.replaceChildren();root.append(makeEl('span','tag tag-blue','EVALUASI SELESAI'),makeEl('h2','',r.name+' · '+r.kelas));const sub=makeEl('p','','Absen '+r.absen+' · '+r.dateLabel+' · Durasi '+formatDuration(r.duration)+' · Percobaan ke-'+r.attempt);root.appendChild(sub);const grid=makeEl('div','result-summary-grid');[["Nilai",r.score],['Benar',r.correct],['Salah',r.wrong],['Nilai tertinggi',Math.max(...(readState().evalHistory||[]).map(x=>x.score||0))]].forEach(([label,value])=>{const card=makeEl('div','result-stat');card.append(makeEl('span','',label),makeEl('strong','',value));grid.appendChild(card);});root.appendChild(grid);const status=makeEl('span','status-pill '+(r.score>=75?'pass':''),r.status+' · KKM 75');root.appendChild(status);root.appendChild(makeEl('p','',r.score>=75?'Hebat! Kamu mencapai KKM. Coba tantangan pengayaan atau bantu teman menjelaskan cara menghitung.':'Belum mencapai KKM. Tidak apa-apa—ulang materi yang paling perlu dilatih, lalu coba evaluasi lagi.'));const analysis=makeEl('div','result-analysis');analysis.appendChild(makeEl('h3','','Penguasaan per submateri'));Object.entries(r.categoryMap).forEach(([name,data])=>{const pct=Math.round(data.correct/data.total*100);const row=makeEl('div','analysis-row');row.append(makeEl('strong','',name));const bar=makeEl('div','analysis-bar');const fill=makeEl('span');fill.style.width=pct+'%';bar.appendChild(fill);row.append(bar,makeEl('strong','',data.correct+'/'+data.total+' ('+pct+'%)'));analysis.appendChild(row);});root.appendChild(analysis);const remedial=makeEl('div','remedial-row');remedial.appendChild(makeEl('strong','','Buka materi untuk mengulang:'));const weak=Object.entries(r.categoryMap).filter(([_,d])=>d.correct<d.total).sort((a,b)=>a[1].correct/a[1].total-b[1].correct/b[1].total);const fallback=Object.entries(r.categoryMap);(weak.length?weak:fallback).forEach(([cat,data])=>{const a=makeEl('a','btn btn-secondary','Ulangi: '+cat);a.href=data.page;remedial.appendChild(a);});root.appendChild(remedial);const explain=makeEl('div','explanations');explain.appendChild(makeEl('h3','','Pembahasan setelah tes'));r.questions.forEach((q,j)=>{const item=makeEl('div','explain-item');item.append(makeEl('strong','',(j+1)+'. '+q.question),makeEl('p','', (q.isCorrect?'BENAR · ':'BELUM TEPAT · ')+'Jawabanmu: '+q.studentAnswer+' | Jawaban benar: '+q.correct),makeEl('p','',q.explanation));explain.appendChild(item);});root.appendChild(explain);if(r.score<75){const remedialTip=makeEl('div','tip-panel');remedialTip.append(makeEl('span','tip-icon','🌱'),makeEl('div','','Remedial: pelajari ulang materi yang ditautkan di atas, gunakan benda konkret, lalu ikuti evaluasi kembali.'));root.appendChild(remedialTip);}else{const enrichment=makeEl('div','tip-panel');enrichment.append(makeEl('span','tip-icon','⭐'),makeEl('div','','Pengayaan: buatlah tiga contoh penjumlahan dengan hasil sampai 20 dan tuliskan bentuk pertukarannya.'));root.appendChild(enrichment);}}
    form.addEventListener('submit',ev=>{ev.preventDefault();identity={name:document.getElementById('eval-name').value.trim(),kelas:document.getElementById('eval-class').value.trim(),absen:document.getElementById('eval-absen').value.trim()};if(!identity.name||!identity.kelas||!identity.absen)return;updateState(s=>{s.profile=identity;});questions=prepareEvaluation(10);i=0;answers=[];startedAt=Date.now();results.classList.add('hidden');form.classList.add('hidden');session.classList.remove('hidden');attempt=(readState().evalHistory||[]).length+1;drawQuestion();updateTimer();elapsedTimer=window.setInterval(updateTimer,1000);});
    next.addEventListener('click',()=>{if(answers[i]===undefined)return;if(i<questions.length-1){i++;drawQuestion();}else complete();});
    const print=document.getElementById('eval-print');if(print)print.addEventListener('click',()=>window.print());const retry=document.getElementById('eval-retry');if(retry)retry.addEventListener('click',()=>{results.classList.add('hidden');form.classList.remove('hidden');form.classList.add('visible');session.classList.add('hidden');form.scrollIntoView({behavior:'smooth',block:'start'});});
  }

  function initReflection(){const form=document.getElementById('reflection-form');if(!form)return;const prev=readState().reflection;if(prev){if(prev.mood){const radio=form.querySelector('input[name="mood"][value="'+CSS.escape(prev.mood)+'"]');if(radio)radio.checked=true;}['q1','q2','q3','q4'].forEach(k=>{const el=form.elements[k];if(el&&prev[k])el.value=prev[k];});if(form.elements.catatan)form.elements.catatan.value=prev.catatan||'';safeText(document.getElementById('reflection-feedback'),'Refleksi sebelumnya dimuat. Kamu boleh memperbarui jawaban.');}
    form.addEventListener('submit',ev=>{ev.preventDefault();const data={mood:form.querySelector('input[name="mood"]:checked')?.value||'',q1:form.elements.q1.value,q2:form.elements.q2.value,q3:form.elements.q3.value,q4:form.elements.q4.value,catatan:form.elements.catatan.value.trim(),date:new Date().toISOString()};updateState(s=>{s.reflection=data;});safeText(document.getElementById('reflection-feedback'),'Refleksi tersimpan di perangkat ini. Terima kasih sudah bercerita!');const fb=document.getElementById('reflection-feedback');if(fb)fb.className='feedback-line good';});}

  function initFinish(){const name=document.getElementById('finish-name');if(!name)return;const s=readState();const latest=(s.evalHistory||[]).slice(-1)[0];safeText(name,s.profile&&s.profile.name?'Halo, '+s.profile.name+'!':'Halo, Teman Belajar!');safeText(document.getElementById('finish-subtitle'),latest?'Evaluasi terakhir: '+latest.score+'/100 · '+latest.status+'. Terus berlatih dan ulangi materi bila perlu.':'Terus berlatih sedikit demi sedikit. Kamu bisa kembali ke materi kapan pun.');const pct=Math.round((s.visited||[]).filter(x=>PAGES.includes(x)).length/PAGES.length*100);safeText(document.getElementById('finish-progress'),pct+'%');const ring=document.getElementById('finish-progress-ring');if(ring)ring.style.setProperty('--progress',pct+'%');safeText(document.getElementById('finish-practice'),s.practiceScore==null?'Belum ada':s.practiceScore+'/100');safeText(document.getElementById('finish-game'),s.gameHigh||0);safeText(document.getElementById('finish-eval'),latest?latest.score+'/100':'Belum ada');safeText(document.getElementById('finish-status'),latest?latest.status:'Belum mengikuti');safeText(document.getElementById('finish-profile'),s.profile&&s.profile.name?s.profile.name+' · '+(s.profile.kelas||'6/B'):'Belum diisi');const r=s.reflection;if(r){safeText(document.getElementById('finish-reflection'),(r.mood?'Perasaan: '+r.mood+'. ':'')+'Menggabungkan benda: '+r.q1+'. Menghitung sampai 20: '+r.q2+'. Sifat pertukaran: '+r.q3+'. Cara belajar favorit: '+r.q4+'. '+(r.catatan?'Catatan: '+r.catatan:''));}const p=document.getElementById('finish-print');if(p)p.addEventListener('click',()=>window.print());}

  document.addEventListener('DOMContentLoaded', function () {
    try {
      setupMenu(); markVisited(); updateProgress(); initInlineChecks(); initWarmup(); setupBagActivity(); setupSwapActivity(); setupMatchActivity(); initPractice(); initGame(); initEvaluation(); initReflection(); initFinish();
      // Restore visibility after every required initialization succeeded.
      document.documentElement.classList.add('js-ready');
      const critical=document.getElementById('critical-visibility-fallback'); if(critical)critical.remove();
      setupReveal(); window.__LILI_APP_BOOT_OK__=true; document.documentElement.classList.add('app-ready');
    } catch (err) {
      console.error('Lili Belajar boot error:', err); forceVisible(); window.__LILI_APP_BOOT_OK__=true;
    }
  });
})();
