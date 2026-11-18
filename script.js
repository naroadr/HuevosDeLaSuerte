let me = null;

document.addEventListener('DOMContentLoaded', async () => {
  $('egg-grid').innerHTML = ORDER.map(t => `
    <div class="card" data-rarity="${t}" id="card-${t}">
      <div class="egg-icon">${EGGS[t].icon}</div>
      <div class="egg-name rarity-${t}">${EGGS[t].name}</div>
      <div class="count" id="cnt-${t}">0</div>
    </div>`).join('') + (MYSTERY ? `
    <div class="card mystery">
      <div class="egg-icon mystery-icon"><span>🥚</span><i>🔒</i></div>
      <div class="egg-name">${MYSTERY.title}</div>
      <div class="count">???</div>
      <div class="mystery-hint">${MYSTERY.hint}</div>
    </div>` : '');

  const modal = $('guide-modal');
  $('open-guide-btn').onclick = () => modal.style.display = 'flex';
  $('close-guide-btn').onclick = () => modal.style.display = 'none';
  modal.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };

  me = await initCommon();
  await refresh(true);
  setInterval(() => !document.hidden && refresh(), 30000);   // se actualiza solo
  document.addEventListener('visibilitychange', () => !document.hidden && refresh());
});

async function refresh(first) {
  try {
    if (!first && Auth.token()) me = await api('/me');
    const [h, lb] = await Promise.all([api('/history'), api('/leaderboard')]);
    renderMe(); renderHistory(h.history); renderBoard(lb.top);
  } catch (e) {
    console.error(e);
    $('hatch-history-list').innerHTML = `<li class="history-item">No se pudo conectar con el servidor. Reintentando…</li>`;
  }
}

function renderMe() {
  $('login-banner').hidden = !!me;
  $('user-title').innerHTML = me ? `Inventario de <strong>${esc(me.login)}</strong>` : 'Inventario de recompensas del canal de <strong>RyuuzZ_</strong>';
  const s = me || { eggs: {}, seen: {}, hatched: { total: 0 }, fragments: 0, score: 0, rank: null, log: [] };

  const shown = visibleEggs(s);
  ORDER.forEach(t => {
    $('card-' + t).hidden = !shown.includes(t);
    const el = $('cnt-' + t), v = s.eggs[t] || 0;
    if (el.textContent != v) { el.textContent = v; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  });
  $('stat-score').textContent = s.score || 0;
  $('stat-frag').textContent = s.fragments || 0;
  $('stat-rank').textContent = s.rank ? '#' + s.rank : '—';

  const seen = ORDER.filter(t => s.seen[t]).length, total = shown.length;
  $('collection-fill').style.width = (seen / total * 100) + '%';
  $('collection-text').textContent = `${seen} / ${total} tipos descubiertos`;

  let done = 0;
  $('ach-grid').innerHTML = ACHIEVEMENTS.map(a => {
    const v = me ? a.val(s) : 0, ok = v >= a.goal; if (ok) done++;
    if (a.secret && !ok) return `<div class="ach locked secret"><div class="ach-icon">❓</div>
      <div class="ach-body"><strong>???</strong><small>Logro secreto. ¿Lo descubrirás?</small></div></div>`;
    return `<div class="ach ${ok ? 'done' : 'locked'}">
      <div class="ach-icon">${ok ? a.icon : '🔒'}</div>
      <div class="ach-body"><strong>${a.title}</strong><small>${a.desc}</small>
        <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(v / a.goal * 100, 100)}%"></div></div>
        <small>${ok ? '¡Completado!' : Math.min(v, a.goal) + ' / ' + a.goal}</small></div></div>`;
  }).join('');
  $('ach-count').textContent = `${done} / ${ACHIEVEMENTS.length}`;

  $('my-log').innerHTML = (s.log || []).length
    ? s.log.map(l => `<li class="history-item"><span>${EGGS[l.egg] ? EGGS[l.egg].single.replace(/^./, c => c.toUpperCase()) : esc(l.egg)}</span><small>${ago(l.t)}</small></li>`).join('')
    : `<li class="history-item">${me ? 'Todavía no has conseguido huevos. Canjéalos en el stream.' : 'Inicia sesión para ver tus huevos.'}</li>`;
}

function renderHistory(list) {
  $('hatch-history-list').innerHTML = list.length
    ? list.map(i => `<li class="history-item"><span><strong>${esc(i.user)}</strong> sacó ${esc(i.reward)} de un <span class="rarity-${esc(i.egg)}">${esc(EGGS[i.egg]?.single || i.egg)}</span></span><small>${ago(i.t)}</small></li>`).join('')
    : '<li class="history-item">Aún no hay eclosiones. ¡Sé el primero en abrir un huevo!</li>';
}

function renderBoard(top) {
  $('leaderboard').innerHTML = top.length
    ? top.map((u, i) => `<li class="${me && me.login === u.user ? 'me' : ''}"><span>${['🥇', '🥈', '🥉'][i] || i + 1 + '.'}</span><strong>${esc(u.user)}</strong><em>${u.score} pts</em></li>`).join('')
    : '<li>Sin datos todavía</li>';
}