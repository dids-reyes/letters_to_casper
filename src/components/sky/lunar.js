// Synodic month average duration in days
const SYNODIC_MONTH_DAYS = 29.53058770576;
// Known New Moon reference point: January 11, 2024, 11:57 UTC
const REFERENCE_NEW_MOON_MS = Date.UTC(2024, 0, 11, 11, 57, 0);

export function getMoonPhase(date = new Date()) {
  const timestamp = date instanceof Date ? date.getTime() : new Date(date).getTime();
  const diffDays = (timestamp - REFERENCE_NEW_MOON_MS) / 86400000;
  let phase = (diffDays % SYNODIC_MONTH_DAYS) / SYNODIC_MONTH_DAYS;
  if (phase < 0) phase += 1;

  const ageDays = phase * SYNODIC_MONTH_DAYS;
  // Illumination from 0% (new) to 100% (full)
  const illumination = Math.round(0.5 * (1 - Math.cos(phase * 2 * Math.PI)) * 100);

  let name = '';
  let position = '';

  if (phase < 0.03 || phase >= 0.97) {
    name = 'New Moon';
    position = 'Resting near the sun, hidden from view as a new cycle begins.';
  } else if (phase < 0.22) {
    name = 'Waxing Crescent';
    position = 'Visible low in the western sky in early evening, trailing just after sunset.';
  } else if (phase < 0.28) {
    name = 'First Quarter';
    position = 'High in the sky at dusk, shining brightly until setting around midnight.';
  } else if (phase < 0.47) {
    name = 'Waxing Gibbous';
    position = 'High in the night sky, rising in the afternoon and shining until the early morning hours.';
  } else if (phase < 0.53) {
    name = 'Full Moon';
    position = 'Rises in the east at sunset, illuminating the entire night from dusk to dawn.';
  } else if (phase < 0.72) {
    name = 'Waning Gibbous';
    position = 'Rises late in the evening and shines brightly into the morning twilight.';
  } else if (phase < 0.78) {
    name = 'Last Quarter';
    position = 'Rises around midnight, positioned high in the sky as dawn approaches.';
  } else {
    name = 'Waning Crescent';
    position = 'A slender silver curve rising in the eastern sky shortly before sunrise.';
  }

  return {
    phase,
    ageDays: Math.round(ageDays * 10) / 10,
    illumination,
    name,
    position,
    isWaxing: phase < 0.5,
    formattedDate: new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date instanceof Date ? date : new Date(date)),
    skyNote: 'Accurate based on the sky today. Look up at the moon tonight. We are all under the same sky.',
  };
}
