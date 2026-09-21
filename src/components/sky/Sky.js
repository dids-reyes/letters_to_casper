import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { updatePageSeo } from '../../utils/seo';
import SkyMoon from './SkyMoon';
import { STAR_TINTS, DEFAULT_TINT } from './tints';
import './Sky.css';
import { getSafeStarPosition } from './safePositions';
import SkyChat, { CHAT_TTL_MS, MOOD_EMOJIS, MoodPicker, soulName } from './SkyChat';
import SkyProfileModal, { DefaultAvatarIcon } from './SkyProfileModal';
import { GENDER_ICONS } from './avatar';

const COOLDOWN_MS = 12000;
export function daylightAt(date) {
  const hour = date.getHours() + date.getMinutes() / 60;
  return Math.max(0, Math.min(1, (hour - 5) / 2, (19 - hour) / 2));
}

// Bounded oscillation keeps each visitor near their shared, normalized position.
function position(point, time, reduced) {
  const phase = point.x * 30 + point.y * 20;
  return {
    x: (point.safeX ?? point.x) + (reduced ? 0 : Math.sin(time / 18000 + phase) * (point.driftX ?? .008)),
    y: (point.safeY ?? point.y) + (reduced ? 0 : Math.cos(time / 23000 + phase) * (point.driftY ?? .008)),
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

// Anchor to the actual touch target, which already includes safe placement and drift.
function anchorStarCard(card, star) {
  if (!card || !star) return;
  const bounds = star.getBoundingClientRect();
  const parent = card.offsetParent || card.closest('.sky-page');
  if (!parent) return;
  const origin = parent.getBoundingClientRect();
  const width = parent.clientWidth || window.innerWidth;
  const height = parent.clientHeight || window.innerHeight;
  anchorNote(card, {
    x: (bounds.left + bounds.width / 2 - origin.left + parent.scrollLeft) / width,
    y: (bounds.top + bounds.height / 2 - origin.top + parent.scrollTop) / height,
  }, width, height);
  card.style.transform = 'none';
}

export default function Sky({ initialProfile = (process.env.NODE_ENV === 'test' ? { username: 'testSoul', age: 24, gender: 'male' } : null) }) {
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const scene = useRef({ points: new Map(), pulses: [], sparks: [], shootingStars: [], selfId: null, redraw: () => {}, meteors: [] });
  const deadline = useRef(0);
  const starButtons = useRef(new Map());
  const noteCard = useRef(null);
  const introCard = useRef(null);
  const headerRef = useRef(null);
  const dockRef = useRef(null);
  const [profile, setProfile] = useState(initialProfile);
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const pendingProfileRef = useRef(null);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [messages, setMessages] = useState([]);
  const [session, setSession] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [outgoing, setOutgoing] = useState(null);

  function handleProfileSubmit(data) {
    profileRef.current = data;
    setProfile(data);
    const current = scene.current;
    if (current.selfId) {
      const selfPoint = current.points.get(current.selfId);
      if (selfPoint) {
        Object.assign(selfPoint, {
          username: data.username,
          soul: data.username,
          age: data.age,
          gender: data.gender,
          avatar: data.avatar,
          mood: data.status || selfPoint.mood || '',
        });
        setPeople([...current.points.values()]);
      }
    }
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit('SET_TEMPORARY_PROFILE', data, reply => {
        if (!reply?.ok && reply?.error) {
          setFeedback(reply.error);
        }
      });
    } else {
      pendingProfileRef.current = data;
    }
  }

  function command(event, data, done = () => {}) {
    const socket = socketRef.current;
    if (!socket?.connected) { done(false, 'The shared sky is reconnecting.'); return; }
    socket.timeout(5000).volatile.emit(event, data, (error, reply) => {
      if (socketRef.current !== socket) return;
      const ok = !error && reply?.ok;
      const reason = error ? 'Could not reach the shared sky. Please try again.' : reply?.error;
      if (!ok) setFeedback(reason || 'Please try again.');
      done(ok, reason, reply);
    });
  }
  const changeMood = mood => command('set_mood', mood);

  useEffect(() => {
    const timer = setTimeout(() => setBannerVisible(false), 15000);
    return () => clearTimeout(timer);
  }, []);


  const [wishMessage, setWishMessage] = useState('');
  const [shootingUntil, setShootingUntil] = useState(0);
  const [selfTint, setSelfTint] = useState(() => {
    try {
      const saved = localStorage.getItem('sky_star_tint');
      return Object.prototype.hasOwnProperty.call(STAR_TINTS, saved) ? saved : DEFAULT_TINT;
    } catch (_) {
      return DEFAULT_TINT;
    }
  });

  const selfTintRef = useRef(selfTint);

  const [introId, setIntroId] = useState(null);
  const [people, setPeople] = useState([]);
  const [activity, setActivity] = useState([]);
  const [clock, setClock] = useState(Date.now());
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

  function selectTint(tintId) {
    if (!Object.prototype.hasOwnProperty.call(STAR_TINTS, tintId)) return;
    selfTintRef.current = tintId;
    setSelfTint(tintId);
    command('set_tint', tintId);
    try {
      localStorage.setItem('sky_star_tint', tintId);
    } catch (_) {}
    const current = scene.current;
    const selfPoint = current.points.get(current.selfId);
    if (selfPoint) {
      selfPoint.tint = tintId;
      current.redraw();
    }
  }

  function handleSkyClick() {
    const current = scene.current;
    const time = Date.now();
    const activeMeteors = (current.meteors || []).filter(m => time - m.started >= 0 && time - m.started < m.duration);
    if (activeMeteors.length > 0) {
      const meteor = activeMeteors[0];
      const progress = (time - meteor.started) / meteor.duration;
      const canvas = canvasRef.current;
      const w = canvas ? canvas.clientWidth : 800;
      const h = canvas ? canvas.clientHeight : 600;
      const distance = Math.min(w * 0.35, 320);
      const mx = (meteor.x * w + progress * distance) / (w || 1);
      const my = (meteor.y * h + progress * distance * 0.55) / (h || 1);

      const sparkCount = 12;
      const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
        x: mx,
        y: my,
        angle: (i / sparkCount) * Math.PI * 2 + Math.random() * 0.4,
        dist: 0.03 + Math.random() * 0.04,
        started: time,
        duration: 1500 + Math.random() * 500,
        tint: 'aurora',
      }));
      current.sparks = [...(current.sparks || []).slice(-30), ...newSparks];
      current.redraw();
      setWishMessage('A quiet wish was released into the night ✨');
      setTimeout(() => setWishMessage(''), 4000);
    }
  }

  function sendShootingStar(person) {
    if (Date.now() < shootingUntil) return;
    setShootingUntil(Date.now() + 5000);
    command('send_shooting_star', person.id, ok => {
      setShootingUntil(Date.now() + (ok ? 3000 : 0));
      if (ok) {
        setSelected(null);
        setFeedback('Your shooting star is on its way.');
      }
    });
  }

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
      if (event.key === 'Escape') { setIntroId(null); setSelected(null); setEditing(false); }
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, []);

  useEffect(() => {
    const cleanupSeo = updatePageSeo({
      title: 'Sky',
      description:
        'Look up at the shared realtime sky on Letters to Casper. Send stars, view peaceful pulses, and connect quietly with souls around the world.',
      canonicalUrl: 'https://letterstocasper.com/sky',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Sky · Letters to Casper',
        url: 'https://letterstocasper.com/sky',
        description:
          'A shared realtime night sky connecting quiet souls across the world on Letters to Casper.',
      },
    });
    document.documentElement.classList.add('sky-active');
    const timer = setInterval(() => {
      setClock(Date.now());
      setMessages(items => items.filter(m => Date.now() - m.createdAt < CHAT_TTL_MS));
      setDaylight(daylightAt(new Date()));
      setRemaining(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
    }, 1000);
    return () => {
      cleanupSeo();
      document.documentElement.classList.remove('sky-active');
      clearInterval(timer);
    };
  }, []);

  useLayoutEffect(() => {
    const layout = () => {
      const canvas = canvasRef.current;
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      const header = headerRef.current?.getBoundingClientRect();
      const dock = dockRef.current?.getBoundingClientRect();
      const zones = [
        { x: 0, y: 0, width, height: Math.max(120, header?.bottom || 0) },
        { x: 0, y: Math.min(height - 320, dock?.height ? dock.top : height), width, height: Math.max(320, dock?.height || 0) },
      ];
      scene.current.points.forEach(point => {
        // Stable per soul and viewport, including when a presence update arrives.
        let seed = [...point.id].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 1);
        const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
        const safe = getSafeStarPosition(width, height, zones, random);
        point.hidden = !safe;
        point.driftX = 8 / width; point.driftY = 8 / height;
        point.safeX = safe ? safe.x / width : .5;
        point.safeY = safe ? safe.y / height : .5;
        const button = starButtons.current.get(point.id);
        if (button) {
          button.hidden = !safe;
          button.style.left = point.safeX * 100 + '%';
          button.style.top = point.safeY * 100 + '%';
        }
      });
      scene.current.redraw();
    };
    layout();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(layout) : null;
    [headerRef.current, dockRef.current, canvasRef.current].forEach(el => { if (el) observer?.observe(el); });
    window.addEventListener('resize', layout);
    window.visualViewport?.addEventListener('resize', layout);
    return () => { observer?.disconnect(); window.removeEventListener('resize', layout); window.visualViewport?.removeEventListener('resize', layout); };
  }, [people]);

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

    // Cache the soft optical glow for each star tint
    const glowCanvases = new Map();
    Object.entries(STAR_TINTS).forEach(([id, tint]) => {
      const glow = document.createElement('canvas');
      glow.width = glow.height = 64;
      const glowCtx = glow.getContext?.('2d');
      if (glowCtx) {
        const gradient = glowCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, tint.stops[0]);
        gradient.addColorStop(.07, tint.stops[1]);
        gradient.addColorStop(.2, tint.stops[2]);
        gradient.addColorStop(.5, tint.stops[3]);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        glowCtx.fillStyle = gradient;
        glowCtx.fillRect(0, 0, 64, 64);
        glowCanvases.set(id, glow);
      }
    });

    function starlight(x, y, size, brightness, tintId = 'pearl') {
      const glow = glowCanvases.get(tintId) || glowCanvases.get('pearl');
      if (!glow) return;
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
        if (!ambient && point.hidden) return;
        const p = position(point, time, reduced);
        if (ambient && !reduced) {
          p.x = (point.x + time / 180000 * (.3 + point.size * .2)) % 1;
          p.y = (point.y + Math.sin(time / 16000 + point.x * 20) * .018 + 1) % 1;
        }
        const shimmer = reduced ? .8 : .72 + Math.sin(time / (1800 + point.x * 2200) + point.y * 80) * .22;
        // Independent slow fades make the distant field breathe without flashing.
        const fade = reduced ? .55 : Math.pow(
          Math.max(0, Math.sin(time / (2200 + point.x * 2800) + point.y * 90)), 2);
        const brightness = ambient ? point.brightness * fade * .75 : shimmer * (point.active === false ? .35 : 1);
        const size = ambient ? 4 + point.size * 3 : point.active === false ? 16 : point.id === current.selfId ? 32 : 26;
        const tint = ambient ? 'pearl' : (point.id === current.selfId ? selfTint : (point.tint || 'pearl'));
        starlight(p.x * width, p.y * height, size, brightness, tint);
        const button = !ambient && starButtons.current.get(point.id);
        if (button) {
          button.style.left = (p.x * 100) + '%';
          button.style.top = (p.y * 100) + '%';
          if (introCard.current?.dataset.starId === point.id) {
            anchorStarCard(introCard.current, button);
          }
          if (noteCard.current?.dataset.starId === point.id) {
            anchorStarCard(noteCard.current, button);
          }
        }
      }

      dust.forEach(point => dot(point, true));

      // Draw gentle solace constellations between nearby connected quiet souls
      if (!reduced && current.points.size > 1) {
        const activePoints = Array.from(current.points.values()).filter(pt => pt.active !== false && !pt.hidden);
        const maxDist = 0.28;
        ctx.save?.();
        ctx.setLineDash?.([2, 5]);
        for (let i = 0; i < activePoints.length; i++) {
          const p1 = position(activePoints[i], time, reduced);
          const x1 = p1.x * width;
          const y1 = p1.y * height;
          for (let j = i + 1; j < activePoints.length; j++) {
            const p2 = position(activePoints[j], time, reduced);
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < maxDist) {
              const x2 = p2.x * width;
              const y2 = p2.y * height;
              const breath = 0.8 + 0.2 * Math.sin(time / 2600 + i * 1.7 + j);
              const alpha = Math.pow(1 - dist / maxDist, 1.6) * 0.16 * breath;
              ctx.strokeStyle = `rgba(200, 225, 255, ${alpha})`;
              ctx.lineWidth = 0.65;
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
            }
          }
        }
        ctx.restore?.();
      }

      current.points.forEach(point => dot(point, false));

      // Resolve each endpoint locally so the flight joins the visible stars on every screen.
      current.shootingStars = current.shootingStars.filter(flight => time - flight.started < (reduced ? 700 : 2200));
      current.shootingStars.forEach(flight => {
        const from = current.points.get(flight.from);
        const to = current.points.get(flight.to);
        if (!from || !to || from.hidden || to.hidden) return;
        const start = position(from, time, reduced);
        const end = position(to, time, reduced);
        const elapsed = time - flight.started;
        if (reduced) {
          starlight(end.x * width, end.y * height, 40, .65 * Math.sin(elapsed / 700 * Math.PI), 'amber');
          return;
        }
        const progress = Math.min(1, elapsed / 1800);
        const at = t => ({
          x: (start.x + (end.x - start.x) * t) * width,
          y: (start.y + (end.y - start.y) * t) * height - Math.sin(t * Math.PI) * Math.min(48, height * .06),
        });
        if (progress < 1) {
          for (let i = 10; i >= 0; i--) {
            const p = at(Math.max(0, progress - i * .012));
            starlight(p.x, p.y, i === 0 ? 24 : 10, (1 - i / 11) * .9, 'amber');
          }
        } else {
          const arrival = (elapsed - 1800) / 400;
          starlight(end.x * width, end.y * height, 28 + arrival * 28, (1 - arrival) * .8, 'amber');
        }
      });

      // Render sparks (warmth and wishes)
      current.sparks = (current.sparks || []).filter(spark => time - spark.started < spark.duration);
      current.sparks.forEach(spark => {
        const progress = (time - spark.started) / spark.duration;
        const alpha = Math.sin(progress * Math.PI) * 0.75;
        const x = spark.x * width + Math.cos(spark.angle) * (spark.dist * width) * progress;
        const y = spark.y * height + Math.sin(spark.angle) * (spark.dist * height) * progress;
        starlight(x, y, 9 * (1 - progress * 0.4), alpha, spark.tint || 'amber');
      });

      current.pulses = current.pulses.filter(pulse => time - pulse.started < (reduced ? 1000 : 12000));
      current.pulses.forEach(pulse => {
        const progress = Math.max(0, (time - pulse.started) / (reduced ? 1000 : 12000));
        // One slow rise and fall, like a distant star catching the light.
        const light = Math.pow(Math.sin(progress * Math.PI), 2);
        const source = current.points.get(pulse.id) || pulse;
        if (source.hidden) return;
        const p = position(source, time, reduced);
        const x = p.x * width;
        const y = p.y * height;
        const pulseTint = pulse.tint || (pulse.id === current.selfId ? selfTint : 'pearl');
        starlight(x, y, reduced ? 28 : 46 + light * 32, light * (reduced ? .35 : .95), pulseTint);
        if (!reduced) {
          // Fine, fading optical rays, with no outline or expanding ring.
          const reach = 8 + light * 22;
          const rayPrefix = (STAR_TINTS[pulseTint] || STAR_TINTS.pearl).ray;
          for (const [dx, dy] of [[reach, 0], [-reach, 0], [0, reach], [0, -reach]]) {
            const ray = ctx.createLinearGradient(x, y, x + dx, y + dy);
            ray.addColorStop(0, rayPrefix + (light * .6) + ')');
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
        current.meteors = meteors;
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
          starlight(x, y, 12, light, 'aurora');
        });
      }
      if (!reduced || current.shootingStars.length || current.pulses.length || (current.sparks && current.sparks.length)) frame = requestAnimationFrame(draw);
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
  }, [selfTint]);

  useEffect(() => {
    const isLocalhost = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    let endpoint = process.env.REACT_APP_SKY_SOCKET_URL;

    // In a live/deployed environment, never use a localhost URL even if baked in from .env
    if (!isLocalhost && endpoint && (endpoint.includes('localhost') || endpoint.includes('127.0.0.1'))) {
      endpoint = '';
    }

    if (!endpoint) {
      if (process.env.NODE_ENV === 'development' || (isLocalhost && process.env.NODE_ENV !== 'test')) {
        endpoint = 'http://localhost:8000';
      } else if (process.env.NODE_ENV === 'production' || (!isLocalhost && process.env.NODE_ENV !== 'test')) {
        endpoint = process.env.REACT_APP_BASE_URL || 'https://ltc-service.onrender.com';
      }
    }

    if (!endpoint) { setStatus('unavailable'); return undefined; }
    const current = scene.current;
    const socket = io(endpoint, { autoConnect: false, transports: ['polling', 'websocket'], forceNew: true, auth: callback => callback({ tint: selfTintRef.current }) });
    socketRef.current = socket;
    socket.on('sky_state', state => {
      current.selfId = state.selfId;
      setIntroId(state.selfId);
      current.points = new Map(state.participants.map(point => [point.id, point]));
      current.pulses = [];
      if (profileRef.current) {
        const selfPoint = current.points.get(state.selfId);
        if (selfPoint) {
          Object.assign(selfPoint, {
            username: profileRef.current.username,
            soul: profileRef.current.username,
            age: profileRef.current.age,
            gender: profileRef.current.gender,
            avatar: profileRef.current.avatar,
            mood: profileRef.current.status || selfPoint.mood || '',
          });
        }
      }
      setPeople([...current.points.values()]);
      setSelected(null);
      setCount(state.activeCount ?? state.participants.length);
      setActivity(state.activity || []);
      setMessages((state.messages || []).filter(m => Date.now() - m.createdAt < CHAT_TTL_MS));
      setSession(null); setInvitation(null); setOutgoing(null);
      setStatus('connected');
      if (pendingProfileRef.current) {
        socket.emit('SET_TEMPORARY_PROFILE', pendingProfileRef.current);
        pendingProfileRef.current = null;
      }
      current.redraw();
    });
    socket.on('PROFILE_CONFIRMED', soulRecord => {
      const selfPoint = current.points.get(current.selfId);
      if (selfPoint) {
        Object.assign(selfPoint, {
          username: soulRecord.username,
          soul: soulRecord.username,
          age: soulRecord.age,
          gender: soulRecord.gender,
          avatar: soulRecord.avatar,
          mood: soulRecord.status,
        });
        setPeople([...current.points.values()]);
      }
    });
    socket.on('SOUL_JOINED', soulRecord => {
      const point = current.points.get(soulRecord.socketId);
      if (point) {
        Object.assign(point, {
          username: soulRecord.username,
          soul: soulRecord.username,
          age: soulRecord.age,
          gender: soulRecord.gender,
          avatar: soulRecord.avatar,
          mood: soulRecord.status,
        });
        setPeople([...current.points.values()]);
      }
    });
    socket.on('chat_message', message => {
      const senderPoint = current.points.get(message.senderId);
      const isSelf = message.senderId === current.selfId || message.soul === current.points.get(current.selfId)?.soul;
      const enriched = {
        ...message,
        username: message.username || (isSelf && profileRef.current?.username) || senderPoint?.username || message.soul,
        gender: message.gender || (isSelf && profileRef.current?.gender) || senderPoint?.gender || null,
        avatar: message.avatar || (isSelf && profileRef.current?.avatar) || senderPoint?.avatar || null,
      };
      setMessages(items => [...items.filter(m => m.id !== message.id && Date.now() - m.createdAt < CHAT_TTL_MS), enriched]);
    });
    socket.on('chat_request', setInvitation);
    socket.on('chat_request_closed', ({ id, reason }) => {
      setInvitation(value => value?.id === id ? null : value);
      setOutgoing(value => value?.id === id ? null : value);
      setFeedback('Chat invitation ' + reason + '.');
    });
    socket.on('chat_started', value => { setSession(value); setSelected(null); setInvitation(null); setOutgoing(null); });
    socket.on('chat_ended', () => { setSession(null); setMessages(items => items.filter(m => !m.sessionId)); setFeedback('The private chat has ended.'); });
    socket.on('presence_updated', point => {
      current.points.set(point.id, point);
      setPeople([...current.points.values()]);
      current.redraw();
    });
    socket.on('presence_joined', point => {
      current.points.set(point.id, point);
      setPeople([...current.points.values()]);
      current.redraw();
    });
    socket.on('sky_activity', entry => setActivity(items => [...items.slice(-29), entry]));
    socket.on('presence_resting', point => {
      current.points.set(point.id, point);
      setPeople([...current.points.values()]);
      current.redraw();
    });
    socket.on('note_updated', ({ id, note, noteExpiresAt }) => {
      const point = current.points.get(id);
      if (!point) return;
      current.points.set(id, { ...point, note, noteExpiresAt });
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
    socket.on('receive_shooting_star', flight => {
      if (!current.points.has(flight.from) || !current.points.has(flight.to)) return;
      current.shootingStars = [...current.shootingStars.slice(-19), { ...flight, started: Date.now() }];
      if (flight.to === current.selfId) setFeedback(soulName(current.points.get(flight.from)) + ' sent you a shooting star.');
      current.redraw();
    });
    socket.on('receive_pulse', point => {
      if (!current.points.has(point.id) || document.hidden) return;
      current.pulses = [...current.pulses.slice(-39), { ...point, started: Date.now() }];
      current.redraw();
    });
    const disconnected = () => {
      setIntroId(null);
      setStatus('reconnecting');
      setMessages([]); setSession(null); setInvitation(null); setOutgoing(null);
      setPeople([]);
      setActivity([]);
      setSelected(null);
      setEditing(false);
      setSaving(false);
      setCount(0);
      current.points.clear();
      current.pulses = [];
      current.sparks = [];
      current.shootingStars = [];
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
      current.sparks = [];
      current.shootingStars = [];
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
    current.pulses = [...current.pulses.slice(-39), { ...point, tint: selfTint, started: Date.now() }];
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

  useLayoutEffect(() => {
    if (!selected || editing || !noteCard.current) return;
    const card = noteCard.current;
    const star = starButtons.current.get(selected);
    const update = () => anchorStarCard(card, star);
    update();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(card);
    window.addEventListener('resize', update);
    return () => { observer?.disconnect(); window.removeEventListener('resize', update); };
  }, [selected, editing, people]);

  useEffect(() => {
    if (!introId) return undefined;
    const place = () => {
      const point = scene.current.points.get(introId);
      const canvas = canvasRef.current;
      if (point && canvas && introCard.current) {
        anchorStarCard(introCard.current, starButtons.current.get(introId));
      }
    };
    place();
    const timeout = setTimeout(() => setIntroId(null), 3000);
    window.addEventListener('resize', place);
    return () => { clearTimeout(timeout); window.removeEventListener('resize', place); };
  }, [introId]);

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

  const selectedPersonRaw = people.find(person => person.id === selected);
  const selectedPerson = selectedPersonRaw && selectedPersonRaw.id === scene.current.selfId && profile
    ? {
        ...selectedPersonRaw,
        username: selectedPersonRaw.username || profile.username,
        age: selectedPersonRaw.age || profile.age,
        gender: selectedPersonRaw.gender || profile.gender,
        avatar: selectedPersonRaw.avatar !== undefined ? selectedPersonRaw.avatar : profile.avatar,
        mood: selectedPersonRaw.mood || profile.status || '',
      }
    : selectedPersonRaw;
  const others = Math.max(0, count - 1);

  return (
    <main className="sky-page" style={{ '--sky-header-color': headerColor }} aria-labelledby="sky-title">
      <div className="sky-daylight" style={{ opacity: daylight }} aria-hidden="true" />
      <canvas className="sky-canvas" ref={canvasRef} onClick={handleSkyClick} aria-hidden="true" />
      <div className="sky-stars" aria-label="Quiet souls">
        {people.map((person, index) => {
          const isSelf = person.id === scene.current.selfId;
          const starTint = isSelf ? selfTint : (person.tint || DEFAULT_TINT);
          return (
            <button
              key={person.id}
              className={
                "sky-star" +
                (person.note ? " sky-star--note" : "") +
                (person.active === false ? " sky-star--resting" : "") +
                ` sky-star--tint-${starTint}`
              }
              ref={node => { if (node) starButtons.current.set(person.id, node); else starButtons.current.delete(person.id); }}
              style={{ left: (person.x * 100) + '%', top: (person.y * 100) + '%' }}
              aria-label={(isSelf ? 'Your star' : 'Quiet soul ' + (index + 1)) + (person.note ? ', read note' : ', no note yet')}
              aria-pressed={selected === person.id}
              onClick={() => { setIntroId(null); setEditing(false); setSelected(value => value === person.id ? null : person.id); }}
            />
          );
        })}
      </div>
      <div className="sky-content">
        <header className="sky-heading" ref={headerRef}>
          <h1 id="sky-title">Sky</h1>
          <a className="sky-home" href="https://letterstocasper.com/" aria-label="Letters to Casper home">
            <img className="sky-logo" src="/ltc-preview.webp" alt="Letters to Casper" />
          </a>
          <div className="sky-banner" style={{ opacity: bannerVisible ? 1 : 0, pointerEvents: 'none' }} aria-hidden={!bannerVisible}>
            <small className="sky-note-hint">Tap a cross-lit star to read a note</small>
            <p className="sky-count" role="status">
              {status === 'connected'
                ? others + (others === 1 ? ' quiet soul is' : ' quiet souls are') + ' looking at the sky with you right now.'
                : status === 'unavailable' ? 'The shared sky is resting for a moment.'
                  : status === 'connecting' ? 'Finding our place in the sky…' : 'Reconnecting to the shared sky…'}
            </p>
          </div>
        <div className="sky-center-celestial" aria-label="Current moon phase">
          <SkyMoon date={new Date(clock)} />
        </div>
        </header>


        {wishMessage && (
          <div className="sky-wish-toast" role="status" aria-live="polite">
            {wishMessage}
          </div>
        )}

        <div className="sky-bottom" ref={dockRef}>
          <SkyChat key={session?.sessionId || 'global'} messages={messages} session={session} connected={status === 'connected'} clock={clock}
            send={(data, done) => command('send_chat', data, done)} leave={() => command('leave_chat', session.sessionId)} />
          <ol className="sky-activity" aria-label="Recent sky activity">
            {activity.filter(item => clock - item.at < 3600000).slice(-3).map(item => (
              <li key={item.id}>{item.soul} {item.action} <span>{clock - item.at < 60000 ? 'just now' : Math.floor((clock - item.at) / 60000) + 'm ago'}</span></li>
            ))}
          </ol>
          <section className="sky-prompt" aria-label="Leave a pulse">
            <p>You don’t have to say a word. Leave a little light.</p>

            <span className="sky-feedback" id="sky-feedback" role="status">
              {remaining > 0 ? 'Another pulse in ' + remaining + 's' : feedback}
            </span>
          </section>
          <footer className="sky-footer">
            <button className="sky-note-action" disabled={status !== 'connected'} onClick={() => {
              setIntroId(null);
              setDraft(scene.current.points.get(scene.current.selfId)?.note || '');
              setNoteError(''); setSelected(null); setEditing(true);
            }}>Leave a little note</button>
            <span className="sky-footer-divider" aria-hidden="true" />
            <MoodPicker value={people.find(p => p.id === scene.current.selfId)?.mood} onChange={changeMood} disabled={status !== 'connected'} />
            <span className="sky-footer-divider" aria-hidden="true" />
            <button className="sky-pulse" onClick={sendPulse} disabled={status !== 'connected' || remaining > 0} aria-describedby="sky-feedback">Pulse</button>
          </footer>
        </div>
      </div>
      {invitation && <section className="sky-note-card sky-invitation" role="dialog" aria-label="Incoming chat request">
        <p>{invitation.soul} requested to chat.</p>
        <button autoFocus onClick={() => command('respond_chat', { id: invitation.id, accept: true })}>Accept</button>
        <button onClick={() => command('respond_chat', { id: invitation.id, accept: false })}>Decline</button>
      </section>}
      {introId && !editing && !selectedPerson && (
        <div ref={introCard} data-star-id={introId} className="sky-note-card sky-note-card--anchored sky-intro" role="status">
          This is you
        </div>
      )}
      {(editing || selectedPerson) && (
        <section key={editing ? 'editor' : 'star-note'} ref={noteCard} data-star-id={editing ? undefined : selected} className={"sky-note-card" + (editing ? "" : " sky-note-card--anchored") + (!editing && selectedPerson?.id === scene.current.selfId ? " sky-note-card--self" : !editing ? " sky-note-card--visitor" : "")} role="dialog" aria-label={editing || selectedPerson?.id === scene.current.selfId ? 'Your sky note' : 'A quiet note'}>
          <button className="sky-note-close" aria-label="Close note" onClick={() => { setEditing(false); setSelected(null); }}>×</button>
          {editing ? (
            <form onSubmit={saveNote}>
              <label htmlFor="sky-note">A little note for the sky</label>
              <textarea
                id="sky-note"
                autoFocus
                rows="2"
                value={draft}
                onChange={event => setDraft([...event.target.value].slice(0, 80).join(''))}
                aria-describedby="sky-note-help"
              />
              <small id="sky-note-help">{[...draft].length}/80 · Public for 1 hour, even after you leave.</small>

              <div className="sky-tint-picker" role="radiogroup" aria-label="Choose your starlight hue">
                <span className="sky-tint-label">Starlight hue:</span>
                <div className="sky-tint-options">
                  {Object.values(STAR_TINTS).map(t => (
                    <button
                      key={t.id}
                      type="button"
                      className={`sky-tint-btn ${selfTint === t.id ? 'sky-tint-btn--selected' : ''}`}
                      style={{ '--swatch-color': t.hex }}
                      onClick={() => selectTint(t.id)}
                      aria-label={t.name}
                      aria-checked={selfTint === t.id}
                      role="radio"
                    />
                  ))}
                </div>
              </div>

              <button type="submit" disabled={saving || status !== 'connected'}>
                {saving ? 'Saving…' : clearExistingNote ? 'Clear note' : 'Save note'}
              </button>
              {noteError && <p role="alert">{noteError}</p>}
            </form>
          ) : (
            <>
              {selectedPerson.id === scene.current.selfId ? (
                <>
                  <div className="sky-star-header">
                    <div className="sky-star-avatar-frame">
                      {selectedPerson.avatar ? (
                        <img src={selectedPerson.avatar} alt={selectedPerson.username || 'Your avatar'} className="sky-star-avatar-img" />
                      ) : (
                        <DefaultAvatarIcon size={48} className="sky-star-avatar-placeholder" />
                      )}
                    </div>
                    <div className="sky-star-info">
                      <strong>
                        {selectedPerson.username
                          ? `${selectedPerson.username}${selectedPerson.age ? `, ${selectedPerson.age}` : ''}`
                          : 'This is you'}
                        {selectedPerson.gender && GENDER_ICONS[selectedPerson.gender] ? (
                          <span className="sky-star-gender" aria-hidden="true">
                            {' ' + GENDER_ICONS[selectedPerson.gender]}
                          </span>
                        ) : null}
                      </strong>
                      {selectedPerson.username && <small className="sky-star-self-badge">This is you</small>}
                      <div className="sky-own-feeling">
                        <span className="sky-feeling-text">is feeling </span>
                        <MoodPicker id="sky-mood-editor" value={selectedPerson.mood} onChange={changeMood} disabled={status !== 'connected'} showEmoji />
                      </div>
                    </div>
                  </div>
                  {selectedPerson.note && <p className="sky-star-note">{selectedPerson.note}</p>}
                </>
              ) : (
                <>
                  <div className="sky-star-header">
                    <div className="sky-star-avatar-frame">
                      {selectedPerson.avatar ? (
                        <img src={selectedPerson.avatar} alt={selectedPerson.username || soulName(selectedPerson)} className="sky-star-avatar-img" />
                      ) : (
                        <DefaultAvatarIcon size={48} className="sky-star-avatar-placeholder" />
                      )}
                    </div>
                    <div className="sky-star-info">
                      <strong>
                        {selectedPerson.username
                          ? `${selectedPerson.username}${selectedPerson.age ? `, ${selectedPerson.age}` : ''}`
                          : soulName(selectedPerson)}
                        {selectedPerson.gender && GENDER_ICONS[selectedPerson.gender] ? (
                          <span className="sky-star-gender" aria-hidden="true">
                            {' ' + GENDER_ICONS[selectedPerson.gender]}
                          </span>
                        ) : null}
                      </strong>
                      <p className="sky-visitor-mood" aria-label={`${selectedPerson.username || soulName(selectedPerson)} is feeling ${selectedPerson.mood || 'peaceful'}`}>
                        is feeling {selectedPerson.mood || 'peaceful'} <span aria-hidden="true">{MOOD_EMOJIS[selectedPerson.mood || 'peaceful'] || '😌'}</span>
                      </p>
                    </div>
                  </div>
                  {selectedPerson.note && <p className="sky-visitor-note">{selectedPerson.note}</p>}
                  <div className="sky-visitor-actions">
                    <button className="sky-request-chat" disabled={selectedPerson.active === false || status !== 'connected' || Boolean(outgoing) || Boolean(session)} onClick={() => command('request_chat', selectedPerson.id, (ok, reason, reply) => {
                      if (ok) { setOutgoing(reply.invitation); setFeedback('Chat request sent.'); }
                    })}>{outgoing?.to === selectedPerson.id ? 'Request sent' : 'Request Chat'}</button>
                    <button type="button" className="sky-shooting-star-btn" disabled={status !== 'connected' || selectedPerson.active === false || clock < shootingUntil} onClick={() => sendShootingStar(selectedPerson)}>Send a shooting star</button>
                  </div>
                </>
              )}
            </>
          )}
        </section>
      )}
      {!profile && (
        <SkyProfileModal onSubmit={handleProfileSubmit} />
      )}
    </main>
  );
}
