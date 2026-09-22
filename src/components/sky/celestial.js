// NOAA Astronomical Solar Calculations & Coordinate Resolver

export const TIMEZONE_COORDINATES = {
  'Asia/Manila': { lat: 14.5995, lon: 120.9842 },
  'Asia/Tokyo': { lat: 35.6762, lon: 139.6503 },
  'Asia/Singapore': { lat: 1.3521, lon: 103.8198 },
  'Asia/Hong_Kong': { lat: 22.3193, lon: 114.1694 },
  'Asia/Seoul': { lat: 37.5665, lon: 126.9780 },
  'Asia/Bangkok': { lat: 13.7563, lon: 100.5018 },
  'Asia/Jakarta': { lat: -6.2088, lon: 106.8456 },
  'Asia/Kolkata': { lat: 28.6139, lon: 77.2090 },
  'Asia/Dubai': { lat: 25.2048, lon: 55.2708 },
  'America/New_York': { lat: 40.7128, lon: -74.0060 },
  'America/Los_Angeles': { lat: 34.0522, lon: -118.2437 },
  'America/Chicago': { lat: 41.8781, lon: -87.6298 },
  'America/Denver': { lat: 39.7392, lon: -104.9903 },
  'America/Phoenix': { lat: 33.4484, lon: -112.0740 },
  'America/Toronto': { lat: 43.6532, lon: -79.3832 },
  'America/Vancouver': { lat: 49.2827, lon: -123.1207 },
  'America/Mexico_City': { lat: 19.4326, lon: -99.1332 },
  'America/Sao_Paulo': { lat: -23.5505, lon: -46.6333 },
  'America/Buenos_Aires': { lat: -34.6037, lon: -58.3816 },
  'Europe/London': { lat: 51.5074, lon: -0.1278 },
  'Europe/Paris': { lat: 48.8566, lon: 2.3522 },
  'Europe/Berlin': { lat: 52.5200, lon: 13.4050 },
  'Europe/Rome': { lat: 41.9028, lon: 12.4964 },
  'Europe/Madrid': { lat: 40.4168, lon: -3.7038 },
  'Europe/Amsterdam': { lat: 52.3676, lon: 4.9041 },
  'Europe/Stockholm': { lat: 59.3293, lon: 18.0686 },
  'Europe/Athens': { lat: 37.9838, lon: 23.7275 },
  'Australia/Sydney': { lat: -33.8688, lon: 151.2093 },
  'Australia/Melbourne': { lat: -37.8136, lon: 144.9631 },
  'Australia/Perth': { lat: -31.9505, lon: 115.8605 },
  'Pacific/Auckland': { lat: -36.8485, lon: 174.7633 },
  'Pacific/Honolulu': { lat: 21.3069, lon: -157.8583 },
  'Africa/Cairo': { lat: 30.0444, lon: 31.2357 },
  'Africa/Johannesburg': { lat: -26.2041, lon: 28.0473 },
  'Africa/Nairobi': { lat: -1.2921, lon: 36.8219 },
  'Africa/Lagos': { lat: 6.5244, lon: 3.3792 },
};

export function getTimezoneCoordinates(timezone) {
  const tz = timezone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : null);
  if (tz && Object.prototype.hasOwnProperty.call(TIMEZONE_COORDINATES, tz)) {
    return TIMEZONE_COORDINATES[tz];
  }
  // Fallback: estimate longitude from UTC offset; default to temperate latitude 25°N
  try {
    const offsetHours = -new Date().getTimezoneOffset() / 60;
    const lon = Math.max(-180, Math.min(180, offsetHours * 15));
    return { lat: 25.0, lon };
  } catch (_) {
    return { lat: 14.6, lon: 120.98 };
  }
}

export function getUserCoordinates() {
  if (typeof window === 'undefined') {
    return Promise.resolve(getTimezoneCoordinates());
  }

  try {
    const cached = sessionStorage.getItem('sky_user_coords');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (typeof parsed?.lat === 'number' && typeof parsed?.lon === 'number') {
        return Promise.resolve(parsed);
      }
    }
  } catch (_) {}

  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    return new Promise(resolve => {
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          const fallback = getTimezoneCoordinates();
          resolve(fallback);
        }
      }, 3000);

      navigator.geolocation.getCurrentPosition(
        position => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timer);
          const coords = {
            lat: Math.round(position.coords.latitude * 10000) / 10000,
            lon: Math.round(position.coords.longitude * 10000) / 10000,
          };
          try {
            sessionStorage.setItem('sky_user_coords', JSON.stringify(coords));
          } catch (_) {}
          resolve(coords);
        },
        () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timer);
          const fallback = getTimezoneCoordinates();
          resolve(fallback);
        },
        { timeout: 3000, maximumAge: 600000 }
      );
    });
  }

  return Promise.resolve(getTimezoneCoordinates());
}

