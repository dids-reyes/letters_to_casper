import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AddModal from './AddModal';

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

test('renders AddModal without crashing', () => {
  const dummyLetter = { from: '', to: '', message: '' };
  render(
    <AddModal
      showAddModal={true}
      toggleAddModal={jest.fn()}
      newLetter={dummyLetter}
      handleAddLetter={jest.fn()}
      setNewLetter={jest.fn()}
    />
  );
  expect(screen.getByText(/Write your letter/i)).toBeInTheDocument();
});

test('can show the thank-you modal on mount for design testing', () => {
  render(
    <AddModal
      showAddModal={false}
      toggleAddModal={jest.fn()}
      newLetter={{from: '', to: '', message: ''}}
      handleAddLetter={jest.fn()}
      setNewLetter={jest.fn()}
      showShareCelebrationOnMount
    />
  );

  expect(
    screen.getByRole('dialog', {name: /Your words made it here/i})
  ).toBeInTheDocument();
  expect(screen.getByText(/Thank you for sharing/i)).toBeInTheDocument();
  expect(screen.getByText(/email, pin, or reply to a/i)).toHaveTextContent(
    'Support us by using a paid feature:'
  );
  expect(screen.getByText(/email, pin, or reply to a/i)).toHaveTextContent(
    'Paid actions start at ₱2.'
  );
});

test('keeps the reply submit button label as Reply while submitting', async () => {
  let finishSubmission;
  const handleAddLetter = jest.fn(() => new Promise(resolve => { finishSubmission = resolve; }));
  render(
    <AddModal
      showAddModal={true}
      toggleAddModal={jest.fn()}
      newLetter={{from: 'Me', to: 'Casper', message: 'This is my reply message.', link: ''}}
      handleAddLetter={handleAddLetter}
      setNewLetter={jest.fn()}
      variant="reply"
      parentLetter={{_id: 'parent-1', from: 'Casper'}}
    />
  );

  const replyButton = screen.getByRole('button', {name: /^Reply$/i});
  fireEvent.click(replyButton);
  await waitFor(() => expect(handleAddLetter).toHaveBeenCalled());
  expect(replyButton).toHaveTextContent(/^Reply$/);

  await act(async () => { finishSubmission(false); });
});

test.each([
  ['leave a letter', undefined],
  ['write your reply', 'reply'],
])('keeps the pasted service icon fixed in the %s modal', (_label, variant) => {
  jest.useFakeTimers();

  const ModalHarness = () => {
    const [letter, setLetter] = React.useState({
      from: 'Me',
      to: 'Casper',
      message: 'A complete message for testing the media link.',
      link: '',
    });
    return (
      <AddModal
        showAddModal
        toggleAddModal={jest.fn()}
        newLetter={letter}
        setNewLetter={setLetter}
        handleAddLetter={jest.fn()}
        variant={variant}
        parentLetter={variant === 'reply' ? {_id: 'parent-1', from: 'Casper'} : undefined}
      />
    );
  };

  const {container} = render(<ModalHarness />);
  fireEvent.click(screen.getByRole('button', {name: /Add a song or photo/i}));
  const linkInput = screen.getByPlaceholderText('Paste a link from YouTube or Spotify');

  expect(container.querySelector('.compose-link-icon--youtube')).toBeInTheDocument();
  act(() => jest.advanceTimersByTime(5000));
  expect(container.querySelector('.compose-link-icon--spotify')).toBeInTheDocument();
  act(() => jest.advanceTimersByTime(5000));
  expect(container.querySelector('.compose-link-icon--youtube')).toBeInTheDocument();

  fireEvent.change(linkInput, {target: {value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}});
  expect(container.querySelector('.compose-link-icon--youtube')).toBeInTheDocument();
  act(() => jest.advanceTimersByTime(10000));
  expect(container.querySelector('.compose-link-icon--youtube')).toBeInTheDocument();
  expect(container.querySelector('.compose-link-icon--spotify')).toBeNull();

  fireEvent.change(linkInput, {target: {value: 'https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl'}});
  expect(container.querySelector('.compose-link-icon--spotify')).toBeInTheDocument();
  act(() => jest.advanceTimersByTime(10000));
  expect(container.querySelector('.compose-link-icon--spotify')).toBeInTheDocument();
  expect(container.querySelector('.compose-link-icon--youtube')).toBeNull();

  jest.useRealTimers();
});

