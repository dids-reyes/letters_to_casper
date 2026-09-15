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

function anchorNote(card, point, width, height) {
  const x = point.x * width;
  const y = point.y * height;
  const cardWidth = card.offsetWidth;
  const cardHeight = card.offsetHeight;
  const left = Math.max(12, Math.min(width - cardWidth - 12, x - cardWidth / 2));
  const below = y < cardHeight + 40;
  const top = below ? y + 24 : y - cardHeight - 24;
  card.style.left = left + 'px';
  card.style.top = Math.max(12, Math.min(height - cardHeight - 12, top)) + 'px';
  card.style.setProperty('--note-pointer-x', Math.max(12, Math.min(cardWidth - 12, x - left)) + 'px');
  card.dataset.below = String(below);
}

export default function Sky() {
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const scene = useRef({ points: new Map(), pulses: [], selfId: null, redraw: () => {} });
  const deadline = useRef(0);
  const starButtons = useRef(new Map());
  const noteCard = useRef(null);
  const [people, setPeople] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [noteError, setNoteError] = useState('');
  const headerColor = '#' + [[4, 53], [9, 77], [20, 101]]
    .map(([night, day]) => Math.round(night + (day - night) * daylightAt(new Date())).toString(16).padStart(2, '0')).join('');

  const [remaining, setRemaining] = useState(0);
  const [status, setStatus] = useState('connecting');
  const [count, setCount] = useState(0);
  const [daylight, setDaylight] = useState(() => daylightAt(new Date()));
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let meta = document.querySelector('meta[name="theme-color"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    const previous = meta.getAttribute('content');
    const oldToastColor = document.documentElement.style.getPropertyValue('--sky-toast-color');
    document.documentElement.style.setProperty('--sky-toast-color', headerColor);
    meta.setAttribute('content', headerColor);
    return () => {
      if (oldToastColor) document.documentElement.style.setProperty('--sky-toast-color', oldToastColor);
      else document.documentElement.style.removeProperty('--sky-toast-color');
      if (created) meta.remove();
      else if (previous === null) meta.removeAttribute('content');
      else meta.setAttribute('content', previous);
    };
  }, [headerColor]);

  useEffect(() => {
    const escape = event => {
      if (event.key === 'Escape') { setSelected(null); setEditing(false); }
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, []);

  useEffect(() => {
    const oldTitle = document.title;
    document.title = 'Sky';
    document.documentElement.classList.add('sky-active');
    const timer = setInterval(() => {
      setDaylight(daylightAt(new Date()));
      setRemaining(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
    }, 1000);
    return () => {
      document.title = oldTitle;
      document.documentElement.classList.remove('sky-active');
      clearInterval(timer);
    };
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
    const dust = Array.from({ length: 140 }, () => ({
      x: Math.random(), y: Math.random(), brightness: .18 + Math.random() * .55,
      size: .35 + Math.random() * .8,
    }));
    let meteors = [];
    let nextMeteor = Date.now() + 6000 + Math.random() * 5000;

    // Cache the soft optical glow rather than build a gradient for every star/frame.
    const glow = document.createElement('canvas');
    glow.width = glow.height = 64;
    const glowCtx = glow.getContext('2d');
    const gradient = glowCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(248,250,255,1)');
    gradient.addColorStop(.07, 'rgba(229,240,255,.9)');
    gradient.addColorStop(.2, 'rgba(182,210,255,.3)');
    gradient.addColorStop(.5, 'rgba(145,184,240,.07)');
    gradient.addColorStop(1, 'rgba(145,184,240,0)');
    glowCtx.fillStyle = gradient;
    glowCtx.fillRect(0, 0, 64, 64);

    function starlight(x, y, size, brightness) {
      ctx.globalAlpha = brightness;
      ctx.drawImage(glow, x - size / 2, y - size / 2, size, size);
      ctx.globalAlpha = 1;
    }


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
        if (ambient && !reduced) {
          p.x = (point.x + time / 180000 * (.3 + point.size * .2)) % 1;
          p.y = (point.y + Math.sin(time / 16000 + point.x * 20) * .018 + 1) % 1;
        }
        const shimmer = reduced ? .8 : .72 + Math.sin(time / (1800 + point.x * 2200) + point.y * 80) * .22;
        // Independent slow fades make the distant field breathe without flashing.
        const fade = reduced ? .55 : Math.pow(
          Math.max(0, Math.sin(time / (2200 + point.x * 2800) + point.y * 90)), 2);
        const brightness = ambient ? point.brightness * fade * .75 : shimmer;
        const size = ambient ? 4 + point.size * 3 : point.id === current.selfId ? 32 : 26;
        starlight(p.x * width, p.y * height, size, brightness);
        const button = !ambient && starButtons.current.get(point.id);
        if (button) {
          button.style.left = (p.x * 100) + '%';
          button.style.top = (p.y * 100) + '%';
          if (noteCard.current?.dataset.starId === point.id) {
            anchorNote(noteCard.current, p, width, height);
          }
        }
      }
      dust.forEach(point => dot(point, true));
      current.points.forEach(point => dot(point, false));
      current.pulses = current.pulses.filter(pulse => time - pulse.started < (reduced ? 1000 : 12000));
      current.pulses.forEach(pulse => {
        const progress = Math.max(0, (time - pulse.started) / (reduced ? 1000 : 12000));
        // One slow rise and fall, like a distant star catching the light.
        const light = Math.pow(Math.sin(progress * Math.PI), 2);
        const p = position(pulse, time, reduced);
        const x = p.x * width;
        const y = p.y * height;
        starlight(x, y, reduced ? 28 : 46 + light * 32, light * (reduced ? .35 : .95));
        if (!reduced) {
          // Fine, fading optical rays, with no outline or expanding ring.
          const reach = 8 + light * 22;
          for (const [dx, dy] of [[reach, 0], [-reach, 0], [0, reach], [0, -reach]]) {
            const ray = ctx.createLinearGradient(x, y, x + dx, y + dy);
            ray.addColorStop(0, 'rgba(232,242,255,' + light * .6 + ')');
            ray.addColorStop(1, 'rgba(190,216,255,0)');
            ctx.strokeStyle = ray;
            ctx.lineWidth = .65;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + dx, y + dy);
            ctx.stroke();
          }
        }
      });
      if (!reduced) {
        if (time >= nextMeteor) {
          const shower = Math.random() < .25;
          meteors = Array.from({ length: shower ? 3 : 1 }, (_, index) => ({
            x: .08 + Math.random() * .6, y: .05 + Math.random() * .3,
            started: time + index * 650, duration: 1400 + Math.random() * 600,
          }));
          nextMeteor = time + 18000 + Math.random() * 24000;
        }
        meteors = meteors.filter(meteor => time - meteor.started < meteor.duration);
        meteors.forEach(meteor => {
          const progress = (time - meteor.started) / meteor.duration;
          if (progress < 0) return;
          const distance = Math.min(width * .35, 320);
          const x = meteor.x * width + progress * distance;
          const y = meteor.y * height + progress * distance * .55;
          const tail = Math.min(90, distance * .4);
          const light = Math.sin(progress * Math.PI) * .65;
          const trail = ctx.createLinearGradient(x - tail, y - tail * .55, x, y);
          trail.addColorStop(0, 'rgba(172,204,239,0)');
          trail.addColorStop(1, 'rgba(226,238,253,' + light + ')');
          ctx.strokeStyle = trail;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x - tail, y - tail * .55);
          ctx.lineTo(x, y);
          ctx.stroke();
          starlight(x, y, 12, light);
        });
      }
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
    function motionChanged() { reduced = media.matches; meteors = []; nextMeteor = Date.now() + 9000; redraw(); }
    function visibilityChanged() {
      if (document.hidden && frame !== null) { cancelAnimationFrame(frame); frame = null; }
      else { meteors = []; nextMeteor = Date.now() + 9000; redraw(); }
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
      setPeople(state.participants);
      setSelected(null);
      setCount(state.participants.length);
      setStatus('connected');
      current.redraw();
    });
    socket.on('presence_joined', point => {
      current.points.set(point.id, point);
      setPeople([...current.points.values()]);
      current.redraw();
    });
    socket.on('note_updated', ({ id, note }) => {
      const point = current.points.get(id);
      if (!point) return;
      current.points.set(id, { ...point, note });
      setPeople([...current.points.values()]);
    });
    socket.on('presence_left', id => {
      current.points.delete(id);
      setPeople([...current.points.values()]);
      setSelected(value => value === id ? null : value);
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
      setPeople([]);
      setSelected(null);
      setEditing(false);
      setSaving(false);
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

  useEffect(() => {
    if (!selected || editing || !noteCard.current) return;
    const update = () => {
      const point = scene.current.points.get(selected);
      const canvas = canvasRef.current;
      if (!point || !canvas || !noteCard.current) return;
      anchorNote(noteCard.current, position(point, Date.now(),
        window.matchMedia('(prefers-reduced-motion: reduce)').matches), canvas.clientWidth, canvas.clientHeight);
      scene.current.redraw();
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [selected, editing, people]);

  const existingNote = people.find(person => person.id === scene.current.selfId)?.note || '';
  const clearExistingNote = Boolean(existingNote) && draft === existingNote;

  function saveNote(event) {
    event.preventDefault();
    const socket = socketRef.current;
    if (!socket?.connected || saving) return;
    setSaving(true);
    setNoteError('');
    const noteToSave = clearExistingNote ? '' : draft;
    socket.timeout(5000).volatile.emit('set_note', noteToSave, (error, reply) => {
      if (socketRef.current !== socket) return;
      setSaving(false);
      if (error || !reply?.ok) {
        setNoteError(error ? 'Could not save your note. Please try again.' : reply.error);
      } else {
        setEditing(false);
        setFeedback(noteToSave.trim() ? 'Your note is in the sky.' : 'Your note has been removed.');
      }
    });
  }

  const selectedPerson = people.find(person => person.id === selected);
  const others = Math.max(0, count - 1);
  return (
    <main className="sky-page" style={{ '--sky-header-color': headerColor }} aria-labelledby="sky-title">
      <div className="sky-daylight" style={{ opacity: daylight }} aria-hidden="true" />
      <canvas className="sky-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="sky-stars" aria-label="Quiet souls">
        {people.map((person, index) => (
          <button key={person.id} className={"sky-star" + (person.note ? " sky-star--note" : "")}
            ref={node => { if (node) starButtons.current.set(person.id, node); else starButtons.current.delete(person.id); }}
            style={{ left: (person.x * 100) + '%', top: (person.y * 100) + '%' }}
            aria-label={(person.id === scene.current.selfId ? 'Your star' : 'Quiet soul ' + (index + 1)) + (person.note ? ', read note' : ', no note yet')}
            aria-pressed={selected === person.id}
            onClick={() => { setEditing(false); setSelected(value => value === person.id ? null : person.id); }} />
        ))}
      </div>
      <div className="sky-content">
        <header className="sky-heading">
          <h1 id="sky-title">Sky</h1>
          <a className="sky-home" href="https://letterstocasper.com/" aria-label="Letters to Casper home">
            <img className="sky-logo" src="/ltc-preview.webp" alt="Letters to Casper" />
          </a>
        </header>
        <section className="sky-prompt" aria-label="Leave a pulse">
          <p>If you’re carrying a lot right now, leave a pulse so others know they aren’t alone.</p>
          <button className="sky-pulse" onClick={sendPulse} disabled={status !== 'connected' || remaining > 0} aria-describedby="sky-feedback">I'm here</button>
          <span className="sky-feedback" id="sky-feedback" role="status">
            {remaining > 0 ? 'Another pulse in ' + remaining + 's' : feedback}
          </span>
        </section>
        <footer className="sky-footer">
        <button className="sky-note-action" disabled={status !== 'connected'} onClick={() => {
          setDraft(scene.current.points.get(scene.current.selfId)?.note || '');
          setNoteError(''); setSelected(null); setEditing(true);
        }}>Leave a little note</button>
        <small className="sky-note-hint">Tap a cross-lit star to read a note</small>
        <p className="sky-count" role="status">
          {status === 'connected'
            ? others + (others === 1 ? ' quiet soul is' : ' quiet souls are') + ' looking at the sky with you right now.'
            : status === 'unavailable' ? 'The shared sky is resting for a moment.'
              : status === 'connecting' ? 'Finding our place in the sky…' : 'Reconnecting to the shared sky…'}
        </p>
        </footer>
      </div>
      {(editing || selectedPerson) && (
        <section key={editing ? 'editor' : 'star-note'} ref={noteCard} data-star-id={editing ? undefined : selected} className={"sky-note-card" + (editing ? "" : " sky-note-card--anchored")} role="dialog" aria-label={editing ? 'Your sky note' : 'A quiet note'}>
          <button className="sky-note-close" aria-label="Close note" onClick={() => { setEditing(false); setSelected(null); }}>×</button>
          {editing ? <form onSubmit={saveNote}>
            <label htmlFor="sky-note">A little note for the sky</label>
            <textarea id="sky-note" autoFocus rows="2" value={draft}
              onChange={event => setDraft([...event.target.value].slice(0, 80).join(''))}
              aria-describedby="sky-note-help" />
            <small id="sky-note-help">{[...draft].length}/80 · Public until you leave.</small>
            <button type="submit" disabled={saving || status !== 'connected'}>{saving ? 'Saving…' : clearExistingNote ? 'Clear note' : 'Save note'}</button>
            {noteError && <p role="alert">{noteError}</p>}
          </form> : <>
            {selectedPerson.note && <small>A quiet soul left this here</small>}
            <p>{selectedPerson.note || 'A quiet soul is here too.'}</p>
          </>}
        </section>
      )}
    </main>
  );
}
