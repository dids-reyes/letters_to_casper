export const SKY_SESSION_STORAGE_KEY = 'sky_session_data';

/**
 * Purges profile data created by current or earlier Sky builds.
 */
export function clearSkySession() {
  try {
    localStorage.removeItem(SKY_SESSION_STORAGE_KEY);
  } catch (_) {}
}
