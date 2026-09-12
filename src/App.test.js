import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

jest.mock('react-lottie-player', () => () => null);
jest.mock('./components/AdComponent', () => () => null);
jest.mock('./components/AdsterraNativeBanner', () => () => null);
jest.mock('./components/Firefly3D', () => () => null);

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn();
  window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {},
      addEventListener: function() {},
      removeEventListener: function() {},
    };
  };
});

test('renders App without crashing', () => {
  const { container } = render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  expect(container.querySelector('.app-container')).toBeInTheDocument();
});
