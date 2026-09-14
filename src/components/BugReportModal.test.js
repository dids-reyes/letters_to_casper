import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import BugReportModal from './BugReportModal';
import { toast } from 'react-toastify';
jest.mock('react-toastify', () => ({ toast: { success: jest.fn() } }));
afterEach(() => { jest.restoreAllMocks(); });

test('sends description and metadata, then closes and notifies', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
  const close = jest.fn();
  render(<BugReportModal onClose={close} />);
  fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Broken letter' } });
  fireEvent.click(screen.getByText('Send Report'));
  await waitFor(() => expect(close).toHaveBeenCalled());
  const body = JSON.parse(fetch.mock.calls[0][1].body);
  expect(body.description).toBe('Broken letter');
  expect(body.metadata.url).toBe(window.location.href);
  expect(body.metadata.timestamp).toBeTruthy();
  expect(toast.success).toHaveBeenCalledWith('Successfully sent report');
});

test('preserves description on failure and permits retry', async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error('Offline'));
  const close = jest.fn();
  render(<BugReportModal onClose={close} />);
  fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Keep this report' } });
  fireEvent.click(screen.getByText('Send Report'));
  expect(await screen.findByRole('alert')).toHaveTextContent('Failed to send report. Please try again.');
  expect(screen.getByLabelText('Description')).toHaveValue('Keep this report');
  expect(close).not.toHaveBeenCalled();
  expect(screen.getByText('Send Report')).toBeEnabled();
});

test('Escape closes after transition and restores focus', () => {
  jest.useFakeTimers();
  const close = jest.fn();
  render(<BugReportModal onClose={close} />);
  fireEvent.keyDown(screen.getByLabelText('Description'), { key: 'Escape' });
  jest.advanceTimersByTime(180);
  expect(close).toHaveBeenCalled();
  jest.useRealTimers();
});
