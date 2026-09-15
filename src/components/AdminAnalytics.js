import React, {useContext, useEffect, useState} from 'react';
import {AuthContext} from '../AuthContext';
import {render_base_url as render_url, api_key} from '../data/keys';
import AdminOriginsMap from './AdminOriginsMap';
import {
  IoBarChartOutline, IoCheckmarkCircleOutline, IoEyeOutline, IoFlameOutline,
  IoHeartOutline, IoHourglassOutline, IoImageOutline, IoLinkOutline, IoLocationOutline,
  IoMailOutline, IoStarOutline,
} from 'react-icons/io5';

const STAT_CARDS = [
  {key: 'all', label: 'Total letters', icon: IoMailOutline},
  {key: 'approved', label: 'Published', icon: IoCheckmarkCircleOutline},
  {key: 'pending', label: 'Pending review', icon: IoHourglassOutline},
  {key: 'burned', label: 'Burned', icon: IoFlameOutline},
  {key: 'featured', label: 'Featured', icon: IoStarOutline},
  {key: 'withPhoto', label: 'With a photo', icon: IoImageOutline},
];

const REACTION_LABELS = {
  love: 'Love', felt: 'Felt this', sad: 'Sad', courage: 'Courage', notAlone: 'Not alone',
};

export default function AdminAnalytics() {
  const {sessionToken} = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    fetch(`${render_url}/api/messages/analytics-summary`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {'x-api-key': api_key, Authorization: `Bearer ${sessionToken}`},
    }).then(async response => {
      if (!response.ok) throw new Error('Failed to load analytics');
      const json = await response.json();
      if (!controller.signal.aborted) {setData(json); setStatus('ready');}
    }).catch(error => {if (error.name !== 'AbortError' && !controller.signal.aborted) setStatus('error');});
    return () => controller.abort();
  }, [sessionToken, attempt]);

  const trend = data?.trend || [];
  const topCities = data?.topCities || [];
  const totals = data?.totals || {};
  const reads = data?.reads || {};
  const linkCopies = data?.linkCopies || {};
  const reactions = data?.reactions || {};
  const maxTrend = Math.max(1, ...trend.map(day => day.count));

  return (
    <div className="admin-analytics">
      <AdminOriginsMap />

      {status === 'loading' && <p className="admin-portal-status">Loading analytics&hellip;</p>}
      {status === 'error' && (
        <p className="admin-portal-status is-error">
          Couldn&rsquo;t load analytics.{' '}
          <button type="button" className="admin-analytics__retry" onClick={() => setAttempt(value => value + 1)}>Try again</button>
        </p>
      )}

      {status === 'ready' && data && (
        <>
          <div className="admin-analytics__stats">
            {STAT_CARDS.map(({key, label, icon: Icon}) => (
              <div className="admin-analytics__stat" key={key}>
                <Icon aria-hidden="true" />
                <div>
                  <strong>{(totals[key] || 0).toLocaleString()}</strong>
                  <span>{label}</span>
                </div>
              </div>
            ))}
            <div className="admin-analytics__stat">
              <IoEyeOutline aria-hidden="true" />
              <div>
                <strong>{(reads.total || 0).toLocaleString()}</strong>
                <span>Total reads &middot; {reads.average || 0} avg</span>
              </div>
            </div>
            <div className="admin-analytics__stat">
              <IoLinkOutline aria-hidden="true" />
              <div>
                <strong>{(linkCopies.total || 0).toLocaleString()}</strong>
                <span>Link copies</span>
              </div>
            </div>
          </div>

          <div className="admin-analytics__row">
            <section className="admin-analytics__panel">
              <h3><IoBarChartOutline aria-hidden="true" /> Letters, last 14 days</h3>
              {trend.length ? (
                <div className="admin-analytics__trend" role="img" aria-label="Letters received per day over the last 14 days">
                  {trend.map(day => (
                    <div key={day.date} className="admin-analytics__bar" title={`${day.date}: ${day.count}`}>
                      <span style={{height: `${Math.max(6, (day.count / maxTrend) * 100)}%`}} />
                    </div>
                  ))}
                </div>
              ) : <p className="admin-analytics__empty">No letters in the last two weeks.</p>}
            </section>

            <section className="admin-analytics__panel">
              <h3><IoLocationOutline aria-hidden="true" /> Top cities</h3>
              {topCities.length ? (
                <ul className="admin-analytics__list">
                  {topCities.map(city => (
                    <li key={`${city.city}-${city.region}`}>
                      <span>{city.city}{city.region ? `, ${city.region}` : ''}</span>
                      <strong>{city.count.toLocaleString()}</strong>
                    </li>
                  ))}
                </ul>
              ) : <p className="admin-analytics__empty">No city data yet.</p>}
            </section>

            <section className="admin-analytics__panel">
              <h3><IoHeartOutline aria-hidden="true" /> Reactions</h3>
              <ul className="admin-analytics__list">
                {Object.entries(REACTION_LABELS).map(([key, label]) => (
                  <li key={key}>
                    <span>{label}</span>
                    <strong>{(reactions[key] || 0).toLocaleString()}</strong>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
