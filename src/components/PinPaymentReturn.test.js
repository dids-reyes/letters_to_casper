import React from 'react';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import PinPaymentReturn from './PinPaymentReturn';
jest.mock('../data/keys', () => ({render_base_url: 'https://service.example', api_key: 'test'}));
const token = 'a'.repeat(48);
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; window.history.replaceState({}, '', '/'); jest.useRealTimers(); });
test('verifies payment and refreshes before announcing a pinned letter', async () => {
  window.history.replaceState({}, '', `/?pin_payment=${token}`);
  global.fetch = jest.fn().mockResolvedValue({ok: true, json: async () => ({status: 'pinned'})});
  const refresh = jest.fn().mockResolvedValue();
  render(<PinPaymentReturn onConfirmed={refresh} />);
  await screen.findByText(/Thank you for supporting Letters to Casper/);
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith(`https://service.example/api/pin-payment-status/${token}`, expect.objectContaining({method: 'POST'}));
  expect(window.location.search).toBe('');
});
test('cancelled checkout never claims payment or verifies it', () => {
  window.history.replaceState({}, '', '/?pin_cancelled=1');
  global.fetch = jest.fn(); render(<PinPaymentReturn onConfirmed={jest.fn()} />);
  expect(screen.getByRole('status').textContent).toMatch(/cancelled/);
  expect(fetch).not.toHaveBeenCalled();
  expect(screen.getByRole('heading', {name: 'Maybe another time.'})).toBeTruthy();
  fireEvent.click(screen.getByRole('button', {name: 'Dismiss payment status'}));
  expect(screen.queryByRole('status')).toBeNull();
  expect(window.location.search).toBe('');
});
test('pending payments poll and only refresh after backend confirmation', async () => {
  jest.useFakeTimers(); window.history.replaceState({}, '', `/?pin_payment=${token}`);
  global.fetch = jest.fn().mockResolvedValueOnce({ok: true, json: async () => ({status: 'pending'})})
    .mockResolvedValueOnce({ok: true, json: async () => ({status: 'pinned'})});
  const refresh = jest.fn(); render(<PinPaymentReturn onConfirmed={refresh} />);
  await act(async () => {});
  expect(refresh).not.toHaveBeenCalled();
  await act(async () => { jest.advanceTimersByTime(3000); });
  expect(refresh).toHaveBeenCalledTimes(1);
});
test('unknown references offer retry without claiming a pin', async () => {
  window.history.replaceState({}, '', `/?pin_payment=${token}`);
  global.fetch = jest.fn().mockResolvedValue({ok: false, status: 404, json: async () => ({error: 'Not found'})});
  const refresh = jest.fn(); render(<PinPaymentReturn onConfirmed={refresh} />);
  fireEvent.click(await screen.findByRole('button', {name: 'Check again'}));
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  expect(refresh).not.toHaveBeenCalled();
});

test('confirmed payments reuse the thank-you dialog without ads and close immediately', async () => {
  window.history.replaceState({}, '', `/?pin_payment=${token}`);
  global.fetch = jest.fn().mockResolvedValue({ok: true, json: async () => ({status: 'pinned'})});
  render(<PinPaymentReturn onConfirmed={jest.fn()} />);
  const dialog = await screen.findByRole('dialog', {name: 'A little more time to shine.'});
  expect(dialog.className).toBe('share-celebration-dialog');
  expect(dialog.querySelector('.share-celebration-achievement img')).toBeTruthy();
  expect(dialog.querySelector('.adsterra-banner, iframe')).toBeNull();
  expect(screen.getByRole('button', {name: 'Share Letters to Casper'})).toBeTruthy();
  fireEvent.click(screen.getByRole('button', {name: 'Close'}));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.body.style.overflow).toBe('');
});
test('already fulfilled but unpinned letters do not claim an active pin in the thank-you dialog', async () => {
  window.history.replaceState({}, '', `/?pin_payment=${token}`);
  global.fetch = jest.fn().mockResolvedValue({ok: true, json: async () => ({status: 'fulfilled'})});
  render(<PinPaymentReturn onConfirmed={jest.fn()} />);
  const dialog = await screen.findByRole('dialog', {name: 'Your support made it here.'});
  expect(dialog.textContent).toContain('no longer actively pinned');
  fireEvent.keyDown(dialog, {key: 'Escape'});
  expect(screen.queryByRole('dialog')).toBeNull();
});
