import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import SkyChat, { MoodPicker } from './SkyChat';

test('incoming messages follow the bottom only while the reader has not scrolled up', () => {
  const clock = Date.now();
  const props = { messages: [], connected: true, send: jest.fn(), clock };
  const { rerender } = render(<SkyChat {...props} />);
  const list = screen.getByRole('log');
  Object.defineProperty(list, 'scrollHeight', { configurable: true, value: 1000 });
  Object.defineProperty(list, 'clientHeight', { configurable: true, value: 100 });
  const message = { id: 'a', text: 'hello', soul: 'soul123', createdAt: clock };
  rerender(<SkyChat {...props} messages={[message]} />);
  expect(list.scrollTop).toBe(1000);
  list.scrollTop = 100; fireEvent.scroll(list);
  rerender(<SkyChat {...props} messages={[message, { ...message, id: 'b' }]} />);
  expect(list.scrollTop).toBe(100);
  list.scrollTop = 900; fireEvent.scroll(list);
  rerender(<SkyChat {...props} messages={[message, { ...message, id: 'c' }]} />);
  expect(list.scrollTop).toBe(1000);
});

test('MoodPicker defaults to empty Status and opens anchored selection dropdown on click', () => {
  const handleChange = jest.fn();
  const { container } = render(<MoodPicker value="" onChange={handleChange} />);

  // By default, displays empty Status
  const button = container.querySelector('.sky-mood-btn');
  expect(button).toBeInTheDocument();
  expect(button).toHaveTextContent('Status');

  // Menu is closed by default
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

  // Clicking button opens anchored listbox menu
  fireEvent.click(button);
  const listbox = screen.getByRole('listbox', { name: 'Status options' });
  expect(listbox).toBeInTheDocument();

  // Selecting a mood calls onChange and closes menu
  const sleepyOption = within(listbox).getByText(/sleepy/i);
  fireEvent.click(sleepyOption);
  expect(handleChange).toHaveBeenCalledWith('sleepy');
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});

test('MoodPicker allows resetting back to empty Status', () => {
  const handleChange = jest.fn();
  const { container } = render(<MoodPicker value="peaceful" onChange={handleChange} />);

  const button = container.querySelector('.sky-mood-btn');
  expect(button).toHaveTextContent('peaceful');
  // Selected status button displays only the status name, without the emoji
  expect(button).not.toHaveTextContent('😌');

  fireEvent.click(button);
  const listbox = screen.getByRole('listbox', { name: 'Status options' });
  const statusOption = within(listbox).getByText('Status');
  fireEvent.click(statusOption);

  expect(handleChange).toHaveBeenCalledWith('');
});

test('MoodPicker options place the status name before the emoji', () => {
  const { container } = render(<MoodPicker value="" onChange={jest.fn()} />);
  const button = container.querySelector('.sky-mood-btn');
  fireEvent.click(button);

  const listbox = screen.getByRole('listbox', { name: 'Status options' });
  const sleepyItem = within(listbox).getByRole('option', { name: /sleepy/i });
  expect(sleepyItem).toBeInTheDocument();

  // The text order is status name first, then emoji
  expect(sleepyItem.textContent).toMatch(/^sleepy\s*😴$/i);
});

test('MoodPicker displays emoji along with status name when showEmoji is true (tooltip mode)', () => {
  const { container } = render(<MoodPicker value="peaceful" onChange={jest.fn()} showEmoji />);
  const button = container.querySelector('.sky-mood-btn');
  expect(button).toHaveTextContent('peaceful');
  expect(button).toHaveTextContent('😌');
});
