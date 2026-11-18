let me = null, busy = false;
const wait = ms => new Promise(r => setTimeout(r, ms));

document.addEventListener('DOMContentLoaded', async () => {
  me = await initCommon();
  if (!me) { $('hatch-result').textContent = 'Inicia sesión con Twitch para eclosionar tus huevos.'; return; }
  renderStock();
});

function renderStock() {
  const total = ORDER.reduce((n, t) => n + me.eggs[t], 0);
  $('egg-stock').innerHTML = total ? `Te quedan <b>${total}</b> ${total === 1 ? 'huevo' : 'huevos'} por eclosionar` : '';
  $('hatch-btn').disabled = busy || !total;
  if (!total && !busy) $('hatch-result').textContent = 'No te quedan huevos. ¡Canjea más en el stream!';
}

$('hatch-btn').addEventListener('click', async () => {
  if (busy) return;
  busy = true; $('hatch-btn').disabled = true;
  const egg = $('egg-display'), res = $('hatch-result');
  $('fragment-result').textContent = '';
  egg.className = 'egg-visual shaking'; egg.textContent = '🥚';
  res.style.color = 'var(--count-color)'; res.textContent = '¡El huevo está temblando!';

  try {
    const before = structuredClone(me);
    const [data] = await Promise.all([api('/hatch', { method: 'POST', body: JSON.stringify({}) }), wait(2500)]);
    me = data.me;
    egg.className = 'egg-visual hatching-pop glow-' + data.egg;
    await wait(400);

    const r = data.reward;
    egg.innerHTML = r.img ? `<img class="prize-img" src="${esc(r.img)}" alt="${esc(r.name)}">` : esc(r.icon);
    res.innerHTML = `¡Felicidades! Has conseguido:<br><strong>${esc(r.name)}</strong>`;
    res.style.color = '#16a34a';
    $('fragment-result').textContent = `✨ +${data.fragments} Fragmentos de suerte`;
    if (data.egg === 'mitico' && typeof confetti === 'function')
      [0, 400, 800].forEach(d => setTimeout(() => confetti({ particleCount: 150, spread: 120, origin: { y: 0.5 } }), d));
    else if (['epico', 'legendario'].includes(data.egg) && typeof confetti === 'function')
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ['#a855f7', '#ca8a04', '#0284c7', '#22c55e'] });

    ACHIEVEMENTS.filter(a => a.val(me) >= a.goal && a.val(before) < a.goal).forEach((a, i) => setTimeout(() => toast(`🏅 Logro desbloqueado: ${a.title}`), 800 + i * 3200));
  } catch (e) {
    egg.className = 'egg-visual';
    res.style.color = '#ef4444';
    res.textContent = e.status === 401 ? 'Tu sesión ha caducado. Vuelve a iniciar sesión.' : e.message;
  }
  busy = false; renderStock();
});

function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}