const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');

async function getFreePort() {
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  await new Promise(resolve => server.close(resolve));
  return port;
}

test('API de VELYRA: flujo principal y validaciones', async t => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'velyra-test-'));
  fs.copyFileSync(path.join(__dirname, '..', 'server.js'), path.join(temp, 'server.js'));
  fs.copyFileSync(path.join(__dirname, '..', 'index.html'), path.join(temp, 'index.html'));
  fs.copyFileSync(path.join(__dirname, '..', '404.html'), path.join(temp, '404.html'));
  fs.cpSync(path.join(__dirname, '..', 'data'), path.join(temp, 'data'), { recursive: true });
  const port = await getFreePort();
  const base = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['server.js'], {
    cwd: temp,
    env: { ...process.env, PORT: String(port), ADMIN_EMAIL: 'test@velyra.co', ADMIN_PASSWORD: 'test-password', DEMO_MODE: 'true' },
    stdio: 'ignore'
  });
  t.after(() => {
    child.kill();
    fs.rmSync(temp, { recursive: true, force: true });
  });

  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const response = await fetch(`${base}/api/health`);
      if (response.ok) { ready = true; break; }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.equal(ready, true, 'el servidor debe iniciar');

  const healthResponse = await fetch(`${base}/api/health`);
  const health = await healthResponse.json();
  assert.equal(health.ok, true);
  assert.equal(health.assistant, 'demo');
  assert.equal(healthResponse.headers.get('x-content-type-options'), 'nosniff');

  const cors = await fetch(`${base}/api/health`, { headers: { Origin: 'http://localhost:3000' } });
  assert.equal(cors.headers.get('access-control-allow-origin'), 'http://localhost:3000');

  const head = await fetch(base, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');

  const missing = await fetch(`${base}/ruta-que-no-existe`);
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /no encontramos|no existe|página/i);

  for (const privatePath of ['/server.js', '/data/messages.json', '/.env']) {
    const privateResponse = await fetch(`${base}${privatePath}`);
    assert.equal(privateResponse.status, 403, `${privatePath} no debe exponerse`);
  }

  const productsResponse = await fetch(`${base}/api/products`);
  assert.equal(productsResponse.status, 200);
  assert.ok(Array.isArray(await productsResponse.json()));

  const chat = await fetch(`${base}/api/chat`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hola' })
  }).then(r => r.json());
  assert.match(chat.reply, /Holiii/i);

  const malformed = await fetch(`${base}/api/chat`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{'
  });
  assert.equal(malformed.status, 400);

  const invalidContact = await fetch(`${base}/api/contact`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '', email: 'correo-mal', message: '' })
  });
  assert.equal(invalidContact.status, 400);

  const contact = await fetch(`${base}/api/contact`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Prueba', email: 'prueba@example.com', subject: 'Test', message: 'Mensaje de prueba' })
  });
  assert.equal(contact.status, 201);

  const login = await fetch(`${base}/api/admin/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@velyra.co', password: 'test-password' })
  });
  assert.equal(login.status, 200);
  const { token } = await login.json();
  const messages = await fetch(`${base}/api/admin/messages`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());
  assert.equal(messages.length, 1);
  assert.equal(messages[0].name, 'Prueba');
});


test('producción no finge una IA ni permite acceso admin sin credenciales', async t => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'velyra-production-test-'));
  fs.copyFileSync(path.join(__dirname, '..', 'server.js'), path.join(temp, 'server.js'));
  fs.cpSync(path.join(__dirname, '..', 'data'), path.join(temp, 'data'), { recursive: true });
  const port = await getFreePort();
  const child = spawn(process.execPath, ['server.js'], {
    cwd: temp,
    env: { ...process.env, PORT: String(port), DEMO_MODE: 'false', OPENAI_API_KEY: '', ADMIN_EMAIL: '', ADMIN_PASSWORD: '' },
    stdio: 'ignore'
  });
  t.after(() => { child.kill(); fs.rmSync(temp, { recursive: true, force: true }); });
  const base = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try { if ((await fetch(`${base}/api/health`)).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.equal(ready, true);
  const chat = await fetch(`${base}/api/chat`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hola' })
  });
  assert.equal(chat.status, 503);
  assert.match((await chat.json()).error, /OPENAI_API_KEY/);
  const login = await fetch(`${base}/api/admin/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'anything' })
  });
  assert.equal(login.status, 503);
});
