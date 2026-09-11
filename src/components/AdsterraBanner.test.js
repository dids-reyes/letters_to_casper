import React from 'react';
import { render } from '@testing-library/react';
import AdsterraBanner from './AdsterraBanner';

test('renders Adsterra iframe with correct attributes and dimensions', () => {
  const { container } = render(<AdsterraBanner width={300} height={250} />);
  const frame = container.querySelector('iframe');
  expect(frame).toBeInTheDocument();
  expect(frame).toHaveAttribute('title', 'Advertisement from Adsterra');
  expect(frame).toHaveAttribute('width', '300');
  expect(frame).toHaveAttribute('height', '250');
  expect(frame.srcdoc).toContain("b11441d81ff752287d8998911e381515");
  expect(frame.srcdoc).toContain("https://www.highrevenueformat.com/b11441d81ff752287d8998911e381515/invoke.js");
  expect(frame.srcdoc).toContain("atOptions");
});

test('allows custom dimensions and adKey', () => {
  const { container } = render(
    <AdsterraBanner width={728} height={90} adKey="customKey123" />
  );
  const frame = container.querySelector('iframe');
  expect(frame).toHaveAttribute('width', '728');
  expect(frame).toHaveAttribute('height', '90');
  expect(frame.srcdoc).toContain("customKey123");
  expect(frame.srcdoc).toContain("'height': 90");
  expect(frame.srcdoc).toContain("'width': 728");
});

