export const SKY_SESSION_STORAGE_KEY = 'sky_session_data';
export const SKY_SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes grace period

/**
 * Loads cached session data if within the 30-minute inactivity grace period.
 * Automatically purges and returns null if 30 minutes or more have passed.
 *
 * @param {number} [now=Date.now()]
 * @returns {{ profile: object|null, note: string, lastActiveAt: number }|null}
 */
export function loadSkySession(now = Date.now()) {
  try {
    const raw = localStorage.getItem(SKY_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') {
      clearSkySession();
      return null;
    }
    const elapsed = now - (Number(data.lastActiveAt) || 0);
    if (elapsed < SKY_SESSION_TTL_MS) {
      return data;
    }
    // Expired after 30 minutes of continuous inactivity
    clearSkySession();
    return null;
  } catch (_) {
    return null;
  }
}

/**
 * Persists temporary session data with the current timestamp.
 *
 * @param {{ profile?: object|null, note?: string }} data
 * @param {number} [now=Date.now()]
 */
export function saveSkySession(data = {}, now = Date.now()) {
  try {
    const existing = loadSkySession(now) || {};
    const payload = {
      profile: data.profile !== undefined ? data.profile : existing.profile || null,
      note: data.note !== undefined ? data.note : existing.note || '',
      lastActiveAt: now,
    };
    localStorage.setItem(SKY_SESSION_STORAGE_KEY, JSON.stringify(payload));
    return payload;
  } catch (_) {
    return null;
  }
}

/**
 * Updates the last active timestamp of the current session to keep it alive.
 *
 * @param {number} [now=Date.now()]
 */
export function touchSkySession(now = Date.now()) {
  try {
    const current = loadSkySession(now);
    if (current) {
      current.lastActiveAt = now;
      localStorage.setItem(SKY_SESSION_STORAGE_KEY, JSON.stringify(current));
    }
  } catch (_) {}
}

/**
 * Purges the session data completely.
 */
export function clearSkySession() {
  try {
    localStorage.removeItem(SKY_SESSION_STORAGE_KEY);
  } catch (_) {}
}

