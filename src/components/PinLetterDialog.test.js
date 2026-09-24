import React from 'react';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import PinLetterDialog, {letterIdFromUrl, SUPPORT_TIERS, expirationForTier} from './PinLetterDialog';

jest.mock('../data/keys', () => ({render_url: 'https://service.example/api/messages', api_key: 'test'}));

const id = '66139a0e59ef92852a5d9ebe';
const originalFetch = global.fetch;
const letterUrl = `https://letterstocasper.com/letters/${id}`;
const letterResponse = (message = 'A complete letter') => ({
  ok: true,
  json: async () => ({message: {_id: id, from: 'Sender', to: 'Recipient', message}}),
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  global.fetch = originalFetch;
  window.history.replaceState({}, '', '/');
});

const fillLink = () => {
  fireEvent.change(screen.getByLabelText('Which letter would you like to upgrade?'), {
    target: {value: letterUrl},
  });
};

const fillRecipient = (value = 'recipient@example.com') => {
  fireEvent.change(screen.getByLabelText("Recipient's Email Address"), {
    target: {value},
  });
};

test('validates Letters to Casper letter URLs', () => {
  expect(letterIdFromUrl(`${letterUrl}?ref=share`)).toBe(id);
  expect(letterIdFromUrl(`https://www.letterstocasper.com/letter/${id}`)).toBe(id);
  expect(letterIdFromUrl(`https://evil.example/letters/${id}`)).toBeNull();
  expect(letterIdFromUrl('javascript:alert(1)')).toBeNull();
});

test('renders the three single-select upgrades and defaults to Send to Inbox', () => {
  render(<PinLetterDialog onClose={() => {}} />);

  expect(screen.getByRole('heading', {name: 'Make Sure Your Words Are Felt'})).toBeTruthy();
  expect(screen.getByText('Because some things are too heavy to keep to yourself.')).toBeTruthy();
  expect(screen.getAllByRole('radio')).toHaveLength(3);
  expect(screen.getByRole('radio', {name: /Send to Inbox/i}).checked).toBe(true);
  expect(screen.getByRole('button', {name: 'Continue • ₱9'})).toBeDisabled();
  expect(screen.getByText('Direct')).toBeTruthy();
  expect(screen.getByText('Visibility')).toBeTruthy();
  expect(screen.getByText('Most Meaningful')).toBeTruthy();
});

test('shows recipient email only for delivery choices and validates it before continuing', () => {
  render(<PinLetterDialog onClose={() => {}} />);
  const continueButton = screen.getByRole('button', {name: 'Continue • ₱9'});

  expect(screen.getByLabelText("Recipient's Email Address")).toBeTruthy();
  fillRecipient('invalid');
  expect(continueButton).toBeDisabled();
  fillRecipient();
  expect(continueButton).not.toBeDisabled();

  fireEvent.click(screen.getByRole('radio', {name: /Pin to Feed/i}));
  expect(screen.queryByLabelText("Recipient's Email Address")).toBeNull();
  expect(screen.getByRole('button', {name: 'Continue • ₱9'})).not.toBeDisabled();

  fireEvent.click(screen.getByRole('radio', {name: /The Keepsake/i}));
  expect(screen.getByLabelText("Recipient's Email Address").value).toBe('recipient@example.com');
  expect(screen.getByRole('button', {name: 'Continue • ₱29'})).not.toBeDisabled();
});

test('previews the anonymous email the recipient will receive', () => {
  render(<PinLetterDialog onClose={() => {}} />);

  fireEvent.click(screen.getByRole('button', {name: 'Preview the recipient email'}));

  const guide = screen.getByRole('dialog', {name: 'What will they receive?'});
  expect(guide).toHaveTextContent('Letters to Casper');
  expect(guide).toHaveTextContent('Recipient, someone wrote a letter for you');
  expect(guide).toHaveTextContent('Your identity stays private.');

  fireEvent.click(screen.getByRole('button', {name: 'Close delivery guide'}));
  expect(screen.queryByRole('dialog', {name: 'What will they receive?'})).toBeNull();
});