test('renders Adsterra banner when celebration dialog is displayed', async () => {
  const dummyLetter = { from: 'Alice', to: 'Bob', message: 'Hello this is a test letter for Casper.' };
  const mockHandleAddLetter = jest.fn().mockResolvedValue({ burnKey: 'test-burn-key', letterId: 'letter-123' });
  const mockToggle = jest.fn();
  const mockSetNewLetter = jest.fn();

  const { container } = render(
    <AddModal
      showAddModal={true}
      toggleAddModal={mockToggle}
      newLetter={dummyLetter}
      handleAddLetter={mockHandleAddLetter}
      setNewLetter={mockSetNewLetter}
    />
  );

  // First submit click triggers preview suggestion
  const submitButton = container.querySelector('.submit-button');
  fireEvent.click(submitButton);

  // Second submit click opens submit confirm dialog
  fireEvent.click(submitButton);

  // Confirm dialog appears; check retention agreement checkbox
  const retentionCheckbox = screen.getByRole('checkbox');
  fireEvent.click(retentionCheckbox);

  // Click submit letter in confirmation dialog
  const confirmButton = container.querySelector('.submit-confirm-send');
  fireEvent.click(confirmButton);

  // Await submission notice dialog
  await waitFor(() => {
    expect(screen.getByText(/Letter received/i)).toBeInTheDocument();
  });

  // Click "I Won't Need It" to advance to celebration notice
  const skipButton = screen.getByRole('button', { name: /I Won’t Need It/i });
  fireEvent.click(skipButton);

  // Celebration dialog appears with Adsterra banner
  await waitFor(() => {
    expect(screen.getByText(/Your words made it here\./i)).toBeInTheDocument();
  });

  const bannerFrame = screen.getByTitle('Advertisement from Adsterra');
  expect(bannerFrame).toBeInTheDocument();
  expect(bannerFrame.srcdoc).toContain('b11441d81ff752287d8998911e381515');

  // Verify initial close countdown starts at 5
  const closeBtn = screen.getByRole('button', { name: /Close \(\d\)/i });
  expect(closeBtn).toHaveTextContent(/Close \([1-5]\)/);
  expect(closeBtn).toBeDisabled();
});

test('celebration close button counts down from 5 to 1 then enables Close', async () => {
  const dummyLetter = { from: 'Alice', to: 'Bob', message: 'Hello this is a test letter for Casper.' };
  const mockHandleAddLetter = jest.fn().mockResolvedValue({ burnKey: 'test-burn-key', letterId: 'letter-123' });

  const { container } = render(
    <AddModal
      showAddModal={true}
      toggleAddModal={jest.fn()}
      newLetter={dummyLetter}
      handleAddLetter={mockHandleAddLetter}
      setNewLetter={jest.fn()}
    />
  );

  const submitButton = container.querySelector('.submit-button');
  fireEvent.click(submitButton);
  fireEvent.click(submitButton);

  const retentionCheckbox = screen.getByRole('checkbox');
  fireEvent.click(retentionCheckbox);

  const confirmButton = container.querySelector('.submit-confirm-send');
  fireEvent.click(confirmButton);

  await waitFor(() => {
    expect(screen.getByText(/Letter received/i)).toBeInTheDocument();
  });

  jest.useFakeTimers();

  const skipButton = screen.getByRole('button', { name: /I Won’t Need It/i });
  act(() => {
    fireEvent.click(skipButton);
  });

  // Check initial state: Close (5) and disabled
  const closeButton = screen.getByRole('button', { name: /Close \(5\)/i });
  expect(closeButton).toBeDisabled();
  expect(closeButton).toHaveTextContent('Close (5)');

  // Advance by 1 second: Close (4)
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(closeButton).toHaveTextContent('Close (4)');
  expect(closeButton).toBeDisabled();

  // Advance by 1 second: Close (3)
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(closeButton).toHaveTextContent('Close (3)');
  expect(closeButton).toBeDisabled();

  // Advance by 1 second: Close (2)
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(closeButton).toHaveTextContent('Close (2)');
  expect(closeButton).toBeDisabled();

  // Advance by 1 second: Close (1)
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(closeButton).toHaveTextContent('Close (1)');
  expect(closeButton).toBeDisabled();

  // Advance by 1 second: Close enabled
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(closeButton).toHaveTextContent('Close');
  expect(closeButton).not.toBeDisabled();

  jest.useRealTimers();
});

