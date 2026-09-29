import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import MentalHealthTest from './MentalHealthTest';

describe('MentalHealthTest', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.scrollTo = jest.fn();
  });

  afterEach(() => jest.useRealTimers());

  test('completes the private check-in and shows a result', () => {
    render(<MentalHealthTest />);
    expect(screen.getByRole('link', {name:'Go to Letters to Casper'})).toHaveAttribute('href', 'https://letterstocasper.com/');
    fireEvent.click(screen.getByRole('button', {name:/begin check-in/i}));

    for (let question = 0; question < 10; question += 1) {
      fireEvent.click(screen.getByRole('radio', {name:'Not at all'}));
      act(() => jest.advanceTimersByTime(160));
    }

    expect(screen.getByRole('heading', {name:/lighter strain/i})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name:'Noticing'})).toBeInTheDocument();
    expect(screen.getByAltText('Cover of Noticing')).toBeInTheDocument();
    expect(screen.queryByText(/your safety matters right now/i)).not.toBeInTheDocument();
  });
});
