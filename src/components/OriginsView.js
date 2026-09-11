import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {render_url, api_key} from '../data/keys';
import '../styles/OriginsView.css';
import {IoArrowBackOutline, IoLocationOutline, IoMailOpenOutline} from 'react-icons/io5';

import logo from '../lotties/ltc_logo_1.webp';

const letterCount = count => `${count.toLocaleString()} ${count === 1 ? 'Letter' : 'Letters'}`;

const originName = origin => {
  const parts = [origin.city, origin.region].filter(value => typeof value === 'string' && value.trim()).map(value => value.trim());
  return parts.filter((value, index) => parts.findIndex(part => part.toLowerCase() === value.toLowerCase()) === index).join(', ') || 'Philippines';
};

const project = ([lon, lat], local) => local
  ? [(lon - 115) * 40, (22 - lat) * 40]
  : [(lon + 180) * 2, (85 - lat) * 2];
const outline = (geometry, local) => {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polygons.map(polygon => polygon.map(ring => ring.map((point, i) => {
    const [x, y] = project(point, local);
    return `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ') + 'Z').join(' ')).join(' ');
};
const countryName = code => {
  try { return new Intl.DisplayNames(['en'], {type: 'region'}).of(code); } catch { return code; }
};

export default function OriginsView({onClose, children}) {
  const [features, setFeatures] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [page, setPage] = useState(0);
  const [selection, setSelection] = useState('');
  const pages = useRef(null);
  const dialog = useRef(null);
  const locationTitle = useRef(null);
  useLayoutEffect(() => {
    const title = locationTitle.current;
    if (!title) return;
    let active = true;
    const fit = () => {
      if (!active) return;
      title.style.fontSize = '14px';
      const available = title.clientWidth;
      if (available > 0 && title.scrollWidth > available) {
        title.style.fontSize = `${Math.floor(14 * available / title.scrollWidth * 100) / 100}px`;
      }
    };
    fit();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    observer?.observe(title.parentElement);
    window.addEventListener('resize', fit);
    document.fonts?.ready.then(fit);
    return () => {active = false; observer?.disconnect(); window.removeEventListener('resize', fit);};
  }, [selection, page]);

  useEffect(() => {
    const focused = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current.querySelector('button').focus();
    const keys = event => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const items = [...dialog.current.querySelectorAll('button, a[href], [tabindex="0"]')].filter(item => !item.closest('[inert]'));
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
      else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
    };
    document.addEventListener('keydown', keys);
    return () => {document.body.style.overflow = overflow; document.removeEventListener('keydown', keys); focused?.focus();};
  }, [onClose]);
  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    Promise.all([
      fetch(`${process.env.PUBLIC_URL || ''}/maps/origins.json`, {signal: controller.signal}),
      fetch(`${render_url}/origins-map`, {signal: controller.signal, headers: {'x-api-key': api_key}}),
    ]).then(async responses => {
      if (responses.some(response => !response.ok)) throw new Error('Unavailable');
      const [map, data] = await Promise.all(responses.map(response => response.json()));
      if (!Array.isArray(map.features) || !Array.isArray(data)) throw new Error('Invalid data');
      if (!controller.signal.aborted) {setFeatures(map.features); setOrigins(data); setStatus('ready');}
    }).catch(error => {if (error.name !== 'AbortError' && !controller.signal.aborted) setStatus('error');});
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => {
    const resize = () => { if (pages.current) pages.current.scrollLeft = pages.current.clientWidth * page; };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [page]);
  const countries = useMemo(() => {
    const totals = {};
    origins.forEach(origin => {
      const key = String(origin.country).toUpperCase();
      totals[key] = (totals[key] || 0) + origin.count;
    });
    return totals;
  }, [origins]);
  const shapes = useMemo(() => features.flatMap(feature => {
    if (feature.properties.code === 'PH_DETAIL' && feature.properties.islandGroups) {
      return ['Luzon', 'Visayas', 'Mindanao'].map(group => ({
        ...feature, properties: {...feature.properties, name: group, islandGroup: group.toLowerCase()},
        path: outline({type: 'MultiPolygon', coordinates: feature.geometry.coordinates.filter((_, i) => feature.properties.islandGroups[i] === group)}, true),
      }));
    }
    return [{...feature, path: outline(feature.geometry, feature.properties.code === 'PH_DETAIL')}];
  }), [features]);
  const localPoints = origins.filter(origin => ['PH', 'PHILIPPINES'].includes(String(origin.country).toUpperCase()) &&
    Number.isFinite(origin.latitude) && Number.isFinite(origin.longitude) && origin.latitude >= 4 && origin.latitude <= 22 && origin.longitude >= 115 && origin.longitude <= 128);
  const go = index => {
    setPage(index); setSelection('');
    pages.current.scrollTo({left: pages.current.clientWidth * index, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  };
  return createPortal(<section id="origins-panel" className="origins-view" role="dialog" aria-modal="true" aria-label="Origins" ref={dialog}>
    <header className="origins-view__header">
      <div className="origins-view__branding"><img src={logo} alt="Letters to Casper" /></div>
      <button type="button" onClick={onClose} aria-label="Back to letters" className="origins-view__back"><IoArrowBackOutline aria-hidden="true" /></button>

      <div className="origins-view__heading">
        <span>Every letter begins somewhere</span>
      </div>
    </header>
    <main className="origins-view__content">
      <nav className="origins-view__tabs" aria-label="Choose a map">{['Philippines', 'Around the world'].map((label, i) => <button type="button" key={label} onClick={() => go(i)} aria-pressed={page === i}>{label}</button>)}</nav>
      <p className="origins-view__intro">From familiar islands to places far away. Tap to explore where letters begin.</p>
      <div className={`origins-view__selection${selection ? ' has-selection' : ''}`} role="status" aria-live="polite" aria-atomic="true">
        <span className="origins-view__selection-icon" aria-hidden="true"><IoLocationOutline /></span>
        <div className="origins-view__selection-copy">
          <small>{selection ? 'Letters from' : 'Discover an origin'}</small>
          <strong ref={locationTitle}>{selection ? selection.name : page === 0 ? 'Where in the Philippines?' : 'Where in the world?'}</strong>
          {!selection && <span>{page === 0 ? 'Tap a blue dot to explore its letters.' : 'Tap a blue country to explore its letters.'}</span>}
        </div>
        {selection && <span className="origins-view__selection-count"><IoMailOpenOutline aria-hidden="true" />{letterCount(selection.count)}</span>}
      </div>
      {status === 'ready' && <div className="origins-view__map-summary">
        <span>{page === 0 ? `${localPoints.length} ${localPoints.length === 1 ? 'city location' : 'city locations'}` : `${Object.keys(countries).length} ${Object.keys(countries).length === 1 ? 'country' : 'countries'}`}</span>
        <span><i aria-hidden="true" />{page === 0 ? 'Blue dots mark letter origins' : 'Deeper blue means more letters'}</span>
      </div>}
      {status === 'ready' && !origins.length && <p>No published letter locations yet.</p>}
      {status === 'loading' && <p role="status">Gathering letter origins…</p>}
      {status === 'error' && <div role="alert">The map couldn’t load. <button type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button></div>}
      <div className="origins-view__pages" ref={pages} onScroll={event => {setPage(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth)); setSelection('');}}>
        {[true, false].map((local, index) => <section className="origins-view__page" key={index} aria-label={local ? 'Philippines map' : 'World map'} inert={page !== index ? '' : undefined}>
          <svg viewBox={local ? '0 0 520 720' : '0 0 720 310'} className={`origins-map${local ? ' is-local' : ''}`} role="group" aria-label={local ? 'Approximate Philippine city origins' : 'Countries with published letters'}>
            {shapes.filter(shape => local ? shape.properties.code === 'PH_DETAIL' : shape.properties.code !== 'PH_DETAIL').map(shape => {
              const count = countries[shape.properties.code] || countries[shape.properties.name.toUpperCase()] || 0;
              const label = `${shape.properties.name}: ${letterCount(count)}`;
              return <path key={shape.properties.code + shape.properties.name} d={shape.path} className={local ? `island-group--${shape.properties.islandGroup || 'luzon'}` : count ? 'has-letters' : ''} fillRule="evenodd"
                style={!local && count ? {fillOpacity: Math.min(1, 0.35 + Math.log10(count + 1) / 5)} : undefined}
                onClick={() => !local && setSelection({name: shape.properties.name, count})} tabIndex={!local && count ? 0 : undefined} role={!local && count ? 'button' : undefined}
                aria-label={!local && count ? label : undefined} onKeyDown={event => {if (!local && ['Enter', ' '].includes(event.key)) {event.preventDefault(); setSelection({name: shape.properties.name, count});}}}><title>{local ? shape.properties.name : label}</title></path>;
            })}
            {local && localPoints.map((origin, i) => {
              const [cx, cy] = project([origin.longitude, origin.latitude], true);
              const label = `${originName(origin)}: ${letterCount(origin.count)}`;
              return <g key={i} className="origins-map__point" role="button" tabIndex={0} aria-label={label} onClick={() => setSelection({name: originName(origin), count: origin.count})} onKeyDown={event => {if (['Enter', ' '].includes(event.key)) {event.preventDefault(); setSelection({name: originName(origin), count: origin.count});}}}>
                <title>{label}</title><circle cx={cx} cy={cy} r="14" className="origins-map__hit"/><circle cx={cx} cy={cy} r="4"/></g>;
            })}
          </svg>
          {local && <div className="origins-view__island-legend" aria-label="Philippine island group colors">
            {['Luzon', 'Visayas', 'Mindanao'].map(group => <span key={group}><i className={`island-swatch--${group.toLowerCase()}`} aria-hidden="true" />{group}</span>)}
          </div>}
      <p className="origins-view__note">Locations are approximate.</p>

        </section>)}
      </div>
      <div className="origins-view__rankings">{children}</div>
      {status === 'ready' && page === 1 && <details className="origins-view__country-list"><summary>All country totals</summary><ul>{Object.entries(countries).sort((a,b) => b[1]-a[1]).map(([code,count]) => <li key={code}>{countryName(code)} <strong>{letterCount(count)}</strong></li>)}</ul></details>}
      <a className="origins-view__credit" href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noreferrer">Map outlines: Natural Earth</a>
    </main>
  </section>, document.body);
}
