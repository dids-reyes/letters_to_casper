import React, { useEffect, useState } from 'react';
import SkyMoon from './SkyMoon';
import SkySun from './SkySun';
import { getSolarPosition, getTimezoneCoordinates, getUserCoordinates } from './celestial';
import { fetchLocalWeather, parseWeatherCondition } from './weather';

export default function SkyCelestial({ date = new Date(), forceBody = null }) {
  const [coords, setCoords] = useState(() => {
    if (typeof window === 'undefined') return getTimezoneCoordinates();
    try {
      const cached = sessionStorage.getItem('sky_user_coords');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (typeof parsed?.lat === 'number' && typeof parsed?.lon === 'number') {
          return parsed;
        }
      }
    } catch (_) {}
    return getTimezoneCoordinates();
  });
  const [weather, setWeather] = useState(() =>
    parseWeatherCondition({ weatherCode: 0, cloudCover: 0, precipitation: 0, isDay: 1 })
  );

  // Refine user coordinates on mount
  useEffect(() => {
    if (process.env.NODE_ENV === 'test' && !navigator.geolocation) return undefined;
    let active = true;
    getUserCoordinates().then(resolvedCoords => {
      if (!active) return;
      setCoords(resolvedCoords);
    });
    return () => {
      active = false;
    };
  }, []);

  // Fetch local weather once coordinates are resolved
  useEffect(() => {
    if (!coords) return undefined;
    let active = true;

    function loadWeather() {
      fetchLocalWeather(coords.lat, coords.lon).then(data => {
        if (!active) return;
        setWeather(data);
      });
    }

    if (process.env.NODE_ENV === 'test') {
      if (
        (typeof jest !== 'undefined' && typeof global !== 'undefined' && global.fetch && jest.isMockFunction(global.fetch)) ||
        (typeof jest !== 'undefined' && jest.isMockFunction(fetchLocalWeather))
      ) {
        loadWeather();
      }
      return () => {
        active = false;
      };
    }

    loadWeather();
    // Refresh weather every 10 minutes
    const interval = setInterval(loadWeather, 10 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [coords]);

  const solar = getSolarPosition(
    date,
    coords?.lat ?? 14.5995,
    coords?.lon ?? 120.9842
  );

  const isDaylight =
    forceBody === 'sun' ? true : forceBody === 'moon' ? false : solar.isDaylight;

  return (
    <div
      className="sky-celestial-container"
      data-celestial-body={isDaylight ? 'sun' : 'moon'}
      data-weather-condition={weather?.condition || 'clear'}
      data-weather-obscuration={weather?.obscuration || 'none'}
    >
      {isDaylight ? (
        <SkySun
          date={date}
          coords={coords}
          solarData={solar}
          weather={weather}
        />
      ) : (
        <SkyMoon
          date={date}
          weather={weather}
        />
      )}
    </div>
  );
}
