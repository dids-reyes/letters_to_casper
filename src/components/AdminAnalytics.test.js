import React from 'react';
import {render, screen} from '@testing-library/react';
import {AuthContext} from '../AuthContext';
import AdminAnalytics from './AdminAnalytics';

jest.mock('../data/keys', () => ({render_base_url: 'https://example.test', api_key: 'test'}));

const feature = {
  properties: {name: 'Philippines', code: 'PH'},
  geometry: {type: 'Polygon', coordinates: [[[120, 10], [121, 10], [121, 11], [120, 10]]]},
};
const summary = {
  totals: {all: 10, approved: 7, pending: 2, burned: 1, featured: 1, withPhoto: 0},
  reads: {total: 20, average: 2.9},
  linkCopies: {total: 12},
  reactions: {love: 3, felt: 1, sad: 0, courage: 2, notAlone: 0},
  trend: [{date: '2026-09-01', count: 2}],
  topCities: [{city: 'Manila', region: 'NCR', count: 5}],
};

const originalFetch = global.fetch;
beforeEach(() => {
  global.fetch = jest.fn(async url => ({
    ok: true,
    json: async () => (url.includes('origins.json')
      ? {features: [feature]}
      : url.includes('origins-map')
        ? [{country: 'PH', city: 'Manila', latitude: 14.6, longitude: 121, count: 5}]
        : summary),
  }));
});
afterEach(() => { global.fetch = originalFetch; });

function renderAnalytics() {
  return render(
    <AuthContext.Provider value={{sessionToken: 'test-session'}}>
      <AdminAnalytics />
    </AuthContext.Provider>,
  );
}

test('puts the global map first, ahead of the summary stats', async () => {
  const {container} = renderAnalytics();
  await screen.findByRole('group', {name: 'Countries with published letters'});
  await screen.findByText('10');
  const sections = container.querySelector('.admin-analytics').children;
  expect(sections[0]).toHaveClass('admin-map');
});

test('shows the letter totals, top cities and reactions once analytics load', async () => {
  renderAnalytics();
  await screen.findByRole('group', {name: 'Countries with published letters'});
  expect(await screen.findByText('10')).toBeInTheDocument();
  expect(screen.getByText('Manila, NCR')).toBeInTheDocument();
  expect(screen.getByText('Total letters')).toBeInTheDocument();
  expect(screen.getByText('Love')).toBeInTheDocument();
  expect(screen.getByText('12')).toBeInTheDocument();
  expect(screen.getByText('Link copies')).toBeInTheDocument();
});

test('offers a retry when the summary request fails', async () => {
  global.fetch = jest.fn(async url => (url.includes('analytics-summary')
    ? {ok: false}
    : {ok: true, json: async () => (url.includes('origins.json') ? {features: [feature]} : [])}));
  renderAnalytics();
  expect(await screen.findByRole('button', {name: 'Try again'})).toBeInTheDocument();
  await screen.findByText('No published letter locations yet.');
});
