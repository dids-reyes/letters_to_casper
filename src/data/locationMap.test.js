import {getGoogleMapsLocationUrl} from './locationMap';

test('builds an unambiguous Google Maps query from city, region, and country', () => {
  expect(getGoogleMapsLocationUrl({city: 'Alicia', region: 'Isabela', country: 'PH'})).toBe(
    'https://www.google.com/maps/search/?api=1&query=Alicia%2C%20Isabela%2C%20Philippines'
  );
});

test('keeps valid city-only locations working', () => {
  expect(getGoogleMapsLocationUrl({city: 'Taguig'})).toBe(
    'https://www.google.com/maps/search/?api=1&query=Taguig'
  );
});

test('removes duplicate and unavailable location parts', () => {
  expect(getGoogleMapsLocationUrl({city: 'Manila', region: 'Manila', country: 'PH'})).toBe(
    'https://www.google.com/maps/search/?api=1&query=Manila%2C%20Philippines'
  );
  expect(getGoogleMapsLocationUrl({city: 'Unknown', region: 'Isabela', country: 'PH'})).toBeNull();
});
