import React from 'react';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import PinLetterDialog, {letterIdFromUrl, SUPPORT_TIERS, expirationForTier} from './PinLetterDialog';
import Letter from './Letter';
jest.mock('../data/keys', () => ({render_url: 'https://service.example/api/messages', api_key: 'test'}));
const id = '66139a0e59ef92852a5d9ebe';
const originalFetch = global.fetch;
afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); global.fetch = originalFetch; });
test('validates letter URLs and rejects other hosts and paths', () => {
  expect(letterIdFromUrl(`https://letterstocasper.com/letters/${id}?ref=share`)).toBe(id);
  expect(letterIdFromUrl(`https://www.letterstocasper.com/letter/${id}`)).toBe(id);
  for (const url of [`https://evil.example/letters/${id}`, `https://letterstocasper.com/letters/nope`, 'javascript:alert(1)']) expect(letterIdFromUrl(url)).toBeNull();
});
test('shows community framing, four tiers, and accurate expiry for every selection', () => {
  jest.useFakeTimers(); const start = new Date('2026-08-31T12:34:56Z'); jest.setSystemTime(start);
  const {container} = render(<PinLetterDialog onClose={() => {}} />);
  const titleHeading = screen.getByRole('heading', {name: /Pin & Deliver a Letter/i});
  expect(titleHeading).toBeTruthy();
  expect(titleHeading.querySelector('svg')).toBeTruthy();
  expect(screen.getAllByRole('radio')).toHaveLength(4);
  for (const tier of SUPPORT_TIERS) {
    fireEvent.click(screen.getByRole('radio', {name: new RegExp(tier.label)}));
    expect(screen.getByRole('button', {name: `Pin for ₱${tier.price}`})).toBeTruthy();
    expect(screen.getByLabelText(`Previously ₱${tier.originalPrice}`).tagName).toBe('DEL');
    expect(screen.getByLabelText(`Now ₱${tier.price}`)).toBeTruthy();
    expect(document.querySelector('time').dateTime).toBe(expirationForTier(start, tier).toISOString());
  }
  expect(document.querySelector('time').dateTime).toBe('2026-09-07T12:34:56.000Z');
  act(() => jest.advanceTimersByTime(1000));
  expect(document.querySelector('time').dateTime).toBe('2026-09-07T12:34:57.000Z');
  expect(expirationForTier(start, SUPPORT_TIERS[0]).toISOString()).toBe('2026-09-01T00:34:56.000Z');
  expect(container).toBeTruthy();
});
test.each(['button', 'escape', 'backdrop'])('dismisses with %s after exit transition', method => {
  jest.useFakeTimers(); const close = jest.fn(); render(<PinLetterDialog onClose={close} />);
  if (method === 'button') fireEvent.click(screen.getByLabelText('Close pin dialog'));
  if (method === 'escape') fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
  if (method === 'backdrop') fireEvent.click(document.querySelector('.pin-letter-overlay'));
  expect(document.querySelector('.is-closing')).toBeTruthy();
  act(() => jest.advanceTimersByTime(180)); expect(close).toHaveBeenCalledTimes(1);
});
test('rejects an invalid link without making a request', () => {
  global.fetch = jest.fn(); render(<PinLetterDialog onClose={() => {}} />);
  fireEvent.click(screen.getByText('Pin for ₱19'));
  expect(screen.getByRole('alert').textContent).toMatch(/valid/);
  expect(fetch).not.toHaveBeenCalled();
});
const letterResponse = (message = 'A'.repeat(90)) => ({ok: true, json: async () => ({message: {_id: id, from: 'Sender', to: 'Recipient', message}})});
const fillLink = () => fireEvent.change(screen.getByLabelText('Which letter would you like to pin?'), {target: {value: `https://letterstocasper.com/letters/${id}`}});
test('previews the letter before creating a checkout and sends the selected tier and optional email', async () => {
  let resolve;
  global.fetch = jest.fn().mockResolvedValueOnce(letterResponse()).mockImplementationOnce(() => new Promise(r => {resolve = r;}));
  const redirect = jest.fn(); render(<PinLetterDialog onClose={() => {}} redirect={redirect} />);
  fireEvent.click(screen.getByRole('radio', {name: /3 Days/}));
  fillLink();
  fireEvent.click(screen.getByRole('button', {name: /Email notifications/i}));
  const email = screen.getByLabelText('Your email (optional)');
  expect(email.autocomplete).toBe('email'); expect(email.type).toBe('email'); expect(email.required).toBe(false);
  fireEvent.change(email, {target: {value: 'reader@example.com'}});
  fireEvent.change(screen.getByLabelText('Their email (To Notify)'), {target: {value: 'recipient@example.com'}});
  fireEvent.click(screen.getByText('Pin and Notify for ₱79'));
  expect(screen.getByText('Loading letter…').disabled).toBe(true);
  await screen.findByRole('heading', {name: 'Confirm your letter'});
  expect(screen.getByText('Sender')).toBeTruthy(); expect(screen.getByText('Recipient')).toBeTruthy();
  expect(screen.getByText(/Secure checkout using/i)).toBeTruthy();
  expect(screen.getByAltText('QRPH')).toBeTruthy();
  expect(screen.getByAltText('PayMongo')).toBeTruthy();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith(`https://service.example/api/messages/public/${id}`, expect.objectContaining({headers: {'x-api-key': 'test'}}));
  expect(redirect).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('Proceed to Payment'));
  expect(screen.getByText('Opening checkout…').disabled).toBe(true);
  expect(screen.getByLabelText('Close pin dialog').disabled).toBe(true);
  expect(screen.getByText('Cancel').disabled).toBe(true);
  expect(fetch).toHaveBeenLastCalledWith('https://service.example/api/create-pin-payment', expect.objectContaining({body: JSON.stringify({letterId: id, tierId: '3d', customer_email: 'reader@example.com', recipient_email: 'recipient@example.com'})}));
  resolve({ok: true, json: async () => ({checkoutUrl: 'https://pm.link/test'})});
  await waitFor(() => expect(redirect).toHaveBeenCalledWith('https://pm.link/test'));
});
test('cancel returns to the preserved form without creating a payment; blank email is optional', async () => {
  global.fetch = jest.fn().mockResolvedValue(letterResponse('A short memory'));
  render(<PinLetterDialog onClose={() => {}} />); fillLink();
  fireEvent.click(screen.getByText('Pin for ₱19'));
  await screen.findByText('Proceed to Payment');
  expect(screen.getByText('A short memory')).toBeTruthy();
  fireEvent.click(screen.getByText('Cancel'));
  expect(screen.getByLabelText('Which letter would you like to pin?').value).toContain(id);
  expect(fetch).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByText('Pin for ₱19'));
  await screen.findByText('Proceed to Payment');
  global.fetch.mockResolvedValueOnce({ok: false, json: async () => ({error: 'This letter is already pinned.'})});
  fireEvent.click(screen.getByText('Proceed to Payment'));
  await screen.findByRole('alert');
  expect(screen.getByRole('alert').textContent).toBe('This letter is already pinned.');
  expect(screen.getByText('Proceed to Payment').disabled).toBe(false);
  expect(JSON.parse(fetch.mock.calls[2][1].body)).toEqual({letterId: id, tierId: '12h'});
});
test('invalid optional email blocks preview', () => {
  global.fetch = jest.fn(); render(<PinLetterDialog onClose={() => {}} />); fillLink();
  fireEvent.click(screen.getByRole('button', {name: /Email notifications/i}));
  fireEvent.change(screen.getByLabelText('Your email (optional)'), {target: {value: 'not-an-email'}});
  fireEvent.click(screen.getByText('Pin for ₱19'));
  expect(screen.getByRole('alert').textContent).toMatch(/valid email/); expect(fetch).not.toHaveBeenCalled();
});
test('unavailable letters never reach confirmation or checkout', async () => {
  global.fetch = jest.fn().mockResolvedValue({ok: false, json: async () => ({error: 'Message not found'})});
  render(<PinLetterDialog onClose={() => {}} />); fillLink(); fireEvent.click(screen.getByText('Pin for ₱19'));
  await screen.findByRole('alert');
  expect(screen.queryByText('Proceed to Payment')).toBeNull();
  expect(screen.getByText('Pin for ₱19').disabled).toBe(false);
});
test('only active pinned letters show the circular indicator', () => {
  const letter = {approve: true, _id: id, from: 'A', to: 'B', message: 'Memory', timestamp: new Date(), is_pinned: true, pin_expires_at: new Date(Date.now() + 86400000).toISOString()};
  const {rerender} = render(<MemoryRouter><Letter letter={letter} /></MemoryRouter>);
  expect(screen.getByRole('img', {name: 'Pinned memory'}).className).toBe('letter-pin-indicator');
  rerender(<MemoryRouter><Letter letter={{...letter, pin_expires_at: '2020-01-01'}} /></MemoryRouter>);
  expect(screen.queryByRole('img', {name: 'Pinned memory'})).toBeNull();
});

