import {
  parseWeatherCondition,
  fetchLocalWeather,
  WEATHER_CACHE_KEY_PREFIX,
} from './weather';

describe('Weather parser and condition mapping', () => {
  test('correctly maps clear sky', () => {
    const result = parseWeatherCondition({ weatherCode: 0, cloudCover: 10, isDay: 1 });
    expect(result.condition).toBe('clear');
    expect(result.obscuration).toBe('none');
    expect(result.statusText).toBe('Clear sky in your local area');
  });

  test('correctly maps partly cloudy with peeking indicator', () => {
    const dayResult = parseWeatherCondition({ weatherCode: 2, cloudCover: 40, isDay: 1 });
    expect(dayResult.condition).toBe('partly_cloudy');
    expect(dayResult.obscuration).toBe('partly');
    expect(dayResult.statusText).toMatch(/Sun peeking through/i);

    const nightResult = parseWeatherCondition({ weatherCode: 2, cloudCover: 50, isDay: 0 });
    expect(nightResult.statusText).toMatch(/Moon peeking through/i);
  });

  test('correctly maps overcast sky with hidden behind clouds indicator', () => {
    const result = parseWeatherCondition({ weatherCode: 3, cloudCover: 90, isDay: 1 });
    expect(result.condition).toBe('overcast');
    expect(result.obscuration).toBe('clouds');
    expect(result.statusText).toBe('Hidden behind clouds in your local sky');
  });

  test('correctly maps rainy weather with obscured by rain indicator', () => {
    const result = parseWeatherCondition({ weatherCode: 61, precipitation: 1.5, isDay: 1 });
    expect(result.condition).toBe('rain');
    expect(result.obscuration).toBe('rain');
    expect(result.statusText).toBe('Obscured by rain in your local sky');
  });

  test('correctly maps thunderstorm weather', () => {
    const result = parseWeatherCondition({ weatherCode: 95, precipitation: 5.0, isDay: 1 });
    expect(result.condition).toBe('thunderstorm');
    expect(result.obscuration).toBe('rain');
    expect(result.statusText).toBe('Obscured by storm clouds in your local sky');
  });

  test('correctly maps fog and mist', () => {
    const result = parseWeatherCondition({ weatherCode: 45, cloudCover: 80, isDay: 1 });
    expect(result.condition).toBe('fog');
    expect(result.obscuration).toBe('fog');
    expect(result.statusText).toBe('Softly obscured by mist in your local sky');
  });
});

describe('fetchLocalWeather caching and fallback', () => {
  beforeEach(() => {
    sessionStorage.clear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  test('fetches from Open-Meteo, parses, and caches data', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        current: {
          weather_code: 3,
          cloud_cover: 85,
          precipitation: 0,
          temperature_2m: 27.2,
          is_day: 1,
        },
      }),
    });

    const weather = await fetchLocalWeather(14.6, 120.98);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(weather.condition).toBe('overcast');
    expect(weather.statusText).toBe('Hidden behind clouds in your local sky');
    expect(weather.temperature).toBe(27);

    // Second call should return cached data without extra fetch
    const cachedWeather = await fetchLocalWeather(14.6, 120.98);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(cachedWeather.condition).toBe('overcast');
  });

  test('gracefully returns clear sky fallback on network error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    const weather = await fetchLocalWeather(14.6, 120.98);
    expect(weather.condition).toBe('clear');
    expect(weather.obscuration).toBe('none');
    expect(weather.statusText).toBe('Clear sky in your local area');
  });
});