test('calculates pin expiry only for choices that include feed placement', () => {
  const start = new Date('2026-09-01T00:00:00.000Z');
  expect(expirationForTier(start, SUPPORT_TIERS[0])).toBeNull();
  expect(expirationForTier(start, SUPPORT_TIERS[1]).toISOString()).toBe('2026-09-02T00:00:00.000Z');
  expect(expirationForTier(start, SUPPORT_TIERS[2]).toISOString()).toBe('2026-09-03T00:00:00.000Z');
});

test('shows GCash, Maya, and QRPH beneath the action', () => {
  render(<PinLetterDialog onClose={() => {}} />);
  expect(screen.getByText('Secure payment via')).toBeTruthy();
  expect(screen.getByAltText('GCash')).toBeTruthy();
  expect(screen.getByAltText('Maya')).toBeTruthy();
  expect(screen.getByAltText('QRPH')).toBeTruthy();
});

test('loads a one-line letter preview and summarizes the selected option before payment', async () => {
  const fullMessage = 'This is the full letter. '.repeat(12);
  global.fetch = jest.fn().mockResolvedValueOnce(letterResponse(fullMessage));
  render(<PinLetterDialog onClose={() => {}} />);

  fillLink();
  fillRecipient();
  fireEvent.click(screen.getByRole('button', {name: 'Continue • ₱9'}));

  await screen.findByRole('heading', {name: 'Confirm Your Letter'});
  expect(screen.getByText('Message:')).toBeTruthy();
  const messagePreview = document.querySelector('.pin-letter-message-preview');
  expect(messagePreview).toHaveTextContent('This is the full letter. This is the full letter.');
  expect(screen.getByText('Selected')).toBeTruthy();
  expect(screen.getByText('Send to Inbox')).toBeTruthy();
  expect(screen.getByText('recipient@example.com')).toBeTruthy();
  expect(screen.getByText('₱9.00')).toBeTruthy();
  expect(screen.getByRole('button', {name: 'Confirm & Pay'})).toBeTruthy();

  fireEvent.click(screen.getByRole('button', {name: 'Back'}));
  expect(screen.getByRole('heading', {name: 'Make Sure Your Words Are Felt'})).toBeTruthy();
  expect(screen.getByLabelText("Recipient's Email Address").value).toBe('recipient@example.com');
});

test('Send to Inbox submits delivery without inventing a pin duration', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce(letterResponse())
    .mockResolvedValueOnce({ok: true, json: async () => ({checkoutUrl: 'https://pm.link/test'})});
  const redirect = jest.fn();
  render(<PinLetterDialog onClose={() => {}} redirect={redirect} />);

  fillLink();
  fillRecipient();
  fireEvent.click(screen.getByRole('button', {name: 'Continue • ₱9'}));
  await screen.findByRole('heading', {name: 'Confirm Your Letter'});
  fireEvent.click(screen.getByRole('button', {name: 'Confirm & Pay'}));

  await waitFor(() => expect(redirect).toHaveBeenCalledWith('https://pm.link/test'));
  expect(JSON.parse(global.fetch.mock.calls[1][1].body)).toEqual({
    letterId: id,
    tierId: 'delivery',
    recipient_email: 'recipient@example.com',
  });
});

test('close dismisses only the upgrade modal and preserves the opened letter route', () => {
  jest.useFakeTimers();
  window.history.pushState({}, '', `/letters/${id}`);
  const onClose = jest.fn();
  render(<PinLetterDialog onClose={onClose} />);

  fireEvent.click(screen.getByLabelText('Close pin dialog'));
  act(() => jest.advanceTimersByTime(180));

  expect(onClose).toHaveBeenCalledTimes(1);
  expect(window.location.pathname).toBe(`/letters/${id}`);
});

test('full pin capacity leaves inbox delivery available and disables pin choices', () => {
  const letters = Array.from({length: 7}, (_, index) => ({
    _id: `letter-${index}`,
    is_pinned: true,
    pin_expires_at: new Date(Date.now() + 86400000).toISOString(),
  }));
  render(<PinLetterDialog onClose={() => {}} letters={letters} />);

  expect(screen.getByRole('radio', {name: /Send to Inbox/i})).not.toBeDisabled();
  expect(screen.getByRole('radio', {name: /Pin to Feed/i})).toBeDisabled();
  expect(screen.getByRole('radio', {name: /The Keepsake/i})).toBeDisabled();
});
