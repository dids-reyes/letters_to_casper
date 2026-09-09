import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {MemoryRouter, Routes, Route} from 'react-router-dom';
import PrivacyPolicy from './PrivacyPolicy';
import TermsConditions from './TermsConditions';
jest.mock('./AdComponent', () => () => null);
const originalScrollTo = window.scrollTo;
afterEach(() => {window.scrollTo = originalScrollTo;});

test.each(['/privacy_policy', '/terms_and_conditions'])('returns to letters from %s even when scrollTo returns a value', path => {
  window.scrollTo = jest.fn(() => Promise.resolve());
  render(<React.StrictMode><MemoryRouter initialEntries={[path]} future={{v7_startTransition:true,v7_relativeSplatPath:true}}><Routes>
    <Route path="/" element={<h1>Letters home</h1>} />
    <Route path="/privacy_policy" element={<PrivacyPolicy />} />
    <Route path="/terms_and_conditions" element={<TermsConditions />} />
  </Routes></MemoryRouter></React.StrictMode>);
  expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  fireEvent.click(screen.getByRole('link',{name:/Back to letters/i}));
  expect(screen.getByRole('heading',{name:'Letters home'})).toBeInTheDocument();
});