test('starts with an empty link field and defaults to 12 hours (₱19)', () => {
  render(<PinLetterDialog onClose={() => {}} letterId={id} />);
  const input = screen.getByLabelText('Which letter would you like to pin?');
  expect(input.value).toBe('');
  expect(input.placeholder).toBe('https://letterstocasper.com/letters/…');
  expect(screen.getByRole('radio', {name: /12 Hours/}).checked).toBe(true);
  fireEvent.change(input, {target: {value: ''}});
  expect(input.value).toBe('');
});

test('displays full capacity state when 7 active pinned letters are present', () => {
  const now = new Date('2026-09-16T12:00:00Z');
  jest.useFakeTimers();
  jest.setSystemTime(now);
  const close = jest.fn();
  const letters = Array.from({length: 7}, (_, i) => ({
    _id: `letter-${i}`,
    approve: true,
    is_pinned: true,
    pin_expires_at: new Date(now.getTime() + (i + 1) * 3600000).toISOString(),
  }));
  render(<PinLetterDialog onClose={close} letters={letters} />);
  expect(screen.getByRole('heading', {name: 'All Pinned Slots Occupied (7/7)'})).toBeTruthy();
  expect(screen.getByText(/To keep the quiet feed balanced and give every featured letter its moment/)).toBeTruthy();
  expect(screen.getByText(/Next available slot opens around:/)).toBeTruthy();
  const understoodBtn = screen.getByRole('button', {name: 'Understood'});
  expect(understoodBtn).toBeTruthy();
  fireEvent.click(understoodBtn);
  act(() => jest.advanceTimersByTime(180));
  expect(close).toHaveBeenCalledTimes(1);
});

 test.each([['love', {love: 4, sad: 1}], ['sad', {love: 0, sad: 3}], ['neutral', {}]])('active pin preserves %s color and removes only its badge at expiry', (mood, echoes) => {
  jest.useFakeTimers(); jest.setSystemTime(new Date('2026-09-17T00:00:00Z'));
  const letter = {_id: id, approve: true, from: 'A', to: 'B', message: 'Memory', echoes, is_pinned: true, pin_expires_at: new Date(Date.now() + 1000).toISOString()};
  const {container} = render(<MemoryRouter><Letter letter={letter} /></MemoryRouter>);
  expect(container.querySelector(`.letter-card--mood-${mood}`)).toBeTruthy();
  expect(screen.getByRole('img', {name: 'Pinned memory'})).toBeTruthy();
  act(() => jest.advanceTimersByTime(1000));
  expect(container.querySelector('.letter-card--mood-pinned')).toBeNull();
  expect(container.querySelector(`.letter-card--mood-${mood}`)).toBeTruthy();
  expect(screen.queryByRole('img', {name: 'Pinned memory'})).toBeNull();
  expect(screen.queryByRole('dialog')).toBeNull();
});

