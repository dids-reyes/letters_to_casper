import React, {useEffect, useMemo, useState} from 'react';
import {render_base_url as render_url, api_key} from '../data/keys';
import {outline, countryName, letterCount} from '../utils/mapGeometry';
import {IoEarthOutline, IoLocationOutline} from 'react-icons/io5';

// The admin dashboard's "global map" widget. It draws from the exact same
// static GeoJSON and /origins-map endpoint as the public OriginsView map
// (src/components/OriginsView.js), just restyled dark for the admin theme
// and rendered inline instead of as a full-screen dialog.
export default function AdminOriginsMap() {
  const [features, setFeatures] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    Promise.all([
      fetch(`${process.env.PUBLIC_URL || ''}/maps/origins.json`, {signal: controller.signal}),
      fetch(`${render_url}/api/messages/origins-map`, {signal: controller.signal, headers: {'x-api-key': api_key}}),
    ]).then(async responses => {
      if (responses.some(response => !response.ok)) throw new Error('Unavailable');
      const [map, data] = await Promise.all(responses.map(response => response.json()));
      if (!Array.isArray(map.features) || !Array.isArray(data)) throw new Error('Invalid data');
      if (!controller.signal.aborted) {setFeatures(map.features); setOrigins(data); setStatus('ready');}
    }).catch(error => {if (error.name !== 'AbortError' && !controller.signal.aborted) setStatus('error');});
    return () => controller.abort();
  }, [attempt]);

  const countries = useMemo(() => {
    const totals = {};
    origins.forEach(origin => {
      const key = String(origin.country).toUpperCase();
      totals[key] = (totals[key] || 0) + origin.count;
    });
    return totals;
  }, [origins]);

  const shapes = useMemo(() => features
    .filter(feature => feature.properties.code !== 'PH_DETAIL')
    .map(feature => ({...feature, path: outline(feature.geometry, false)})),
    [features]);

  const ranked = useMemo(() => Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 6), [countries]);
  const totalLetters = origins.reduce((sum, origin) => sum + origin.count, 0);

  return (
    <section className="admin-map">
      <header className="admin-map__header">
        <div>
          <span><IoEarthOutline /> Global reach</span>
          <h2>Where letters come from</h2>
        </div>
        {status === 'ready' && (
          <div className="admin-map__summary">
            <strong>{Object.keys(countries).length}</strong>
            <span>{Object.keys(countries).length === 1 ? 'country' : 'countries'} &middot; {letterCount(totalLetters)}</span>
          </div>
        )}
      </header>

      {status === 'loading' && <p className="admin-map__status" role="status">Loading letter origins&hellip;</p>}
      {status === 'error' && (
        <div className="admin-map__status is-error" role="alert">
          The map couldn&rsquo;t load.
          <button type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button>
        </div>
      )}
      {status === 'ready' && !origins.length && <p className="admin-map__status">No published letter locations yet.</p>}

      {status === 'ready' && origins.length > 0 && (
        <div className="admin-map__body">
          <svg viewBox="0 0 720 310" className="admin-map__svg" role="group" aria-label="Countries with published letters">
            {shapes.map(shape => {
              const count = countries[shape.properties.code] || countries[shape.properties.name.toUpperCase()] || 0;
              const label = `${shape.properties.name}: ${letterCount(count)}`;
              return (
                <path
                  key={shape.properties.code + shape.properties.name}
                  d={shape.path}
                  fillRule="evenodd"
                  className={count ? 'has-letters' : ''}
                  style={count ? {fillOpacity: Math.min(1, 0.35 + Math.log10(count + 1) / 5)} : undefined}
                  tabIndex={count ? 0 : undefined}
                  role={count ? 'button' : undefined}
                  aria-label={count ? label : undefined}
                  onClick={() => count && setSelected({name: shape.properties.name, count})}
                  onKeyDown={event => {if (count && ['Enter', ' '].includes(event.key)) {event.preventDefault(); setSelected({name: shape.properties.name, count});}}}
                >
                  <title>{label}</title>
                </path>
              );
            })}
          </svg>
          <div className="admin-map__selection" role="status" aria-live="polite">
            <IoLocationOutline aria-hidden="true" />
            {selected
              ? <span><strong>{selected.name}</strong> &middot; {letterCount(selected.count)}</span>
              : <span>Tap a country to see its letter count</span>}
          </div>
          {ranked.length > 0 && (
            <ol className="admin-map__ranking">
              {ranked.map(([code, count]) => (
                <li key={code}>
                  <span>{countryName(code) || code}</span>
                  <strong>{count.toLocaleString()}</strong>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
}
