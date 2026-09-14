import React from 'react';
import {render, screen, fireEvent, act, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import CrisisSupportDialog from './CrisisSupportDialog';
import {CrisisSupportProvider, useCrisisSupport} from '../context/CrisisSupportContext';

const TestHarness = ({initialMessage = null}) => {
  const {openCrisisModal, triggerBackgroundCrisisCheck} = useCrisisSupport();

  return (
    <div>
      <button
        type="button"
        data-testid="open-btn"
        onClick={() => openCrisisModal({requiresSupport: true})}
      >
        Open
      </button>
      <button
        type="button"
        data-testid="trigger-btn"
        onClick={() => triggerBackgroundCrisisCheck(initialMessage || 'Help me')}
      >
        Trigger Check
      </button>
      <CrisisSupportDialog />
    </div>
  );
};

const renderWithContext = (ui, {initialMessage} = {}) => {
  return render(
    <MemoryRouter>
      <CrisisSupportProvider>
        {ui || <TestHarness initialMessage={initialMessage} />}
      </CrisisSupportProvider>
    </MemoryRouter>
  );
};

describe('CrisisSupportDialog Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does not render dialog initially when modal is closed', () => {
    renderWithContext();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('opens dialog and renders empathetic content and hotlines', () => {
    renderWithContext();
    fireEvent.click(screen.getByTestId('open-btn'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByAltText(/Letters to Casper/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: /Take a Gentle Moment/i})).toBeInTheDocument();
    expect(screen.getByText(/You Matter/i)).toBeInTheDocument();
    expect(screen.getByText(/You don't have to carry this alone/i)).toBeInTheDocument();

    // Hotlines
    const ncmhLink = screen.getByRole('link', {name: /1553/i});
    expect(ncmhLink).toHaveAttribute('href', 'tel:1553');

    const inTouchLink = screen.getByRole('link', {name: /\+63 2 8893 7603/i});
    expect(inTouchLink).toHaveAttribute('href', 'tel:+63288937603');

    // International directories
    const findAHelpline = screen.getByRole('link', {name: /Find A Helpline/i});
    expect(findAHelpline).toHaveAttribute('href', 'https://findahelpline.com');

    const befrienders = screen.getByRole('link', {name: /Befrienders Worldwide/i});
    expect(befrienders).toHaveAttribute('href', 'https://www.befrienders.org');
  });

  test('displays 5-4-3-2-1 grounding tab by default with sensory steps', () => {
    renderWithContext();
    fireEvent.click(screen.getByTestId('open-btn'));

    expect(screen.getByRole('button', {name: /4-7-8 Breathing Pacer/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /5-4-3-2-1 Grounding Method/i})).toBeInTheDocument();

    expect(screen.getByText(/^See$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Feel$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Hear$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Smell$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Taste$/i)).toBeInTheDocument();
  });

  test('switches between 4-7-8 breathing pacer tab and 5-4-3-2-1 grounding method tab', () => {
    renderWithContext();
    fireEvent.click(screen.getByTestId('open-btn'));

    const breathingTab = screen.getByRole('button', {name: /4-7-8 Breathing Pacer/i});
    fireEvent.click(breathingTab);

    const toggleBtn = screen.getByRole('button', {name: /Pause Exercise/i});
    expect(toggleBtn).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByRole('button', {name: /Resume Exercise/i})).toBeInTheDocument();

    const groundingTab = screen.getByRole('button', {name: /5-4-3-2-1 Grounding Method/i});
    fireEvent.click(groundingTab);
    expect(screen.getByText(/^See$/i)).toBeInTheDocument();
  });

  test('clicking on the overlay background does not close the dialog', () => {
    renderWithContext();
    fireEvent.click(screen.getByTestId('open-btn'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const overlay = document.querySelector('.crisis-overlay');
    fireEvent.click(overlay);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('dismiss button closes the dialog', () => {
    renderWithContext();
    fireEvent.click(screen.getByTestId('open-btn'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const dismissBtn = screen.getByRole('button', {name: /I'm okay right now/i});
    fireEvent.click(dismissBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('does not render a close icon button', () => {
    renderWithContext();
    fireEvent.click(screen.getByTestId('open-btn'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    expect(screen.queryByRole('button', {name: /Close dialog/i})).not.toBeInTheDocument();
  });

  test('pressing Escape key closes the dialog', () => {
    renderWithContext();
    fireEvent.click(screen.getByTestId('open-btn'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(window, {key: 'Escape', code: 'Escape'});
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('CrisisSupportContext Background Execution', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('triggers background crisis check and opens modal when requiresSupport is true', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        requiresSupport: true,
        severity: 'crisis',
        reason: 'Severe distress detected',
      }),
    });

    renderWithContext(null, {initialMessage: 'I cannot go on anymore'});

    await act(async () => {
      fireEvent.click(screen.getByTestId('trigger-btn'));
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/crisis-check'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({'Content-Type': 'application/json'}),
      })
    );
  });

  test('triggers background crisis check and does not open modal when requiresSupport is false', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        requiresSupport: false,
        severity: 'none',
      }),
    });

    renderWithContext(null, {initialMessage: 'I miss you, heartbreak'});

    await act(async () => {
      fireEvent.click(screen.getByTestId('trigger-btn'));
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('fails quietly without error when endpoint returns 500 or network error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    renderWithContext(null, {initialMessage: 'Test message'});

    await act(async () => {
      fireEvent.click(screen.getByTestId('trigger-btn'));
    });

    // Should not throw and modal should stay closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
