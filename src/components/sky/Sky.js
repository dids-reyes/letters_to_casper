import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import './Sky.css';

const COOLDOWN_MS = 12000;
export function daylightAt(date) {
  const hour = date.getHours() + date.getMinutes() / 60;
  return Math.max(0, Math.min(1, (hour - 5) / 2, (19 - hour) / 2));
}

// Bounded oscillation keeps each visitor near their shared, normalized position.
function position(point, time, reduced) {
  const phase = point.x * 30 + point.y * 20;
  return {
    x: point.x + (reduced ? 0 : Math.sin(time / 18000 + phase) * .008),
    y: point.y + (reduced ? 0 : Math.cos(time / 23000 + phase) * .008),
  };
}

export default function Sky() {
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const scene = useRef({ points: new Map(), pulses: [], selfId: null, redraw: () => {} });
  const deadline = useRef(0);
  const [remaining, setRemaining] = useState(0);
  const [status, setStatus] = useState('connecting');
  const [count, setCount] = useState(0);
  const [daylight, setDaylight] = useState(() => daylightAt(new Date()));
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const oldTitle = document.title;
    document.title = 'Sky';
    const timer = setInterval(() => {
      setDaylight(daylightAt(new Date()));
      setRemaining(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
    }, 1000);
    return () => { document.title = oldTitle; clearInterval(timer); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    const current = scene.current;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = media.matches;
    let frame = null;
    let width = 0;
    let height = 0;
    let lastFrame = 0;
    const dust = Array.from({ length: 65 }, () => ({ x: Math.random(), y: Math.random() }));

    function draw(timestamp) {
      frame = null;
      if (document.hidden) return;
      // Cap high-refresh displays at approximately 60fps.
      if (!reduced && timestamp - lastFrame < 16) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastFrame = timestamp;
      ctx.clearRect(0, 0, width, height);
      const time = Date.now();
      function dot(point, ambient) {
        const p = position(point, time, reduced);
        const alpha = reduced ? .65 : .55 + Math.sin(time / 2300 + point.x * 80) * .2;
        const radius = ambient ? .7 : point.id === current.selfId ? 2.2 : 1.6;
        ctx.fillStyle = 'rgba(216,230,243,' + (ambient ? alpha * .4 : alpha) + ')';
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, radius, 0, Math.PI * 2);
        ctx.fill();
        if (!ambient) {
          ctx.fillStyle = 'rgba(216,230,243,.05)';
          ctx.beginPath();
          ctx.arc(p.x * width, p.y * height, radius * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      dust.forEach(point => dot(point, true));
      current.points.forEach(point => dot(point, false));
      current.pulses = current.pulses.filter(pulse => time - pulse.started < (reduced ? 450 : 2600));
      current.pulses.forEach(pulse => {
        const progress = (time - pulse.started) / (reduced ? 450 : 2600);
        const p = position(pulse, time, reduced);
        ctx.strokeStyle = 'rgba(221,235,245,' + ((1 - progress) * .45) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, reduced ? 7 : 4 + progress * 85, 0, Math.PI * 2);
        ctx.stroke();
      });
      if (!reduced || current.pulses.length) frame = requestAnimationFrame(draw);
    }
    function redraw() {
      if (frame === null && !document.hidden) frame = requestAnimationFrame(draw);
    }
    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      redraw();
    }
    function motionChanged() { reduced = media.matches; redraw(); }
    function visibilityChanged() {
      if (document.hidden && frame !== null) { cancelAnimationFrame(frame); frame = null; }
      else redraw();
    }
    current.redraw = redraw;
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', visibilityChanged);
    media.addEventListener('change', motionChanged);
    resize();
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      current.redraw = () => {};
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visibilityChanged);
      media.removeEventListener('change', motionChanged);
    };
  }, []);

  useEffect(() => {
    const endpoint = process.env.REACT_APP_SKY_SOCKET_URL ||
      (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '');
    if (!endpoint) { setStatus('unavailable'); return undefined; }
    const current = scene.current;
    const socket = io(endpoint, { autoConnect: false, transports: ['polling', 'websocket'], forceNew: true });
    socketRef.current = socket;
    socket.on('sky_state', state => {
      current.selfId = state.selfId;
      current.points = new Map(state.participants.map(point => [point.id, point]));
      current.pulses = [];
      setCount(state.participants.length);
      setStatus('connected');
      current.redraw();
    });
    socket.on('presence_joined', point => { current.points.set(point.id, point); current.redraw(); });
    socket.on('presence_left', id => {
      current.points.delete(id);
      current.pulses = current.pulses.filter(pulse => pulse.id !== id);
      current.redraw();
    });
    socket.on('user_count', setCount);
    socket.on('receive_pulse', point => {
      if (!current.points.has(point.id) || document.hidden) return;
      current.pulses = [...current.pulses.slice(-39), { ...point, started: Date.now() }];
      current.redraw();
    });
    const disconnected = () => {
      setStatus('reconnecting');
      setCount(0);
      current.points.clear();
      current.pulses = [];
      current.selfId = null;
      current.redraw();
    };
    socket.on('disconnect', disconnected);
    socket.on('connect_error', disconnected);
    const leave = () => socket.disconnect();
    const resume = () => socket.connect();
    window.addEventListener('pagehide', leave);
    window.addEventListener('pageshow', resume);
    socket.connect();
    return () => {
      window.removeEventListener('pagehide', leave);
      window.removeEventListener('pageshow', resume);
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      current.points.clear();
      current.pulses = [];
      current.selfId = null;
    };
  }, []);

  function sendPulse() {
    const socket = socketRef.current;
    const current = scene.current;
    const point = current.points.get(current.selfId);
    if (!socket?.connected || !point || Date.now() < deadline.current) return;
    deadline.current = Date.now() + COOLDOWN_MS;
    setRemaining(12);
    setFeedback('Your pulse is reaching out.');
    current.pulses = [...current.pulses.slice(-39), { ...point, started: Date.now() }];
    current.redraw();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      try { navigator.vibrate?.(20); } catch (_) { /* Haptics are optional. */ }
    }
    // Volatile prevents replaying an old pulse after an interrupted connection.
    socket.timeout(5000).volatile.emit('send_pulse', (error, reply) => {
      if (socketRef.current !== socket) return;
      if (error) setFeedback('Your pulse could not reach the shared sky. Try again in a moment.');
      else if (!reply.ok) {
        deadline.current = Date.now() + reply.retryAfterMs;
        setFeedback('Take a quiet moment before another pulse.');
      } else setFeedback('Your pulse has been shared.');
    });
  }

  const others = Math.max(0, count - 1);
  return (
    <main className="sky-page" aria-labelledby="sky-title">
      <div className="sky-daylight" style={{ opacity: daylight }} aria-hidden="true" />
      <canvas className="sky-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="sky-content">
        <h1 id="sky-title">Sky</h1>
        <section className="sky-prompt" aria-label="Leave a pulse">
          <p>If you’re carrying a lot right now, leave a pulse so others know they aren’t alone.</p>
          <button className="sky-pulse" onClick={sendPulse} disabled={status !== 'connected' || remaining > 0} aria-describedby="sky-feedback">I'm here</button>
          <span className="sky-feedback" id="sky-feedback" role="status">
            {remaining > 0 ? 'Another pulse in ' + remaining + 's' : feedback}
          </span>
        </section>
        <p className="sky-count" role="status">
          {status === 'connected'
            ? others + (others === 1 ? ' quiet soul is' : ' quiet souls are') + ' looking at the sky with you right now.'
            : status === 'unavailable' ? 'The shared sky is resting for a moment.'
              : status === 'connecting' ? 'Finding our place in the sky…' : 'Reconnecting to the shared sky…'}
        </p>
      </div>
    </main>
  );
}
