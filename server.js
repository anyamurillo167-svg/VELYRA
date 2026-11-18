/**
 * VELYRA — backend académico mínimo, sin dependencias externas.
 * Requiere Node.js 18+. GitHub Pages no ejecuta este servidor; consulta README.md.
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const MESSAGES_FILE = path.join(DATA, 'messages.json');
const PRODUCTS_FILE = path.join(DATA, 'products.json');
const PORT = Number(process.env.PORT || 3000);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@velyra.co';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Velyra2026!';
const sessions = new Map();
const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;
const MAX_STORED_MESSAGES = 500;

fs.mkdirSync(DATA, { recursive: true });
if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, '[]', 'utf8');
const readJSON = (file, fallback) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } };
const writeJSON = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
const send = (res, status, payload, headers = {}) => {
  res.writeHead(status, { ...securityHeaders, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(JSON.stringify(payload));
};
class RequestError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}
const readBody = req => new Promise((resolve, reject) => {
  let raw = '';
  let tooLarge = false;
  req.on('data', chunk => {
    if (tooLarge) return;
    raw += chunk;
    if (Buffer.byteLength(raw) > 64 * 1024) {
      tooLarge = true;
      reject(new RequestError('La solicitud supera el límite de 64 KB.', 413));
    }
  });
  req.on('end', () => {
    if (tooLarge) return;
    try { resolve(JSON.parse(raw || '{}')); }
    catch { reject(new RequestError('El cuerpo debe contener JSON válido.', 400)); }
  });
  req.on('error', reject);
});
const safeText = (value, max = 2000) => String(value || '').trim().slice(0, max);
const pruneExpiredSessions = now => {
  for (const [token, expiry] of sessions) {
    if (expiry <= now) sessions.delete(token);
  }
};

function assistantReply(message) {
  const m = safeText(message, 500).toLocaleLowerCase('es-CO');
  if (/look|ropa|outfit|vest|combina/.test(m)) return '¡Vamos a crear algo lindo! ✨ Para un look casual prueba una blusa básica, un jean recto y accesorios plateados. Para algo elegante, suma una pieza protagonista y mantén el resto sencillo. ¿Para qué ocasión lo necesitas?';
  if (/maquill|beauty|piel/.test(m)) return 'Podemos empezar por el mood que quieres: natural, luminoso, romántico o más dramático. La idea es adaptar las tendencias a tus gustos, sin reglas rígidas. 🌷';
  if (/contenido|foto|video|redes|crear/.test(m)) return 'Elige una paleta de 2 o 3 colores, define una inspiración y crea una mini secuencia: detalle del outfit, accesorio protagonista y resultado final. ¡Así tu contenido se ve coherente sin perder naturalidad!';
  if (/velyra|página|pagina|funciona|app|navegar/.test(m)) return 'VELYRA reúne moda, belleza, inspiración y creación de contenido. Puedes explorar el catálogo, probar las pantallas de la app y conocer la idea de nuestro espacio físico creativo. La app aún es un concepto.';
  if (/hola|buenas|hey/.test(m)) return '¡Holiii! 🐰 Qué gusto tenerte por aquí. ¿Hoy vienes por inspiración de moda, beauty o ideas para crear contenido?';
  return 'Te leo. 🌷 ¿Buscas inspiración de moda, ideas de maquillaje, ayuda para crear contenido o información sobre el proyecto VELYRA?';
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) {
      if (req.method === 'GET' && url.pathname === '/api/health') return send(res, 200, { ok: true, name: 'VELYRA API', version: '1.0' });
      if (req.method === 'GET' && url.pathname === '/api/products') return send(res, 200, readJSON(PRODUCTS_FILE, []));
      if (req.method === 'POST' && url.pathname === '/api/contact') {
        const body = await readBody(req);
        const name = safeText(body.name, 90), email = safeText(body.email, 160), subject = safeText(body.subject, 120), message = safeText(body.message, 2000);
        if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message) return send(res, 400, { error: 'Completa nombre, correo válido y mensaje.' });
        const messages = readJSON(MESSAGES_FILE, []);
        messages.push({ id: crypto.randomUUID(), name, email, subject, message, date: new Date().toISOString() });
        writeJSON(MESSAGES_FILE, messages.slice(-MAX_STORED_MESSAGES));
        return send(res, 201, { ok: true, message: 'Mensaje recibido. ¡Gracias por escribirnos!' });
      }
      if (req.method === 'POST' && url.pathname === '/api/chat') {
        const body = await readBody(req);
        if (!safeText(body.message, 500)) return send(res, 400, { error: 'Escribe un mensaje para Vely.' });
        return send(res, 200, { reply: assistantReply(body.message) });
      }
      if (req.method === 'POST' && url.pathname === '/api/admin/login') {
        const body = await readBody(req);
        const ip = req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        const previous = loginAttempts.get(ip);
        const attempt = previous && now - previous.startedAt < LOGIN_WINDOW_MS
          ? previous
          : { startedAt: now, count: 0 };
        if (attempt.count >= LOGIN_MAX_ATTEMPTS) {
          const retryAfter = Math.ceil((LOGIN_WINDOW_MS - (now - attempt.startedAt)) / 1000);
          return send(res, 429, { error: 'Demasiados intentos. Inténtalo más tarde.' }, { 'Retry-After': String(retryAfter) });
        }
        if (safeText(body.email, 160) !== ADMIN_EMAIL || String(body.password || '') !== ADMIN_PASSWORD) {
          attempt.count += 1;
          loginAttempts.set(ip, attempt);
          return send(res, 401, { error: 'Correo o contraseña incorrectos.' });
        }
        loginAttempts.delete(ip);
        pruneExpiredSessions(now);
        const token = crypto.randomBytes(32).toString('hex');
        sessions.set(token, Date.now() + 8 * 60 * 60 * 1000);
        return send(res, 200, { token, expiresIn: 28800 });
      }
      const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
      const expiry = sessions.get(token);
      if (!token || !expiry || expiry < Date.now()) { if (token) sessions.delete(token); return send(res, 401, { error: 'Sesión no válida. Vuelve a ingresar.' }); }
      if (req.method === 'GET' && url.pathname === '/api/admin/messages') return send(res, 200, readJSON(MESSAGES_FILE, []));
      if (req.method === 'DELETE' && url.pathname === '/api/admin/messages') { writeJSON(MESSAGES_FILE, []); return send(res, 200, { ok: true }); }
      if (req.method === 'POST' && url.pathname === '/api/admin/logout') { sessions.delete(token); return send(res, 200, { ok: true }); }
      return send(res, 404, { error: 'Ruta API no encontrada.' });
    }

    if (!['GET', 'HEAD'].includes(req.method)) return send(res, 405, { error: 'Método no permitido.' }, { Allow: 'GET, HEAD' });
    let pathname;
    try { pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname); }
    catch { return send(res, 400, { error: 'La ruta contiene una codificación inválida.' }); }
    const file = path.resolve(ROOT, `.${pathname}`);
    const relativeFile = path.relative(ROOT, file);
    if (relativeFile.startsWith('..') || path.isAbsolute(relativeFile)) return send(res, 403, { error: 'Acceso denegado.' });
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      const notFoundPage = path.join(ROOT, '404.html');
      if (fs.existsSync(notFoundPage)) {
        res.writeHead(404, { ...securityHeaders, 'Content-Type': 'text/html; charset=utf-8' });
        return fs.createReadStream(notFoundPage).pipe(res);
      }
      return send(res, 404, { error: 'Archivo no encontrado.' });
    }
    const ext = path.extname(file).toLowerCase();
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
    res.writeHead(200, { ...securityHeaders, 'Content-Type': types[ext] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  } catch (error) {
    const status = Number.isInteger(error.status) ? error.status : 500;
    const message = status < 500 ? error.message : 'No fue posible procesar la solicitud.';
    send(res, status, { error: message });
  }
});
server.listen(PORT, () => console.log(`VELYRA disponible en http://localhost:${PORT}`));