test('celebration close countdown pauses when user is redirected away and resumes upon return', async () => {
  const dummyLetter = { from: 'Alice', to: 'Bob', message: 'Hello this is a test letter for Casper.' };
  const mockHandleAddLetter = jest.fn().mockResolvedValue({ burnKey: 'test-burn-key', letterId: 'letter-123' });

  const { container } = render(
    <AddModal
      showAddModal={true}
      toggleAddModal={jest.fn()}
      newLetter={dummyLetter}
      handleAddLetter={mockHandleAddLetter}
      setNewLetter={jest.fn()}
    />
  );

  const submitButton = container.querySelector('.submit-button');
  fireEvent.click(submitButton);
  fireEvent.click(submitButton);

  const retentionCheckbox = screen.getByRole('checkbox');
  fireEvent.click(retentionCheckbox);

  const confirmButton = container.querySelector('.submit-confirm-send');
  fireEvent.click(confirmButton);

  await waitFor(() => {
    expect(screen.getByText(/Letter received/i)).toBeInTheDocument();
  });

  jest.useFakeTimers();

  const skipButton = screen.getByRole('button', { name: /I Won’t Need It/i });
  act(() => {
    fireEvent.click(skipButton);
  });

  const closeButton = screen.getByRole('button', { name: /Close \(5\)/i });
  expect(closeButton).toHaveTextContent('Close (5)');
  expect(closeButton).toBeDisabled();

  // Simulate auto popup redirecting user away (blur)
  act(() => {
    window.dispatchEvent(new Event('blur'));
  });

  // Advance time by 5 seconds while user is on another screen
  act(() => {
    jest.advanceTimersByTime(5000);
  });

  // Countdown should still be paused at 5 and disabled!
  expect(closeButton).toHaveTextContent('Close (5)');
  expect(closeButton).toBeDisabled();

  // Simulate user returning to screen (focus)
  act(() => {
    window.dispatchEvent(new Event('focus'));
  });

  // 1 second on screen
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(closeButton).toHaveTextContent('Close (4)');
  expect(closeButton).toBeDisabled();

  // 4 more seconds on screen
  act(() => {
    jest.advanceTimersByTime(4000);
  });
  expect(closeButton).toHaveTextContent('Close');
  expect(closeButton).not.toBeDisabled();

  jest.useRealTimers();
});

test('shows emphasized Allow Location Access callout inside Submit this letter? dialog', () => {
  const dummyLetter = { from: 'Alice', to: 'Bob', message: 'Hello this is a test letter for Casper.' };
  const { container } = render(
    <AddModal
      showAddModal={true}
      toggleAddModal={jest.fn()}
      newLetter={dummyLetter}
      handleAddLetter={jest.fn()}
      setNewLetter={jest.fn()}
    />
  );

  const submitButton = container.querySelector('.submit-button');
  fireEvent.click(submitButton);
  fireEvent.click(submitButton);

  expect(screen.getByText(/Submit this letter\?/i)).toBeInTheDocument();
  expect(screen.getByText(/Allow Location Access for Your Stamp/i)).toBeInTheDocument();
  expect(
    screen.getByText(/only your general location is shown, not your exact location/i)
  ).toBeInTheDocument();
});

