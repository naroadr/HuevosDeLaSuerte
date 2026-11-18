// ====== CONFIG: pon aquí la URL de tu Worker ======
const CFG = {
  API: 'https://naroadr.github.io/HuevosDeLaSuerte/',
  CLIENT_ID: 'h987nd0jv7sd956zhnockko3mjmgaa'
};

const EGGS = {
  roto:       { name: 'Huevos Rotos',        single: 'huevo roto',        icon: '😞' },
  comun:      { name: 'Huevos Comunes',      single: 'huevo común',       icon: '🥚' },
  pcomun:     { name: 'Huevos Poco Comunes', single: 'huevo poco común',  icon: '🟢' },
  raro:       { name: 'Huevos Raros',        single: 'huevo raro',        icon: '🔵' },
  epico:      { name: 'Huevos Épicos',       single: 'huevo épico',       icon: '<img src="imagenes/huevodragonu.png" alt="" class="card-img">' },
  legendario: { name: 'Huevos Legendarios',  single: 'huevo legendario',  icon: '👑' },
  // Huevos secretos: su tarjeta no aparece hasta que el viewer consigue uno
  mitico:     { name: 'Huevos Míticos',      single: 'huevo MÍTICO',      icon: '🌌', secret: true },
  troll:      { name: 'Huevos Troll',        single: 'huevo troll',       icon: '🤡', secret: true }
};
// Tarjeta misteriosa al final de la colección (evento / secreto). Ponla a null para ocultarla.
const MYSTERY = { title: 'Huevo misterioso', hint: 'Próximamente en un evento especial' };
const ORDER = Object.keys(EGGS);
const BASE = ORDER.filter(t => !EGGS[t].secret);
// Un huevo secreto es visible si el usuario lo ha tenido alguna vez
const visibleEggs = s => ORDER.filter(t => !EGGS[t].secret || s.seen[t] || s.eggs[t] > 0);

// secret: true -> se muestra como "???" hasta desbloquearlo
const ACHIEVEMENTS = [
  { icon: '🥚', title: 'Eclosionador Novato',      desc: 'Eclosiona 10 huevos',        goal: 10,  val: s => s.hatched.total },
  { icon: '📦', title: 'Eclosionador Experto',     desc: 'Eclosiona 100 huevos',       goal: 100, val: s => s.hatched.total },
  { icon: '💀', title: 'Skill issue de manual',    desc: 'Eclosiona 20 huevos rotos',  goal: 20,  val: s => s.hatched.roto },
  { icon: '🔵', title: 'Cazador de huevos raros',  desc: 'Eclosiona 10 huevos raros',  goal: 10,  val: s => s.hatched.raro },
  { icon: '🟣', title: 'Bendecido por los huevos', desc: 'Eclosiona 5 huevos épicos',  goal: 5,   val: s => s.hatched.epico },
  { icon: '👑', title: 'Elegido de RyuuzZ',        desc: 'Eclosiona 1 legendario',     goal: 1,   val: s => s.hatched.legendario },
  { icon: '📚', title: 'Coleccionista',            desc: 'Descubre los 6 tipos básicos', goal: BASE.length, val: s => BASE.filter(t => s.seen[t]).length },
  { icon: '✨', title: 'Acumulador',               desc: 'Reúne 500 fragmentos',       goal: 500, val: s => s.fragments },
  { icon: '🪦', title: 'Racha maldita',            desc: 'Eclosiona 3 huevos rotos seguidos', goal: 3, val: s => s.maxBad, secret: true },
  { icon: '🌈', title: 'Dueño del catálogo',       desc: 'Descubre todos los huevos, incluidos los secretos', goal: ORDER.length, val: s => ORDER.filter(t => s.seen[t]).length, secret: true }
];

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ago = t => {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m} min`;
  if (m < 1440) return `hace ${Math.round(m / 60)} h`;
  return `hace ${Math.round(m / 1440)} d`;
};

const Auth = {
  token: () => localStorage.getItem('twitch_token'),
  captureToken() {
    const t = new URLSearchParams(location.hash.slice(1)).get('access_token');
    if (t) { localStorage.setItem('twitch_token', t); history.replaceState(null, '', location.pathname + location.search); }
  },
  loginUrl: () => `https://id.twitch.tv/oauth2/authorize?client_id=${CFG.CLIENT_ID}&redirect_uri=${encodeURIComponent(location.origin + location.pathname)}&response_type=token&scope=`,
  logout() { localStorage.removeItem('twitch_token'); location.reload(); }
};

async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (Auth.token()) headers.Authorization = 'Bearer ' + Auth.token();
  const r = await fetch(CFG.API + path, { ...opts, headers });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401) localStorage.removeItem('twitch_token');
  if (!r.ok) throw Object.assign(new Error(d.error || 'Error de conexión'), { status: r.status });
  return d;
}

function setupTheme() {
  const icon = $('theme-icon'), root = document.documentElement;
  const apply = t => {
    t === 'light' ? root.setAttribute('data-theme', 'light') : root.removeAttribute('data-theme');
    if (icon) icon.src = t === 'light' ? 'imagenes/sol.png' : 'imagenes/luna.png';
  };
  apply(localStorage.getItem('theme') || 'dark');
  $('theme-toggle')?.addEventListener('click', () => {
    const t = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', t); apply(t);
  });
}

function setupMenu(me) {
  const box = $('top-username-container'), dd = $('user-dropdown'), btn = $('auth-action-btn');
  box?.addEventListener('click', e => { e.stopPropagation(); dd.classList.toggle('show'); });
  window.addEventListener('click', () => dd?.classList.remove('show'));
  $('display-username').textContent = me ? me.login : 'Invitado';
  if (me) { btn.textContent = '🚪 Cerrar sesión'; btn.href = '#'; btn.onclick = e => { e.preventDefault(); Auth.logout(); }; }
  else { btn.textContent = '🟣 Iniciar sesión con Twitch'; btn.href = Auth.loginUrl(); }
}

function setupBgEggs() {
  const box = $('bg-eggs');
  if (!box || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  setInterval(() => {
    if (document.hidden) return;
    const img = document.createElement('img');
    img.src = 'imagenes/huevodragonu.png'; img.alt = ''; img.className = 'bg-floating-egg';
    const s = 30 + Math.random() * 30, d = 6 + Math.random() * 6;
    Object.assign(img.style, { width: s + 'px', height: s + 'px', left: Math.random() * 95 + 'vw', animationDuration: d + 's' });
    box.appendChild(img);
    setTimeout(() => img.remove(), d * 1000);
  }, 1200);
}

// Arranque común: devuelve los datos del usuario (o null si es invitado)
async function initCommon() {
  setupTheme(); setupBgEggs(); Auth.captureToken();
  let me = null;
  if (Auth.token()) { try { me = await api('/me'); } catch (e) { console.warn(e); } }
  setupMenu(me);
  return me;
}