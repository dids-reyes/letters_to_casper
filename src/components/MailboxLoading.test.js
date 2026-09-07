import React from 'react';
import {act, render, screen} from '@testing-library/react';
import MailboxLoading from './MailboxLoading';

jest.mock('react-lottie-player', () => () => null);
const originalMatchMedia = window.matchMedia;
beforeEach(() => {
  jest.useFakeTimers();
  window.matchMedia = jest.fn(() => ({matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn()}));
});
afterEach(() => {
  jest.useRealTimers();
  window.matchMedia = originalMatchMedia;
});

test('introduces the extended animation and updates messages throughout a long wait', () => {
  const {unmount} = render(<MailboxLoading />);
  expect(screen.getByText('Opening the mailbox…')).toBeInTheDocument();
  expect(screen.queryByText('Some words are worth waiting for.')).not.toBeInTheDocument();
  act(() => jest.advanceTimersByTime(8000));
  expect(screen.getByText('A sleepy mailbox. A little patience.')).toBeInTheDocument();
  expect(screen.getByText('Some words are worth waiting for.')).toBeInTheDocument();
  act(() => jest.advanceTimersByTime(10000));
  expect(screen.getByText('A little courage can fit inside a letter.')).toBeInTheDocument();
  act(() => jest.advanceTimersByTime(42000));
  expect(screen.getByText(/This is taking longer than usual/)).toBeInTheDocument();
  unmount();
  expect(jest.getTimerCount()).toBe(0);
});
