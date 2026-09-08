import React from 'react';
import axios from 'axios';
import {fireEvent, render, screen, within, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {AuthContext} from '../AuthContext';
import AdminPortal from './AdminPortal';

jest.mock('react-lottie-player', () => () => null);
jest.mock('axios', () => ({get: jest.fn().mockResolvedValue({data: {ip: '127.0.0.1'}})}));
jest.mock('../data/keys', () => ({render_base_url: 'https://example.test', api_key: 'test'}));

const pending = {_id: 'pending', from: 'Pending author', to: 'All', message: 'Pending message', timestamp: '2026-09-07'};
const burned = {_id: 'burned', from: 'Burned author', to: 'All', message: 'Burned message', timestamp: '2026-09-07', burnRequested: true};
const originalFetch = global.fetch;
const logout = jest.fn();

beforeEach(() => {
  axios.get.mockResolvedValue({data: {ip: '127.0.0.1'}});
  global.fetch = jest.fn(async url => ({
    ok: true,
    json: async () => ({messages: url.endsWith('/unapproved') ? [pending, burned] : []}),
  }));
});
afterEach(() => { global.fetch = originalFetch; });

async function openPortal(adminName = 'didsirwynreyes') {
  render(<MemoryRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}><AuthContext.Provider value={{isLoggedIn: true, adminName, sessionToken: 'test-session', logout}}><AdminPortal /></AuthContext.Provider></MemoryRouter>);
  await screen.findByText('Pending message');
}

test('separates burned letters from review and deletes through the existing authenticated endpoint', async () => {
  await openPortal();
  expect(screen.queryByText('Burned message')).not.toBeInTheDocument();
  expect(screen.getByRole('button', {name: /Review Queue 1/})).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: /Burned Letters 1/}));
  expect(screen.getByText('Burned message')).toBeInTheDocument();
  expect(screen.queryByRole('button', {name: /^Publish/})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: 'Delete permanently'}));
  const dialog = screen.getByRole('alertdialog');
  fireEvent.click(within(dialog).getByRole('button', {name: 'Delete permanently'}));
  await screen.findByText('No burned letters');
  expect(global.fetch).toHaveBeenCalledWith('https://example.test/api/messages/delete', expect.objectContaining({
    method: 'POST',
    headers: expect.objectContaining({Authorization: 'Bearer test-session'}),
    body: JSON.stringify({letterIds: ['burned']}),
  }));
  fireEvent.click(screen.getByRole('button', {name: /Review Queue 1/}));
  expect(screen.getByText('Pending message')).toBeInTheDocument();
});

test('keeps burned letters and displays the error when permanent deletion fails', async () => {
  await openPortal();
  fireEvent.click(screen.getByRole('button', {name: /Burned Letters/}));
  fireEvent.click(screen.getByRole('button', {name: 'Delete permanently'}));
  global.fetch.mockResolvedValueOnce({ok: false, status: 500});
  fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', {name: 'Delete permanently'}));
  await waitFor(() => expect(within(screen.getByRole('alertdialog')).getByRole('alert')).toHaveTextContent('couldn’t be permanently deleted'));
  expect(screen.getByText('Burned message')).toBeInTheDocument();
});

test('restricts permanent deletion for other administrators', async () => {
  await openPortal('moderator');
  fireEvent.click(screen.getByRole('button', {name: /Burned Letters/}));
  expect(screen.getByRole('button', {name: 'Delete permanently'})).toBeDisabled();
});

test('separates auto moderation failures and clears selection when switching queues', async () => {
  const failed = {...pending, _id: 'failed', message: 'Flagged message', autoModeration: {status: 'flagged', reason: 'Spam'}};
  global.fetch.mockImplementation(async url => ({ok: true, json: async () => ({messages: url.endsWith('/unapproved') ? [pending, burned, failed] : []})}));
  await openPortal();
  expect(screen.queryByText('Flagged message')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', {name: /Manual Review 1/}));
  expect(screen.getByText('Flagged message')).toBeInTheDocument();
  expect(screen.getByText('Not approved by auto mod')).toBeInTheDocument();
  expect(screen.getByText('Spam')).toBeInTheDocument();
  expect(screen.queryByText('Pending message')).not.toBeInTheDocument();
  expect(screen.getByRole('button', {name: /^Publish/})).toBeDisabled();
});
