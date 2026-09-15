const { test } = require('node:test');
const assert = require('node:assert/strict');
const { io: connect } = require('socket.io-client');
const { createSkyServer, COOLDOWN_MS } = require('./server');

function event(socket, name) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timed out: ' + name)), 3000);
    socket.once(name, value => { clearTimeout(timer); resolve(value); });
  });
}
test('shared presence, authoritative pulses, cooldown, leave and reconnect', async t => {
  let time = 100000;
  const { server, io } = createSkyServer({ now: () => time });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const sockets = [];
  t.after(async () => {
    sockets.forEach(socket => socket.disconnect());
    await new Promise(resolve => io.close(resolve));
  });
  const url = 'http://127.0.0.1:' + server.address().port;
  function client(transports = ['polling', 'websocket']) {
    const socket = connect(url, { autoConnect: false, transports, reconnection: false, extraHeaders: { Origin: 'https://letterstocasper.com' } });
    sockets.push(socket);
    return socket;
  }
  const a = client();
  let ready = event(a, 'sky_state');
  a.connect();
  const first = await ready;
  assert.equal(first.participants.length, 1);
  assert.ok(first.participants[0].x >= 0 && first.participants[0].x <= 1);
  assert.ok(first.participants[0].y >= 0 && first.participants[0].y <= 1);
  const b = client(['websocket']);
  ready = event(b, 'sky_state');
  const joined = event(a, 'presence_joined');
  const count = event(a, 'user_count');
  b.connect();
  const second = await ready;
  assert.equal(second.participants.length, 2);
  assert.equal((await joined).id, b.id);
  assert.equal(await count, 2);
  assert.deepEqual(second.participants[0], first.participants[0]);
  let senderEcho = 0;
  let received = 0;
  a.on('receive_pulse', () => senderEcho++);
  b.on('receive_pulse', () => received++);
  let pulse = event(b, 'receive_pulse');
  assert.equal((await a.emitWithAck('send_pulse')).ok, true);
  assert.deepEqual(await pulse, first.participants[0]);
  const rejected = await a.emitWithAck('send_pulse');
  assert.equal(rejected.ok, false);
  assert.equal(rejected.retryAfterMs, COOLDOWN_MS);
  time += COOLDOWN_MS;
  pulse = event(b, 'receive_pulse');
  assert.equal((await a.emitWithAck('send_pulse')).ok, true);
  await pulse;
  assert.equal(received, 2);
  assert.equal(senderEcho, 0);
  const oldId = b.id;
  const left = event(a, 'presence_left');
  const leftCount = event(a, 'user_count');
  b.disconnect();
  assert.equal(await left, oldId);
  assert.equal(await leftCount, 1);
  ready = event(b, 'sky_state');
  b.connect();
  const reconnected = await ready;
  assert.notEqual(reconnected.selfId, oldId);
  assert.equal(reconnected.participants.length, 2);
  assert.ok(!reconnected.participants.some(p => p.id === oldId));
});

for (const transport of ['polling', 'websocket']) {
  test('rejects foreign origins over ' + transport, async t => {
    const { server, io } = createSkyServer();
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const socket = connect('http://127.0.0.1:' + server.address().port, {
      autoConnect: false, transports: [transport], reconnection: false,
      extraHeaders: { Origin: 'https://unrelated.example' },
    });
    t.after(async () => { socket.disconnect(); await new Promise(resolve => io.close(resolve)); });
    const error = event(socket, 'connect_error');
    socket.connect();
    assert.ok(await error);
    assert.equal(io.engine.clientsCount, 0);
  });
}
