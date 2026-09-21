import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { io } from 'socket.io-client';
import Sky from './Sky';

jest.mock('socket.io-client', () => ({ io: jest.fn() }));

describe('Sky Temporary Profile Integration', () => {
  let handlers;
  let socket;

  beforeEach(() => {
    jest.useFakeTimers();
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
  });

  test('modal appears on first visit when initialProfile is null and blocks until submitted', async () => {
    render(<Sky initialProfile={null} />);

    // Verify blocking modal is rendered with required header and notice
    const modal = screen.getByRole('dialog', { name: /Create Your Temporary Soul/i });
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText(/This is a temporary profile for this session only/i)).toBeInTheDocument();

    const submitBtn = within(modal).getByRole('button', { name: /Step Into the Sky/i });
    expect(submitBtn).toBeDisabled();

    // Fill in required fields
    const usernameInput = within(modal).getByLabelText(/Username/i);
    const ageInput = within(modal).getByLabelText(/^Age/i);
    const nonBinaryBtn = within(modal).getByRole('radio', { name: 'Non-binary' });

    fireEvent.change(usernameInput, { target: { value: 'Alex' } });
    fireEvent.change(ageInput, { target: { value: '24' } });
    fireEvent.click(nonBinaryBtn);

    expect(submitBtn).toBeEnabled();

    // Submit modal
    fireEvent.click(submitBtn);

    // Modal is removed
    expect(screen.queryByRole('dialog', { name: /Create Your Temporary Soul/i })).not.toBeInTheDocument();

    // SET_TEMPORARY_PROFILE was emitted to socket
    expect(socket.emit).toHaveBeenCalledWith(
      'SET_TEMPORARY_PROFILE',
      expect.objectContaining({
        username: 'Alex',
        age: 24,
        gender: 'non-binary',
        avatar: null,
        status: 'peaceful',
      }),
      expect.any(Function)
    );
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

    // Name line: Orion, 28 ♂
    expect(card).toHaveTextContent('Orion, 28 ♂');

    // Status line: is feeling sleepy 😴
    expect(card).toHaveTextContent('is feeling sleepy');

    // Tap own star
    const ownStar = screen.getByRole('button', { name: /Your star/i });
    fireEvent.click(ownStar);

    const ownCard = screen.getByRole('dialog', { name: 'Your sky note' });
    expect(ownCard).toBeInTheDocument();
    expect(ownCard).toHaveTextContent('Alex, 24 ⚧');
    expect(ownCard).toHaveTextContent('is feeling');
  });

  test('global chat feed renders 24x24 avatar and username with gender icon', () => {
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

    // Username with gender icon
    expect(chatMsg).toHaveTextContent('Alex ⚧: hello from the stars');
  });
});
