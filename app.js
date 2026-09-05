// ===== Vokabeltrainer DE ↔ SE =====
(function () {
  'use strict';

  // State
  let direction = 'de-se'; // de-se | se-de
  let category = 'mixed';
  let queue = [];
  let current = null;
  let correctCount = 0;
  let totalSeen = 0;
  let deferredPrompt = null;

  // DOM
  const promptLabel = document.getElementById('promptLabel');
  const promptWord = document.getElementById('promptWord');
  const answerArea = document.getElementById('answerArea');
  const answerWord = document.getElementById('answerWord');
  const answerDetails = document.getElementById('answerDetails');
  const showRow = document.getElementById('showRow');
  const rateRow = document.getElementById('rateRow');
  const showBtn = document.getElementById('showBtn');
  const rightBtn = document.getElementById('rightBtn');
  const wrongBtn = document.getElementById('wrongBtn');
  const skipBtn = document.getElementById('skipBtn');
  const resetBtn = document.getElementById('resetBtn');
  const statsEl = document.getElementById('stats');
  const progressFill = document.getElementById('progressFill');
  const queueInfo = document.getElementById('queueInfo');
  const card = document.getElementById('card');
  const installBanner = document.getElementById('installBanner');
  const installBtn = document.getElementById('installBtn');

  // ===== Helpers =====
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function filterVocab() {
    if (category === 'mixed') return [...VOCAB];
    return VOCAB.filter(w => w.cat === category);
  }

  function buildQueue() {
    const list = filterVocab();
    queue = shuffle(list.map(w => ({ ...w })));
    correctCount = 0;
    totalSeen = 0;
    updateStats();
    nextCard();
  }

  function updateStats() {
    const total = filterVocab().length;
    statsEl.innerHTML = `${correctCount} / ${total}<br><span style="font-size:0.7rem">richtig</span>`;
    const pct = total ? Math.round((correctCount / total) * 100) : 0;
    progressFill.style.width = pct + '%';
    queueInfo.textContent = queue.length
      ? `${queue.length} Wörter in der Warteschlange`
      : 'Voulez-Vous noch eine Runde? 🎉';
  }

  function nextCard() {
    answerArea.classList.add('hidden');
    showRow.classList.remove('hidden');
    rateRow.classList.add('hidden');
    card.classList.remove('flash-success', 'flash-error');

    if (queue.length === 0) {
      promptLabel.textContent = 'Fertig!';
      promptWord.textContent = '🎉';
      answerArea.classList.remove('hidden');
      answerWord.textContent = 'Alle Wörter geschafft';
      answerDetails.textContent = 'Wähle eine andere Kategorie oder drücke Reset.';
      showRow.classList.add('hidden');
      return;
    }

    current = queue[0];
    const isDeSe = direction === 'de-se';

    promptLabel.textContent = isDeSe ? 'Deutsch → Schwedisch' : 'Schwedisch → Deutsch';
    promptWord.textContent = isDeSe ? current.de : current.se;
  }

  function showAnswer() {
    if (!current) return;
    const isDeSe = direction === 'de-se';
    answerArea.classList.remove('hidden');
    answerWord.textContent = isDeSe ? current.se : current.de;

    let details = '';
    if (current.cat === 'verb') {
      details = `<strong>Infinitiv:</strong> ${current.inf || current.se}<br>
                 <strong>Präsens:</strong> ${current.pres || '—'}`;
    } else if (current.cat === 'noun') {
      details = `<strong>Artikel:</strong> ${current.gender}<br>
                 <strong>Singular:</strong> ${current.singular || current.se}<br>
                 <strong>Plural:</strong> ${current.plural || '—'}`;
    } else if (current.cat === 'prep') {
      details = 'Präposition';
    } else {
      details = 'Sonstiges Wort';
    }
    answerDetails.innerHTML = details;

    showRow.classList.add('hidden');
    rateRow.classList.remove('hidden');
  }

  function markCorrect() {
    if (!current) return;
    card.classList.add('flash-success');
    // Richtig → ans Ende der Queue
    queue.shift();
    queue.push(current);
    correctCount++;
    totalSeen++;
    setTimeout(() => {
      updateStats();
      nextCard();
    }, 280);
  }

  function markWrong() {
    if (!current) return;
    card.classList.add('flash-error');
    // Falsch → bleibt vorne (nach kurzer Verzögerung wieder zeigen)
    // Wir schieben es an Position 2–3, damit es bald wieder kommt
    queue.shift();
    const insertAt = Math.min(2, queue.length);
    queue.splice(insertAt, 0, current);
    totalSeen++;
    setTimeout(() => {
      updateStats();
      nextCard();
    }, 280);
  }

  function skip() {
    if (!current || queue.length === 0) return;
    queue.shift();
    queue.push(current);
    nextCard();
  }

  // ===== Event listeners =====
  document.getElementById('directionToggle').addEventListener('click', e => {
    const btn = e.target.closest('.toggle-btn');
    if (!btn) return;
    document.querySelectorAll('#directionToggle .toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    direction = btn.dataset.dir;
    nextCard();
  });

  document.getElementById('categoryGroup').addEventListener('click', e => {
    const btn = e.target.closest('.cat-btn');
    if (!btn) return;
    document.querySelectorAll('#categoryGroup .cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    category = btn.dataset.cat;
    buildQueue();
  });

  showBtn.addEventListener('click', showAnswer);
  rightBtn.addEventListener('click', markCorrect);
  wrongBtn.addEventListener('click', markWrong);
  skipBtn.addEventListener('click', skip);
  resetBtn.addEventListener('click', () => {
    if (confirm('Fortschritt zurücksetzen und neu mischen?')) {
      buildQueue();
    }
  });

  // Keyboard shortcuts (for desktop testing)
  document.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!answerArea.classList.contains('hidden')) {
        markCorrect();
      } else {
        showAnswer();
      }
    } else if (e.key === 'ArrowRight') {
      markCorrect();
    } else if (e.key === 'ArrowLeft') {
      markWrong();
    }
  });

  // ===== PWA Install =====
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    installBanner.classList.add('show');
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBanner.classList.remove('show');
  });

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // Start
  buildQueue();
})();
