const cleanLocationPart = value => {
  const normalized = String(value || '').trim();
  return normalized && normalized.toLocaleLowerCase('en') !== 'unknown'
    ? normalized
    : '';
};

const displayCountry = value => {
  const country = cleanLocationPart(value);
  return country.toUpperCase() === 'PH' ? 'Philippines' : country;
};

export const getGoogleMapsLocationUrl = location => {
  const city = cleanLocationPart(location?.city);
  if (!city) return null;

  const parts = [city, cleanLocationPart(location?.region), displayCountry(location?.country)]
    .filter(Boolean)
    .filter((part, index, values) => (
      values.findIndex(value => value.toLocaleLowerCase('en') === part.toLocaleLowerCase('en')) === index
    ));

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(', '))}`;
};
