// Weather detection and obscuration state resolver via Open-Meteo

export const WEATHER_CACHE_KEY_PREFIX = 'sky_weather_cache_';
export const WEATHER_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function parseWeatherCondition({
  weatherCode = 0,
  cloudCover = 0,
  precipitation = 0,
  temperature = null,
  isDay = 1,
} = {}) {
  let condition = 'clear';
  let obscuration = 'none';
  let statusText = 'Clear sky in your local area';
  let summary = isDay ? 'Clear & sunny' : 'Clear skies';

  if (weatherCode >= 95) {
    condition = 'thunderstorm';
    obscuration = 'rain';
    statusText = 'Obscured by storm clouds in your local sky';
    summary = 'Thunderstorm';
  } else if (
    precipitation > 0 ||
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82)
  ) {
    condition = 'rain';
    obscuration = 'rain';
    statusText = 'Obscured by rain in your local sky';
    summary = precipitation > 2.5 ? 'Heavy rain' : 'Rain';
  } else if (
    (weatherCode >= 71 && weatherCode <= 77) ||
    weatherCode === 85 ||
    weatherCode === 86
  ) {
    condition = 'snow';
    obscuration = 'clouds';
    statusText = 'Obscured by snowfall in your local sky';
    summary = 'Snow';
  } else if (weatherCode === 45 || weatherCode === 48) {
    condition = 'fog';
    obscuration = 'fog';
    statusText = 'Softly obscured by mist in your local sky';
    summary = 'Fog & mist';
  } else if (cloudCover >= 75 || weatherCode === 3) {
    condition = 'overcast';
    obscuration = 'clouds';
    statusText = 'Hidden behind clouds in your local sky';
    summary = 'Overcast';
  } else if (cloudCover >= 25 || weatherCode === 2) {
    condition = 'partly_cloudy';
    obscuration = 'partly';
    statusText = isDay
      ? 'Partly cloudy · Sun peeking through'
      : 'Partly cloudy · Moon peeking through';
    summary = 'Partly cloudy';
  }

  return {
    condition,
    obscuration,
    statusText,
    summary,
    cloudCover: Math.round(cloudCover),
    precipitation: Math.round(precipitation * 10) / 10,
    temperature: temperature !== null ? Math.round(temperature) : null,
    isDay: Boolean(isDay),
  };
}

export async function fetchLocalWeather(lat = 14.5995, lon = 120.9842) {
  const roundedLat = Math.round(lat * 100) / 100;
  const roundedLon = Math.round(lon * 100) / 100;
  const cacheKey = `${WEATHER_CACHE_KEY_PREFIX}${roundedLat}_${roundedLon}`;

  // Check cache first
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Date.now() - parsed.timestamp < WEATHER_CACHE_TTL_MS) {
        return parsed.data;
      }
    }
  } catch (_) {}

  // Safe fallback if offline or request fails
  const fallback = parseWeatherCondition({
    weatherCode: 0,
    cloudCover: 0,
    precipitation: 0,
    temperature: null,
    isDay: 1,
  });

  if (typeof fetch === 'undefined') {
    return fallback;
  }

  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${roundedLat}&longitude=${roundedLon}&current=weather_code,cloud_cover,precipitation,rain,is_day,temperature_2m`;
    const response = await fetch(url, {
      signal: controller ? controller.signal : undefined,
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!response.ok) {
      return fallback;
    }

    const data = await response.json();
    const current = data?.current;
    if (!current) {
      return fallback;
    }

    const parsedWeather = parseWeatherCondition({
      weatherCode: current.weather_code ?? 0,
      cloudCover: current.cloud_cover ?? 0,
      precipitation: current.precipitation ?? 0,
      temperature: current.temperature_2m ?? null,
      isDay: current.is_day ?? 1,
    });

    try {
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({ timestamp: Date.now(), data: parsedWeather })
      );
    } catch (_) {}

    return parsedWeather;
  } catch (_) {
    return fallback;
  }
}

