import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { io } from 'socket.io-client';
import Sky from './Sky';
import { SKY_SESSION_STORAGE_KEY } from './session';

jest.mock('socket.io-client', () => ({ io: jest.fn() }));

describe('Sky Temporary Profile & Mobile Layout Integration', () => {
  let handlers;
  let socket;

  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    sessionStorage.clear();
    process.env.REACT_APP_SKY_SOCKET_URL = 'https://sky.example';
    handlers = {};
    socket = {
      connected: true,
      on: jest.fn((name, fn) => {
        handlers[name] = fn;
      }),
      connect: jest.fn(),
      disconnect: jest.fn(),
      removeAllListeners: jest.fn(),
      timeout: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
    socket.volatile = socket;
    io.mockReturnValue(socket);
    HTMLCanvasElement.prototype.getContext = jest.fn(() => null);
    window.matchMedia = jest.fn(() => ({ matches: true }));
  });

  afterEach(() => {
    jest.useRealTimers();
    delete process.env.REACT_APP_SKY_SOCKET_URL;
    localStorage.clear();
    sessionStorage.clear();
  });

  test('non-blocking entry: does not block user with setup modal and shows onboarding tooltip', () => {
    render(<Sky initialProfile={null} />);

    // No modal initially blocks user
    expect(screen.queryByRole('dialog', { name: /Create Your Temporary Profile/i })).not.toBeInTheDocument();

    // Top-right profile trigger exists
    const trigger = screen.getByRole('button', { name: /Customize profile/i });
    expect(trigger).toBeInTheDocument();

    // Onboarding tooltip hint is displayed
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent(
      "Customize your temporary profile here to request chats and get accepted, show you're not an alien!"
    );

    // Dismissing tooltip removes it
    const dismissBtn = screen.getByRole('button', { name: 'Dismiss hint' });
    fireEvent.click(dismissBtn);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // Clicking top-right trigger opens profile editor on demand
    fireEvent.click(trigger);
    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText(/This is a temporary profile for this session only/i)).toBeInTheDocument();

    // Fill in profile fields
    const usernameInput = within(modal).getByLabelText(/Username/i);
    const ageInput = within(modal).getByLabelText(/^Age/i);
    const nonBinaryBtn = within(modal).getByRole('radio', { name: 'Non-binary' });

    fireEvent.change(usernameInput, { target: { value: 'Alex' } });
    fireEvent.change(ageInput, { target: { value: '24' } });
    fireEvent.click(nonBinaryBtn);

    const submitBtn = within(modal).getByRole('button', { name: /Step Into the Sky|Save Profile/i });
    expect(submitBtn).toBeEnabled();
    fireEvent.click(submitBtn);

    // Modal closes
    expect(screen.queryByRole('dialog', { name: /Create Your Temporary Profile/i })).not.toBeInTheDocument();

    // Emits SET_TEMPORARY_PROFILE to socket
    expect(socket.emit).toHaveBeenCalledWith(
      'SET_TEMPORARY_PROFILE',
      expect.objectContaining({
        username: 'Alex',
        age: 24,
        gender: 'non-binary',
        avatar: null,
      }),
      expect.any(Function)
    );

    fireEvent.click(trigger);
    const reopenedModal = screen.getByRole('dialog', { name: /Create Your Temporary Profile/i });
    expect(within(reopenedModal).getByLabelText(/Username/i)).toHaveValue('');
    expect(within(reopenedModal).getByLabelText(/^Age/i)).toHaveValue(null);
    expect(within(reopenedModal).queryByAltText('Avatar preview')).not.toBeInTheDocument();
  });

  test('default anonymous profile assigns soul<id> with unset age and gender', () => {
    render(<Sky initialProfile={null} />);

    // Connect to sky with selfId 1042
    act(() => {
      handlers.sky_state({
        selfId: '1042',
        participants: [
          {
            id: '1042',
            x: 0.3,
            y: 0.3,
          },
        ],
      });
    });

    // Tap own star
    const ownStar = screen.getByRole('button', { name: /Your star/i });
    fireEvent.click(ownStar);

    const card = screen.getByRole('dialog', { name: 'Your sky note' });
    expect(card).toBeInTheDocument();

    // Cleanly displays soul1042 without trailing comma or broken spacing
    const nameRow = card.querySelector('.sky-star-name-row');
    expect(nameRow).toBeInTheDocument();
    expect(nameRow.textContent.trim()).toBe('soul1042');
    expect(card).not.toHaveTextContent('soul1042,');
    expect(card.querySelector('.sky-star-gender')).toBeNull();
  });

  test('star tap modal displays 48x48 avatar frame, username, age, gender, and status line', () => {
    render(
      <Sky
        initialProfile={{
          username: 'Alex',
          age: 24,
          gender: 'non-binary',
          avatar: null,
          status: 'peaceful',
        }}
      />
    );

    act(() => {
      handlers.sky_state({
        selfId: 'self-1',
        participants: [
          {
            id: 'self-1',
            x: 0.3,
            y: 0.3,
            username: 'Alex',
            age: 24,
            gender: 'non-binary',
            mood: 'peaceful',
            avatar: null,
          },
          {
            id: 'visitor-2',
            x: 0.7,
            y: 0.7,
            username: 'Orion',
            age: 28,
            gender: 'male',
            mood: 'sleepy',
            avatar: 'data:image/webp;base64,mockAvatarData',
          },
        ],
      });
    });

    // Tap visitor star
    const visitorStar = screen.getByRole('button', { name: /Quiet soul 2/i });
    fireEvent.click(visitorStar);

    // Soul card opens
    const card = screen.getByRole('dialog', { name: 'A quiet note' });
    expect(card).toBeInTheDocument();

    // Contains 48x48 avatar frame with image
    const avatarImg = card.querySelector('.sky-star-avatar-img');
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute('src', 'data:image/webp;base64,mockAvatarData');

    expect(card).toHaveTextContent('Orion, 28');
    expect(card.querySelector('.sky-star-gender svg')).toBeInTheDocument();

    // Status line: is feeling sleepy 😴
    expect(card).toHaveTextContent('is feeling sleepy');

    // Tap own star
    const ownStar = screen.getByRole('button', { name: /Your star/i });
    fireEvent.click(ownStar);

    const ownCard = screen.getByRole('dialog', { name: 'Your sky note' });
    expect(ownCard).toBeInTheDocument();
    expect(ownCard).toHaveTextContent('Alex, 24');
    expect(ownCard.querySelector('.sky-star-gender svg')).toBeInTheDocument();
    expect(ownCard).toHaveTextContent('is feeling');
  });

  test('global chat feed renders the avatar and username without gender', () => {
    render(
      <Sky
        initialProfile={{
          username: 'Alex',
          age: 24,
          gender: 'non-binary',
        }}
      />
    );

    act(() => {
      handlers.sky_state({
        selfId: 'self-1',
        participants: [{ id: 'self-1', x: 0.3, y: 0.3 }],
      });
    });

    // Receive chat message with profile metadata
    act(() => {
      handlers.chat_message({
        id: 'msg-1',
        senderId: 'visitor-2',
        username: 'Alex',
        gender: 'non-binary',
        avatar: 'data:image/webp;base64,mockChatAvatar',
        text: 'hello from the stars',
        createdAt: Date.now(),
      });
    });

    expect(screen.getByText('hello from the stars')).toBeInTheDocument();
    const chatMsg = screen.getByText('hello from the stars').closest('.sky-chat-message');
    expect(chatMsg).toBeInTheDocument();

    // 24x24 avatar image
    const avatarImg = chatMsg.querySelector('.sky-chat-avatar-img');
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute('src', 'data:image/webp;base64,mockChatAvatar');

    expect(chatMsg).toHaveTextContent('Alex: hello from the stars');
    expect(chatMsg.querySelector('.sky-chat-gender')).toBeNull();
  });

  test('disconnect purges the temporary profile, chat cache, storage, and modal defaults', () => {
    localStorage.setItem(SKY_SESSION_STORAGE_KEY, JSON.stringify({
      profile: { username: 'Cassiopeia', age: 26, gender: 'female' },
      lastActiveAt: Date.now(),
    }));

    render(<Sky initialProfile={{
      username: 'Cassiopeia',
      age: 26,
      gender: 'female',
      avatar: 'data:image/webp;base64,temporaryAvatar',
      status: 'peaceful',
    }} />);

    act(() => {
      handlers.sky_state({
        selfId: 'self-99',
        participants: [{ id: 'self-99', x: 0.5, y: 0.5 }],
      });
      handlers.chat_message({
        id: 'temporary-message',
        senderId: 'self-99',
        soul: 'Cassiopeia',
        text: 'Temporary words',
        createdAt: Date.now(),
      });
    });

    expect(screen.getByText('Temporary words')).toBeInTheDocument();
    expect(screen.getByAltText('Your profile avatar')).toHaveAttribute('src', 'data:image/webp;base64,temporaryAvatar');
    expect(localStorage.getItem(SKY_SESSION_STORAGE_KEY)).toBeNull();

    act(() => handlers.disconnect());

    expect(screen.queryByText('Temporary words')).not.toBeInTheDocument();
    expect(screen.queryByAltText('Your profile avatar')).not.toBeInTheDocument();
    expect(localStorage.getItem(SKY_SESSION_STORAGE_KEY)).toBeNull();

    act(() => handlers.chat_message({
      id: 'late-message',
      senderId: 'self-99',
      soul: 'Cassiopeia',
      avatar: 'data:image/webp;base64,temporaryAvatar',
      text: 'Late stale words',
      createdAt: Date.now(),
    }));
    expect(screen.queryByText('Late stale words')).not.toBeInTheDocument();

    act(() => handlers.sky_state({
      selfId: 'fresh-1',
      participants: [{ id: 'fresh-1', x: 0.5, y: 0.5 }],
    }));
    fireEvent.click(screen.getByRole('button', { name: /Customize profile/i }));
    const modal = screen.getByRole('dialog', { name: /Create Your Temporary Profile/i });
    expect(within(modal).getByLabelText(/Username/i)).toHaveValue('');
    expect(within(modal).getByLabelText(/^Age/i)).toHaveValue(null);
    expect(within(modal).queryByAltText('Avatar preview')).not.toBeInTheDocument();
  });
});
