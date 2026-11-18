// Cloudflare Worker + KV (namespace enlazado como "DB"). Variables: CLIENT_ID, SECRET
const TYPES = ['roto', 'comun', 'pcomun', 'raro', 'epico', 'legendario', 'mitico', 'troll'];
const FRAG = { roto: 1, comun: 2, pcomun: 4, raro: 8, epico: 15, legendario: 30, mitico: 100, troll: 3 };
const PTS = { roto: 0, comun: 1, pcomun: 3, raro: 10, epico: 25, legendario: 100, mitico: 500, troll: 0 };
const REWARDS = {
  roto:   [['Excremento', '💩'], ['Piedra', '🪨'], ['Hueso', '🦴'], ['Pedo', '💨']],
  comun:  [['Estrella', '🌟'], ['Galleta', '🍪'], ['Moneda', '🪙'], ['Gota', '💧']],
  pcomun: [['Cristal', '🔮'], ['Rayo', '⚡'], ['Regalo', '🎁'], ['Trébol', '🍀']],
  raro:   [['Diamante', '💎'], ['Fuego', '🔥'], ['Cohete', '🚀'], ['Escudo', '🛡️']],
  epico:  [{ name: '2.500 Dragonus', img: 'imagenes/huevodragonu.png' }],
  legendario: [
    { name: 'Cofre de Streamloots', img: 'imagenes/cofre.png' },
    { name: '10.000 Dragonus', img: 'imagenes/huevodragonu.png' },
    { name: 'VIP 1 Semana', img: 'imagenes/vip.png' }
  ],
  // EDITA ESTOS PREMIOS A TU GUSTO (el troll se entrega a mano o con Streamer.bot)
  mitico: [
    { name: '50.000 Dragonus', img: 'imagenes/huevodragonu.png' },
    { name: 'VIP 1 Mes', img: 'imagenes/vip.png' },
    { name: 'Sub regalada', icon: '💜' }
  ],
  troll: [
    ['Timeout de 1 minuto', '🔇'], ['Apodo ridículo 24 h', '🏷️'], ['Roast del streamer', '🔥'],
    ['Debes escribir "soy un pollito"', '🐥'], ['Nada. Absolutamente nada', '🫥'], ['Un abrazo virtual', '🤗']
  ]
};
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Key', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });
const zero = () => Object.fromEntries(TYPES.map(t => [t, 0]));

const getJ = async (env, k, def) => JSON.parse((await env.DB.get(k)) || 'null') ?? def;
const putJ = (env, k, v) => env.DB.put(k, JSON.stringify(v));
const score = got => TYPES.reduce((n, t) => n + got[t] * PTS[t], 0);

async function getUser(env, login) {
  const u = (await getJ(env, 'u:' + login, {})) || {};
  return {
    eggs: { ...zero(), ...u.eggs }, got: { ...zero(), ...u.got }, seen: u.seen || {},
    hatched: { total: 0, ...zero(), ...u.hatched }, fragments: u.fragments || 0, log: u.log || [], bad: u.bad || 0, maxBad: u.maxBad || 0
  };
}
async function view(env, login, u) {
  const lb = await getJ(env, 'lb', {});
  const s = score(u.got);
  const rank = 1 + Object.entries(lb).filter(([n, v]) => v > s && n !== login).length;
  return { login, ...u, score: s, rank: s > 0 ? rank : null };
}
async function who(req, env) {
  const t = (req.headers.get('Authorization') || '').replace('Bearer ', '');
  if (!t) return null;
  const r = await fetch('https://id.twitch.tv/oauth2/validate', { headers: { Authorization: 'OAuth ' + t } });
  if (!r.ok) return null;
  const d = await r.json();
  return d.client_id === env.CLIENT_ID ? d.login.toLowerCase() : null;
}
const pick = a => a[Math.floor(Math.random() * a.length)];

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const { pathname: p } = new URL(req.url);

    if (p === '/history') return json({ history: await getJ(env, 'history', []) });
    if (p === '/leaderboard') {
      const lb = await getJ(env, 'lb', {});
      return json({ top: Object.entries(lb).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([user, score]) => ({ user, score })) });
    }

    // Streamer.bot -> añade huevos
    if (p === '/give' && req.method === 'POST') {
      if (req.headers.get('X-Key') !== env.SECRET) return json({ error: 'forbidden' }, 403);
      const { user, egg, amount = 1 } = await req.json();
      const n = Math.min(Math.max(parseInt(amount) || 1, 1), 100);
      if (!user || !TYPES.includes(egg)) return json({ error: 'datos inválidos' }, 400);
      const login = user.toLowerCase(), u = await getUser(env, login);
      u.eggs[egg] += n; u.got[egg] += n; u.seen[egg] = 1;
      u.log = [{ egg, n, t: Date.now() }, ...u.log].slice(0, 30);
      const lb = await getJ(env, 'lb', {}); lb[login] = score(u.got);
      await Promise.all([putJ(env, 'u:' + login, u), putJ(env, 'lb', lb)]);
      return json({ ok: true, eggs: u.eggs });
    }

    // Usuario logueado
    const login = await who(req, env);
    if (!login) return json({ error: 'Sesión no válida' }, 401);
    const u = await getUser(env, login);

    if (p === '/me') return json(await view(env, login, u));

    if (p === '/hatch' && req.method === 'POST') {
      const owned = TYPES.filter(t => u.eggs[t] > 0);
      if (!owned.length) return json({ error: 'No te quedan huevos' }, 400);
      // Siempre aleatorio: cada huevo del inventario tiene la misma probabilidad
      let r = Math.random() * owned.reduce((n, t) => n + u.eggs[t], 0);
      const type = owned.find(t => (r -= u.eggs[t]) < 0) || owned[0];

      const raw = pick(REWARDS[type]);
      const reward = Array.isArray(raw) ? { name: raw[0], icon: raw[1] } : raw;
      u.eggs[type]--; u.hatched[type]++; u.hatched.total++; u.fragments += FRAG[type];
      u.bad = type === 'roto' ? u.bad + 1 : 0; u.maxBad = Math.max(u.maxBad, u.bad); // racha de rotos (logro secreto)
      const h = await getJ(env, 'history', []);
      h.unshift({ user: login, egg: type, reward: reward.name, t: Date.now() });
      await Promise.all([putJ(env, 'u:' + login, u), putJ(env, 'history', h.slice(0, 25))]);
      return json({ egg: type, reward, fragments: FRAG[type], me: await view(env, login, u) });
    }
    return json({ error: 'not found' }, 404);
  }
};