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

fs.mkdirSync(DATA, { recursive: true });
if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, '[]', 'utf8');
const readJSON = (file, fallback) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } };
const writeJSON = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
const send = (res, status, payload, headers = {}) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers }); res.end(JSON.stringify(payload)); };
const readBody = req => new Promise((resolve, reject) => {
  let raw = ''; req.on('data', chunk => { raw += chunk; if (raw.length > 1_000_000) reject(new Error('Solicitud demasiado grande')); });
  req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('JSON inválido')); } });
  req.on('error', reject);
});
const safeText = (value, max = 2000) => String(value || '').trim().slice(0, max);

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
        writeJSON(MESSAGES_FILE, messages);
        return send(res, 201, { ok: true, message: 'Mensaje recibido. ¡Gracias por escribirnos!' });
      }
      if (req.method === 'POST' && url.pathname === '/api/chat') {
        const body = await readBody(req);
        if (!safeText(body.message, 500)) return send(res, 400, { error: 'Escribe un mensaje para Vely.' });
        return send(res, 200, { reply: assistantReply(body.message) });
      }
      if (req.method === 'POST' && url.pathname === '/api/admin/login') {
        const body = await readBody(req);
        if (safeText(body.email, 160) !== ADMIN_EMAIL || String(body.password || '') !== ADMIN_PASSWORD) return send(res, 401, { error: 'Correo o contraseña incorrectos.' });
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

    let pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const file = path.resolve(ROOT, `.${pathname}`);
    if (!file.startsWith(ROOT + path.sep) && file !== path.join(ROOT, 'index.html')) return send(res, 403, { error: 'Acceso denegado.' });
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return send(res, 404, { error: 'Archivo no encontrado.' });
    const ext = path.extname(file).toLowerCase();
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  } catch (error) {
    send(res, 500, { error: 'No fue posible procesar la solicitud.' });
  }
});
server.listen(PORT, () => console.log(`VELYRA disponible en http://localhost:${PORT}`));
