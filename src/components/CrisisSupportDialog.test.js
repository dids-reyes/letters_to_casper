import React from 'react';
import {render, screen, fireEvent, act, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import CrisisSupportDialog from './CrisisSupportDialog';
import {CrisisSupportProvider, useCrisisSupport} from '../context/CrisisSupportContext';

const TestHarness = ({analysisRequest = null}) => {
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
        onClick={() => triggerBackgroundCrisisCheck(analysisRequest || {letterId: 'letter-1', burnKey: 'LTC-1111-2222-3333-4444-5555-6666'})}
      >
        Trigger Check
      </button>
      <CrisisSupportDialog />
    </div>
  );
};

const renderWithContext = (ui, {analysisRequest} = {}) => {
  return render(
    <MemoryRouter>
      <CrisisSupportProvider>
        {ui || <TestHarness analysisRequest={analysisRequest} />}
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
    const hopelineLink = screen.getByRole('link', {name: /0917-558-4673/i});
    expect(hopelineLink).toHaveAttribute('href', 'tel:09175584673');
    expect(screen.getAllByText(/Online 24\/7/i)).toHaveLength(2);
    expect(screen.getAllByText(/^Free$/i)).toHaveLength(2);

    const ncmhLink = screen.getByRole('link', {name: /1553/i});
    expect(ncmhLink).toHaveAttribute('href', 'tel:1553');
    expect(screen.queryByText(/In Touch Community Services/i)).not.toBeInTheDocument();

    // International directories
    const findAHelpline = screen.getByRole('link', {name: /Find A Helpline/i});
    expect(findAHelpline).toHaveAttribute('href', 'https://findahelpline.com');

    const befrienders = screen.getByRole('link', {name: /Befrienders Worldwide/i});
    expect(befrienders).toHaveAttribute('href', 'https://www.befrienders.org');
  });

  test('displays the first grounding task and reveals each remaining task in sequence', () => {
    renderWithContext();
    fireEvent.click(screen.getByTestId('open-btn'));

    expect(screen.getByRole('button', {name: /4-7-8 Breathing Pacer/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /5-4-3-2-1 Grounding Method/i})).toBeInTheDocument();

    expect(screen.getByText(/^See$/i)).toBeInTheDocument();
    expect(screen.queryByText(/^Feel$/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: /Done, continue/i}));
    expect(screen.getByText(/^Feel$/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: /Done, continue/i}));
    expect(screen.getByText(/^Hear$/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: /Done, continue/i}));
    expect(screen.getByText(/^Smell$/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: /Done, continue/i}));
    expect(screen.getByText(/^Taste$/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: /Finish exercise/i}));
    expect(screen.getByText(/We hope you feel a little steadier/i)).toBeInTheDocument();
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

  test('opens and closes the prank call information dialog', () => {
    renderWithContext();
    fireEvent.click(screen.getByTestId('open-btn'));

    fireEvent.click(screen.getByRole('button', {name: /About prank calls/i}));
    expect(screen.getByRole('dialog', {name: /Prank calls/i})).toBeInTheDocument();
    expect(screen.getByText(/Prank calls can delay help/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: /I understand/i}));
    expect(screen.queryByRole('dialog', {name: /Prank calls/i})).not.toBeInTheDocument();
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

  test('polls background analysis and opens modal when requiresSupport is true', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        pending: false,
        crisis: {
          requiresSupport: true,
          severity: 'crisis',
          reason: 'Severe distress detected',
        },
      }),
    });

    renderWithContext();

    await act(async () => {
      fireEvent.click(screen.getByTestId('trigger-btn'));
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/letter-1/analysis-status?burnKey='),
      expect.objectContaining({
        headers: expect.objectContaining({'x-api-key': expect.any(String)}),
      })
    );
  });

  test('triggers background crisis check and does not open modal when requiresSupport is false', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        pending: false,
        crisis: {requiresSupport: false, severity: 'none'},
      }),
    });

    renderWithContext();

    await act(async () => {
      fireEvent.click(screen.getByTestId('trigger-btn'));
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('fails quietly without error when endpoint returns 500 or network error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    renderWithContext();

    await act(async () => {
      fireEvent.click(screen.getByTestId('trigger-btn'));
    });

    // Should not throw and modal should stay closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