test('groups media attachments and optional notification email under collapsed-by-default Advanced Options accordion', async () => {
  const handleAddLetter = jest.fn().mockResolvedValue({ burnKey: 'burn-1', letterId: 'letter-1' });
  const Harness = () => {
    const [letter, setLetter] = React.useState({
      from: 'Alice',
      to: 'Casper',
      message: 'Testing Advanced Options and optional email notifications.',
      link: '',
      email: '',
    });
    return (
      <AddModal
        showAddModal
        toggleAddModal={jest.fn()}
        newLetter={letter}
        setNewLetter={setLetter}
        handleAddLetter={handleAddLetter}
      />
    );
  };

  const { container } = render(<Harness />);
  const advancedToggle = screen.getByRole('button', { name: /Advanced Options/i });
  expect(advancedToggle).toHaveAttribute('aria-expanded', 'false');
  expect(container.querySelector('#compose-optional-extras-content')).toHaveAttribute('hidden');

  // Expand Advanced Options
  fireEvent.click(advancedToggle);
  expect(advancedToggle).toHaveAttribute('aria-expanded', 'true');
  expect(container.querySelector('#compose-optional-extras-content')).not.toHaveAttribute('hidden');
  expect(container.querySelectorAll('.compose-advanced-divider').length).toBe(0);

  const emailInput = screen.getByPlaceholderText('Your email (optional)');
  expect(emailInput).toHaveAttribute('type', 'email');
  expect(
    screen.getByText('Get notified about replies.')
  ).toBeInTheDocument();
  expect(screen.queryByText(/reaction milestones/i)).toBeNull();

  // Invalid email shows error and disables submit
  fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
  expect(screen.getByRole('alert')).toHaveTextContent(/valid email address/i);
  const submitButton = screen.getByRole('button', { name: /Submit Letter/i });
  expect(submitButton).toBeDisabled();

  // Valid email enables submit and persists email + notificationPreferences
  fireEvent.change(emailInput, { target: { value: 'Reader@Example.com' } });
  expect(submitButton).not.toBeDisabled();

  fireEvent.click(submitButton);
  fireEvent.click(submitButton);
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(container.querySelector('.submit-confirm-send'));

  await waitFor(() => {
    expect(handleAddLetter).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'reader@example.com',
        notificationEmail: 'reader@example.com',
        notificationPreferences: {
          replies: true,
          reactionMilestones: [10, 50, 100],
        },
      }),
      expect.any(Function)
    );
  });
});

test('letter preview renders the International Fallback stamp instead of the Default Domestic Fallback stamp', () => {
  const dummyLetter = {
    from: 'Alice',
    to: 'Casper',
    message: 'Hello this is a test letter preview for Casper.',
  };

  const { container } = render(
    <MemoryRouter>
      <AddModal
        showAddModal={true}
        toggleAddModal={jest.fn()}
        newLetter={dummyLetter}
        handleAddLetter={jest.fn()}
        setNewLetter={jest.fn()}
      />
    </MemoryRouter>
  );

  const previewBtn = screen.getByRole('button', { name: /Preview/i });
  fireEvent.click(previewBtn);

  const intlStamp = container.querySelector('.letter-paper__stamp-slot .letter-card__main-stamp--international');
  expect(intlStamp).toBeInTheDocument();
  expect(intlStamp).toHaveAttribute('data-motif', 'global_international');
  expect(container.querySelector('.letter-paper__stamp-slot .letter-card__stamp-wrapper--variant-1')).toBeNull();
});
