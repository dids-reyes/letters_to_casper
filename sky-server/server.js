const http = require('node:http');
const { Server } = require('socket.io');

const COOLDOWN_MS = 12000;

function createSkyServer({
  origins = (process.env.SKY_ALLOWED_ORIGINS || 'https://letterstocasper.com,https://www.letterstocasper.com').split(',').map(s => s.trim()).filter(Boolean),
  now = Date.now,
} = {}) {
  const server = http.createServer((req, res) => {
    res.writeHead(req.url === '/health' ? 200 : 404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(req.url === '/health' ? { status: 'ok' } : { error: 'Not found' }));
  });
  const io = new Server(server, {
    cors: { origin: origins, methods: ['GET', 'POST'] },
    // CORS alone does not restrict WebSocket handshakes.
    allowRequest: (req, callback) => callback(null, origins.includes(req.headers.origin)),
    transports: ['polling', 'websocket'],
    maxHttpBufferSize: 1024,
  });
  const participants = new Map();
  io.on('connection', socket => {
    const point = { id: socket.id, x: 0.06 + Math.random() * 0.88, y: 0.08 + Math.random() * 0.84 };
    let lastPulse = -Infinity;
    socket.join('sky');
    participants.set(socket.id, point);
    socket.emit('sky_state', { selfId: socket.id, participants: [...participants.values()], cooldownMs: COOLDOWN_MS });
    socket.to('sky').emit('presence_joined', point);
    io.to('sky').emit('user_count', participants.size);
    socket.on('send_pulse', (ack) => {
      const timestamp = now();
      const retryAfterMs = Math.max(0, COOLDOWN_MS - (timestamp - lastPulse));
      if (retryAfterMs) {
        if (typeof ack === 'function') ack({ ok: false, retryAfterMs });
        return;
      }
      lastPulse = timestamp;
      socket.to('sky').emit('receive_pulse', { ...point });
      if (typeof ack === 'function') ack({ ok: true, cooldownMs: COOLDOWN_MS });
    });
    socket.on('disconnect', () => {
      participants.delete(socket.id);
      io.to('sky').emit('presence_left', socket.id);
      io.to('sky').emit('user_count', participants.size);
    });
  });
  return { server, io };
}

if (require.main === module) {
  const { server, io } = createSkyServer();
  server.listen(process.env.PORT || 3001, '0.0.0.0');
  process.on('SIGTERM', () => io.close(() => process.exit(0)));
}
module.exports = { createSkyServer, COOLDOWN_MS };