test('invalid recipient email blocks checkout preview', () => {
  global.fetch = jest.fn(); render(<PinLetterDialog onClose={() => {}} />); fillLink();
  fireEvent.click(screen.getByRole('button', {name: /Email notifications/i}));
  fireEvent.change(screen.getByLabelText('Their email (To Notify)'), {target: {value: 'invalid'}});
  fireEvent.click(screen.getByText('Pin and Notify for ₱19'));
  expect(screen.getByRole('alert').textContent).toMatch(/valid recipient email/);
  expect(fetch).not.toHaveBeenCalled();
});

test('email sections start collapsed and preserve values when reopened', () => {
  render(<PinLetterDialog onClose={() => {}} />);
  expect(screen.queryByLabelText('Your email (optional)')).toBeNull();
  expect(screen.queryByLabelText('Their email (To Notify)')).toBeNull();
  const toggle = screen.getByRole('button', {name: /Email notifications/i});
  fireEvent.click(toggle);
  fireEvent.change(screen.getByLabelText('Your email (optional)'), {target:{value:'reader@example.com'}});
  fireEvent.change(screen.getByLabelText('Their email (To Notify)'), {target:{value:'recipient@example.com'}});
  fireEvent.click(toggle);
  expect(screen.queryByLabelText('Your email (optional)')).toBeNull();
  expect(screen.queryByLabelText('Their email (To Notify)')).toBeNull();
  fireEvent.click(toggle);
  expect(screen.getByLabelText('Your email (optional)').value).toBe('reader@example.com');
  expect(screen.getByLabelText('Their email (To Notify)').value).toBe('recipient@example.com');
});

