import {
  SKY_SESSION_STORAGE_KEY,
  SKY_SESSION_TTL_MS,
  clearSkySession,
  loadSkySession,
  saveSkySession,
  touchSkySession,
} from './session';

describe('Sky Session Persistence (30-Minute Grace Period)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('returns null when no session is cached', () => {
    expect(loadSkySession()).toBeNull();
  });

  test('saves and seamlessly restores session within 30-minute grace period', () => {
    const startTime = 1000000;
    const profile = {
      username: 'soul1042',
      age: null,
      gender: null,
      avatar: null,
      status: 'peaceful',
    };
    saveSkySession({ profile, note: 'A quiet thought' }, startTime);

    // After 10 minutes (within 30-minute grace period)
    const tenMinutesLater = startTime + 10 * 60 * 1000;
    const restored = loadSkySession(tenMinutesLater);
    expect(restored).not.toBeNull();
    expect(restored.profile).toEqual(profile);
    expect(restored.note).toBe('A quiet thought');
    expect(restored.lastActiveAt).toBe(startTime);
  });

  test('purges session completely after 30 minutes of continuous inactivity', () => {
    const startTime = 1000000;
    const profile = { username: 'Cosmo', age: 25, gender: 'male' };
    saveSkySession({ profile, note: 'Hello' }, startTime);

    // 30 minutes + 1 ms later
    const expiredTime = startTime + SKY_SESSION_TTL_MS + 1;
    expect(loadSkySession(expiredTime)).toBeNull();

    // Storage is cleared
    expect(localStorage.getItem(SKY_SESSION_STORAGE_KEY)).toBeNull();
  });

  test('touchSkySession refreshes lastActiveAt to keep session alive', () => {
    const startTime = 1000000;
    saveSkySession({ profile: { username: 'soul123' } }, startTime);

    // User is active 20 minutes in
    const twentyMinutesLater = startTime + 20 * 60 * 1000;
    touchSkySession(twentyMinutesLater);

    // Another 20 minutes later (total 40 minutes from start, but 20 minutes from last activity)
    const fortyMinutesLater = startTime + 40 * 60 * 1000;
    const activeSession = loadSkySession(fortyMinutesLater);
    expect(activeSession).not.toBeNull();
    expect(activeSession.profile.username).toBe('soul123');
    expect(activeSession.lastActiveAt).toBe(twentyMinutesLater);
  });

  test('clearSkySession explicitly purges stored session', () => {
    saveSkySession({ profile: { username: 'Orion' } });
    expect(localStorage.getItem(SKY_SESSION_STORAGE_KEY)).not.toBeNull();
    clearSkySession();
    expect(localStorage.getItem(SKY_SESSION_STORAGE_KEY)).toBeNull();
  });
});

