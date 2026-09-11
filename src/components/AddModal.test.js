import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

  // Await submission notice dialog
  await waitFor(() => {
    expect(screen.getByText(/Letter received/i)).toBeInTheDocument();
  });

  // Switch to fake timers before transitioning to celebration dialog
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
