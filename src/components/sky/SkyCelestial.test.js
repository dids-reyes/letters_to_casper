import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import SkyCelestial from './SkyCelestial';
import * as celestial from './celestial';
import * as weatherService from './weather';

describe('SkyCelestial component', () => {
  beforeEach(() => {
    jest.spyOn(celestial, 'getUserCoordinates').mockResolvedValue({
      lat: 14.5995,
      lon: 120.9842,
    });
    jest.spyOn(weatherService, 'fetchLocalWeather').mockResolvedValue({
      condition: 'overcast',
      obscuration: 'clouds',
      statusText: 'Hidden behind clouds in your local sky',
      summary: 'Overcast',
      cloudCover: 95,
      precipitation: 0,
      temperature: 28,
      isDay: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders active Sun during daytime hours with solar elevation and weather obscuration', async () => {
    // 2026-09-22 12:00 in Manila is midday (04:00 UTC)
    const midday = new Date(Date.UTC(2026, 8, 22, 4, 0, 0));

    await act(async () => {
      render(<SkyCelestial date={midday} />);
    });

    const sunButton = screen.getByRole('button', { name: /Sun:/i });
    expect(sunButton).toBeInTheDocument();
    expect(sunButton).toHaveClass('sky-sun-btn');

    // Click to open Sun details card
    fireEvent.click(sunButton);
    expect(screen.getByRole('dialog', { name: /Sun details/i })).toBeInTheDocument();
    expect(screen.getByText('The Sun')).toBeInTheDocument();
    expect(screen.getByText(/Daylight Hours:/i)).toBeInTheDocument();
    expect(screen.getByText(/Hidden behind clouds in your local sky/i)).toBeInTheDocument();

    // Close button
    fireEvent.click(screen.getByRole('button', { name: 'Close sun details' }));
    expect(screen.queryByRole('dialog', { name: /Sun details/i })).not.toBeInTheDocument();
  });

  test('renders Moon during nighttime hours with weather obscuration', async () => {
    // 2026-09-22 23:00 in Manila is nighttime (15:00 UTC)
    const nighttime = new Date(Date.UTC(2026, 8, 22, 15, 0, 0));

    await act(async () => {
      render(<SkyCelestial date={nighttime} />);
    });

    const moonButton = screen.getByRole('button', { name: /Moon phase:/i });
    expect(moonButton).toBeInTheDocument();
    expect(moonButton).toHaveClass('sky-moon-btn');

    // Click to open Moon details card
    fireEvent.click(moonButton);
    expect(screen.getByRole('dialog', { name: /Moon details:/i })).toBeInTheDocument();
    expect(screen.getByText(/Hidden behind clouds in your local sky/i)).toBeInTheDocument();
  });

  test('forceBody override allows explicitly choosing sun or moon', async () => {
    const midnight = new Date(Date.UTC(2026, 8, 22, 16, 0, 0));

    // Even at midnight, forceBody="sun" renders the Sun
    await act(async () => {
      render(<SkyCelestial date={midnight} forceBody="sun" />);
    });
    expect(screen.getByRole('button', { name: /Sun:/i })).toBeInTheDocument();
  });
});

