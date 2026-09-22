import { getSolarPosition, getTimezoneCoordinates, getUserCoordinates } from './celestial';

describe('NOAA Astronomical Solar Calculations', () => {
  test('calculates daytime solar position and positive elevation at noon', () => {
    // 2026-09-22 12:00 in Manila (+8 UTC) is 04:00 UTC
    const noonDate = new Date(Date.UTC(2026, 8, 22, 4, 0, 0));
    const solar = getSolarPosition(noonDate, 14.5995, 120.9842);

    expect(solar.isDaylight).toBe(true);
    expect(solar.elevation).toBeGreaterThan(60);
    expect(solar.sunriseText).toMatch(/AM/);
    expect(solar.sunsetText).toMatch(/PM/);
    expect(solar.position).toMatch(/zenith|midday/i);
    expect(solar.progress).toBeGreaterThan(0.4);
    expect(solar.progress).toBeLessThan(0.6);
  });

  test('calculates nighttime solar position and negative elevation at midnight', () => {
    // 2026-09-22 00:00 in Manila (+8 UTC) is 16:00 UTC previous day
    const midnightDate = new Date(Date.UTC(2026, 8, 21, 16, 0, 0));
    const solar = getSolarPosition(midnightDate, 14.5995, 120.9842);

    expect(solar.isDaylight).toBe(false);
    expect(solar.elevation).toBeLessThan(0);
    expect(solar.position).toMatch(/below the horizon/i);
  });

  test('detects sunrise and sunset transitions', () => {
    // 2026-09-22 06:15 in Manila is morning sunrise
    const dawnDate = new Date(Date.UTC(2026, 8, 21, 22, 15, 0));
    const dawnSolar = getSolarPosition(dawnDate, 14.5995, 120.9842);
    expect(dawnSolar.isDaylight).toBe(true);
    expect(dawnSolar.elevation).toBeGreaterThan(0);
    expect(dawnSolar.position).toMatch(/rising|dawn|morning/i);

    // 2026-09-22 17:45 in Manila is sunset/dusk
    const duskDate = new Date(Date.UTC(2026, 8, 22, 9, 45, 0));
    const duskSolar = getSolarPosition(duskDate, 14.5995, 120.9842);
    expect(duskSolar.isDaylight).toBe(true);
    expect(duskSolar.position).toMatch(/afternoon|setting|dusk/i);
  });
});

describe('Timezone & Coordinates resolver', () => {
  test('resolves known timezone coordinates correctly', () => {
    const manila = getTimezoneCoordinates('Asia/Manila');
    expect(manila.lat).toBeCloseTo(14.6, 1);
    expect(manila.lon).toBeCloseTo(120.98, 1);

    const ny = getTimezoneCoordinates('America/New_York');
    expect(ny.lat).toBeCloseTo(40.7, 1);
    expect(ny.lon).toBeCloseTo(-74.0, 1);

    const london = getTimezoneCoordinates('Europe/London');
    expect(london.lat).toBeCloseTo(51.5, 1);
  });

  test('falls back gracefully on unknown timezone', () => {
    const fallback = getTimezoneCoordinates('Unknown/Place');
    expect(fallback).toHaveProperty('lat');
    expect(fallback).toHaveProperty('lon');
  });

  test('getUserCoordinates returns cached coords if present', async () => {
    sessionStorage.setItem('sky_user_coords', JSON.stringify({ lat: 10.5, lon: 123.5 }));
    const coords = await getUserCoordinates();
    expect(coords.lat).toBe(10.5);
    expect(coords.lon).toBe(123.5);
    sessionStorage.removeItem('sky_user_coords');
  });
});

