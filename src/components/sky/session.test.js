import {
  SKY_SESSION_STORAGE_KEY,
  clearSkySession,
} from './session';

describe('Sky temporary session cleanup', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('clearSkySession purges profile data left by an earlier build', () => {
    localStorage.setItem(SKY_SESSION_STORAGE_KEY, JSON.stringify({
      profile: { username: 'Orion' },
    }));
    expect(localStorage.getItem(SKY_SESSION_STORAGE_KEY)).not.toBeNull();
    clearSkySession();
    expect(localStorage.getItem(SKY_SESSION_STORAGE_KEY)).toBeNull();
  });
});