export function getSolarPosition(date = new Date(), lat = 14.6, lon = 120.98) {
  const d = date instanceof Date ? date : new Date(date);
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  const startOfYear = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((d.getTime() - startOfYear.getTime()) / 86400000) + 1;

  // Fractional year in radians
  const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1 + (d.getUTCHours() - 12) / 24);

  // Equation of time in minutes
  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  // Solar declination in radians
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  // Zenith angle for sunrise/sunset (90.833° accounts for atmospheric refraction & solar semidiameter)
  const zenith = 90.833 * rad;
  const latRad = lat * rad;

  // Hour angle for sunrise/sunset
  const cosHa =
    (Math.cos(zenith) / (Math.cos(latRad) * Math.cos(decl))) -
    Math.tan(latRad) * Math.tan(decl);

  let sunriseUTCMinutes = null;
  let sunsetUTCMinutes = null;

  if (cosHa < -1) {
    // Midnight sun (polar day)
    sunriseUTCMinutes = 0;
    sunsetUTCMinutes = 1440;
  } else if (cosHa <= 1) {
    const haDeg = Math.acos(cosHa) * deg;
    sunriseUTCMinutes = 720 - 4 * (lon + haDeg) - eqtime;
    sunsetUTCMinutes = 720 - 4 * (lon - haDeg) - eqtime;
  }

  // True solar time in minutes [0, 1440)
  const timeOffset = eqtime + 4 * lon;
  const currentUTCMinutes = d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60;
  const tst = (((currentUTCMinutes + timeOffset) % 1440) + 1440) % 1440;

  // Solar hour angle in degrees
  let haDeg = tst / 4 - 180;
  if (haDeg < -180) haDeg += 360;
  const haRad = haDeg * rad;

  // Solar elevation (altitude) in degrees
  const sinElev =
    Math.sin(latRad) * Math.sin(decl) + Math.cos(latRad) * Math.cos(decl) * Math.cos(haRad);
  const elevation = Math.asin(Math.max(-1, Math.min(1, sinElev))) * deg;

  // The sun is above the horizon when elevation > -0.833°
  const isDaylight = elevation > -0.833;

  // Calculate arc progress (0.0 at sunrise, 0.5 at solar noon, 1.0 at sunset)
  let progress = 0.5;
  if (sunriseUTCMinutes !== null && sunsetUTCMinutes !== null) {
    const sunriseMinutesLocal = (sunriseUTCMinutes - d.getTimezoneOffset() + 1440) % 1440;
    const sunsetMinutesLocal = (sunsetUTCMinutes - d.getTimezoneOffset() + 1440) % 1440;
    const currentLocalMinutes = d.getHours() * 60 + d.getMinutes();

    if (sunsetMinutesLocal > sunriseMinutesLocal) {
      const dayDuration = sunsetMinutesLocal - sunriseMinutesLocal;
      progress = Math.max(0, Math.min(1, (currentLocalMinutes - sunriseMinutesLocal) / dayDuration));
    } else {
      progress = isDaylight ? 0.5 : 0;
    }
  }

  // Format sunrise & sunset local times
  function formatMinutes(utcMins) {
    if (utcMins === null) return 'N/A';
    const localMins = Math.round((((utcMins - d.getTimezoneOffset()) % 1440) + 1440) % 1440);
    const hrs = Math.floor(localMins / 60);
    const mins = localMins % 60;
    const h12 = hrs % 12 || 12;
    const ampm = hrs < 12 ? 'AM' : 'PM';
    return `${h12}:${String(mins).padStart(2, '0')} ${ampm}`;
  }

  const sunriseText = formatMinutes(sunriseUTCMinutes);
  const sunsetText = formatMinutes(sunsetUTCMinutes);

  // Position / trajectory description along the daytime arc
  let position = '';
  if (!isDaylight) {
    position = 'Resting below the horizon in nighttime twilight.';
  } else if (progress < 0.15) {
    position = 'Rising low in the eastern sky at dawn.';
  } else if (progress < 0.4) {
    position = 'Ascending through the morning sky.';
  } else if (progress < 0.6) {
    position = 'High in the sky near solar zenith at midday.';
  } else if (progress < 0.85) {
    position = 'Descending through the afternoon sky.';
  } else {
    position = 'Setting low in the western sky at dusk.';
  }

  const elevationDisplay = Math.round(elevation);

  return {
    isDaylight,
    elevation: elevationDisplay,
    elevationExact: Math.round(elevation * 10) / 10,
    progress: Math.round(progress * 100) / 100,
    position,
    sunriseText,
    sunsetText,
    formattedDate: new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(d),
    skyNote: 'Accurate based on your local sky today. Look up at the sky. We are all under the same sun.',
  };
}

