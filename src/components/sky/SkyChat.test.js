import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import SkyChat, {
  GLOBAL_CHAT_TTL_MS,
  PRIVATE_CHAT_TTL_MS,
  MoodPicker,
  soulName,
  defaultAnonymousUsername,
  formatChatTimestamp,
  isChatMessageFresh,
} from './SkyChat';

test('global messages expire after 10 minutes while private messages retain 30 minutes', () => {
  const clock = Date.now();
  const globalMessage = { createdAt: clock - GLOBAL_CHAT_TTL_MS };
  const privateMessage = { createdAt: clock - GLOBAL_CHAT_TTL_MS, sessionId: 'private-1' };

  expect(isChatMessageFresh(globalMessage, clock)).toBe(false);
  expect(isChatMessageFresh(privateMessage, clock)).toBe(true);
  expect(isChatMessageFresh({ ...privateMessage, createdAt: clock - PRIVATE_CHAT_TTL_MS }, clock)).toBe(false);
});

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

test('renders compact avatar alongside chat message with 12px dimensions', () => {
  const clock = Date.now();
  const message = { id: 'm1', text: 'hi', soul: 'soul123', createdAt: clock };
  const { container } = render(<SkyChat messages={[message]} connected={true} send={jest.fn()} clock={clock} />);

  const avatar = container.querySelector('.sky-chat-avatar');
  expect(avatar).toBeInTheDocument();

  const placeholder = container.querySelector('.sky-chat-avatar-placeholder');
  expect(placeholder).toBeInTheDocument();
  expect(placeholder).toHaveAttribute('width', '12');
  expect(placeholder).toHaveAttribute('height', '12');
});

test('renders compact relative timestamps beside global chat messages', () => {
  const clock = Date.now();
  const messages = [
    { id: 'now', text: 'hello', soul: 'soul123', createdAt: clock - 12000 },
    { id: 'minute', text: 'still here', soul: 'soul456', createdAt: clock - 60000 },
  ];
  render(<SkyChat messages={messages} connected={true} send={jest.fn()} clock={clock} />);

  expect(screen.getByText('just now')).toBeInTheDocument();
  expect(screen.getByText('1m ago')).toBeInTheDocument();
  expect(formatChatTimestamp(clock - 30 * 60000, clock)).toBe('30m ago');
});

test('aligns a font-sized globe icon after the Global Chat label', () => {
  const { container } = render(
    <SkyChat messages={[]} connected={true} send={jest.fn()} clock={Date.now()} />
  );

  expect(screen.getByText('Global Chat')).toBeInTheDocument();
  const icon = container.querySelector('.sky-chat-title-icon');
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveAttribute('width', '1em');
  expect(icon).toHaveAttribute('height', '1em');
});

test('requires confirmation before leaving a private chat', () => {
  const leave = jest.fn();
  const props = {
    messages: [],
    session: { sessionId: 'private-1', peer: { soul: 'Orion' } },
    connected: true,
    send: jest.fn(),
    leave,
    clock: Date.now(),
  };
  render(<SkyChat {...props} />);

  fireEvent.click(screen.getByRole('button', { name: 'Leave chat' }));
  expect(leave).not.toHaveBeenCalled();
  expect(screen.getByRole('dialog', { name: 'Leave this chat?' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.queryByRole('dialog', { name: 'Leave this chat?' })).not.toBeInTheDocument();
  expect(leave).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', { name: 'Leave chat' }));
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Leave this chat?' })).getByRole('button', { name: 'Leave chat' }));
  expect(leave).toHaveBeenCalledTimes(1);
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

test('MoodPicker includes alone, depressed, and anxious status options and renamed lonely to alone', () => {
  const handleChange = jest.fn();
  const { container } = render(<MoodPicker value="" onChange={handleChange} />);
  const button = container.querySelector('.sky-mood-btn');
  fireEvent.click(button);

  const listbox = screen.getByRole('listbox', { name: 'Status options' });

  // Alone replaces lonely
  const aloneOption = within(listbox).getByRole('option', { name: 'alone' });
  expect(aloneOption).toBeInTheDocument();
  expect(aloneOption.textContent).toMatch(/^alone\s*🥺$/i);
  expect(within(listbox).queryByRole('option', { name: 'lonely' })).not.toBeInTheDocument();

  // Depressed option
  const depressedOption = within(listbox).getByRole('option', { name: 'depressed' });
  expect(depressedOption).toBeInTheDocument();
  expect(depressedOption.textContent).toMatch(/^depressed\s*😞$/i);

  // Anxious option
  const anxiousOption = within(listbox).getByRole('option', { name: 'anxious' });
  expect(anxiousOption).toBeInTheDocument();
  expect(anxiousOption.textContent).toMatch(/^anxious\s*😰$/i);

  // Clicking depressed calls onChange
  fireEvent.click(depressedOption);
  expect(handleChange).toHaveBeenCalledWith('depressed');
});

describe('defaultAnonymousUsername & soulName identifier constraints', () => {
  test('constrains identifier to maximum of 8 characters', () => {
    // 20-character socket id
    expect(defaultAnonymousUsername('w6K_8yN3h9Q0e1P2a3B4')).toBe('soulw6K_8yN3');
    // Long numeric string
    expect(defaultAnonymousUsername('1234567890123')).toBe('soul12345678');
    // Already prefixed with soul
    expect(defaultAnonymousUsername('soul_k39f8a1bc490d8e2f')).toBe('soulk39f8a1b');
    // Preserves capitalization if prefixed with Soul
    expect(defaultAnonymousUsername('SoulLongIdentifier123')).toBe('SoulLongIden');
  });

  test('constrains identifier to minimum of 3 characters with 0 padding', () => {
    expect(defaultAnonymousUsername('7')).toBe('soul007');
    expect(defaultAnonymousUsername('42')).toBe('soul042');
    expect(defaultAnonymousUsername('ab')).toBe('soul0ab');
    expect(defaultAnonymousUsername('soul5')).toBe('soul005');
  });

  test('preserves identifiers already between 3 and 8 characters', () => {
    expect(defaultAnonymousUsername('1042')).toBe('soul1042');
    expect(defaultAnonymousUsername('soul777')).toBe('soul777');
    expect(defaultAnonymousUsername('soul123')).toBe('soul123');
    expect(defaultAnonymousUsername('starlight')).toBe('soulstarligh');
  });

  test('soulName applies identifier constraints to anonymous visitors and leaves custom usernames unchanged', () => {
    // Custom usernames preserved
    expect(soulName({ username: 'Orion' })).toBe('Orion');
    expect(soulName({ username: 'StarGazer' })).toBe('StarGazer');

    // Long default usernames formatted
    expect(soulName({ username: 'soulw6K_8yN3h9Q0e1P2a3B4' })).toBe('soulw6K_8yN3');
    expect(soulName({ soul: 'soul_k39f8a1bc490d8e2f' })).toBe('soulk39f8a1b');

    // Person with only id formatted
    expect(soulName({ id: '1042' })).toBe('soul1042');
    expect(soulName({ id: 'w6K_8yN3h9Q0e1P2a3B4' })).toBe('soulw6K_8yN3');
    expect(soulName({ id: '7' })).toBe('soul007');
  });
});