test('dynamically updates submit button label based on recipient email presence', () => {
  render(<PinLetterDialog onClose={() => {}} />);
  expect(screen.getByRole('button', {name: 'Pin for ₱19'})).toBeTruthy();
  fireEvent.click(screen.getByRole('button', {name: /Email notifications/i}));
  const recipientInput = screen.getByLabelText('Their email (To Notify)');
  
  fireEvent.change(recipientInput, {target: {value: '   '}});
  expect(screen.getByRole('button', {name: 'Pin for ₱19'})).toBeTruthy();

  fireEvent.change(recipientInput, {target: {value: 'casper@example.com'}});
  expect(screen.getByRole('button', {name: 'Pin and Notify for ₱19'})).toBeTruthy();

  fireEvent.click(screen.getByRole('radio', {name: /7 Days/}));
  expect(screen.getByRole('button', {name: 'Pin and Notify for ₱129'})).toBeTruthy();

  fireEvent.change(recipientInput, {target: {value: ''}});
  expect(screen.getByRole('button', {name: 'Pin for ₱129'})).toBeTruthy();
});

test('opens and dismisses the Delivering Your Letter guide dialog with correct content', () => {
  const onClose = jest.fn();
  render(<PinLetterDialog onClose={onClose} />);
  fireEvent.click(screen.getByRole('button', {name: /Email notifications/i}));

  const guideTrigger = screen.getByRole('button', {name: /What’s this\?/i});
  expect(guideTrigger).toBeTruthy();

  expect(screen.queryByRole('heading', {name: 'Delivering Your Letter'})).toBeNull();

  fireEvent.click(guideTrigger);
  expect(screen.getByRole('heading', {name: 'Delivering Your Letter'})).toBeTruthy();
  expect(screen.getByText(/If you know the email address of the person you wrote this for/i)).toBeTruthy();
  expect(screen.getByText(/What they will see:/i)).toBeTruthy();
  expect(screen.getByText(/Only the names you entered in the To and From fields/i)).toBeTruthy();
  expect(screen.getByText(/Your receipt email stays private:/i)).toBeTruthy();
  expect(screen.getByText(/The email address you use for payment confirmation is never shown/i)).toBeTruthy();
  expect(screen.getByText(/One-time dispatch:/i)).toBeTruthy();
  expect(screen.getByText(/This is a single, quiet delivery notification/i)).toBeTruthy();

  fireEvent.click(screen.getByRole('button', {name: 'Got it'}));
  expect(screen.queryByRole('heading', {name: 'Delivering Your Letter'})).toBeNull();
  expect(onClose).not.toHaveBeenCalled();

  fireEvent.click(guideTrigger);
  expect(screen.getByRole('heading', {name: 'Delivering Your Letter'})).toBeTruthy();
  fireEvent.keyDown(document.querySelector('.pin-delivery-guide-overlay'), {key: 'Escape'});
  expect(screen.queryByRole('heading', {name: 'Delivering Your Letter'})).toBeNull();
  expect(onClose).not.toHaveBeenCalled();

  fireEvent.click(guideTrigger);
  expect(screen.getByRole('heading', {name: 'Delivering Your Letter'})).toBeTruthy();
  fireEvent.click(screen.getByLabelText('Close delivery guide'));
  expect(screen.queryByRole('heading', {name: 'Delivering Your Letter'})).toBeNull();
  expect(onClose).not.toHaveBeenCalled();
});
