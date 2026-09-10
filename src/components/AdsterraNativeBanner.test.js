import React from 'react';
import {act, render} from '@testing-library/react';
import AdsterraNativeBanner from './AdsterraNativeBanner';
const originalEnvironment = process.env.NODE_ENV;
afterEach(() => {process.env.NODE_ENV = originalEnvironment;});

test('allows Adsterra preview during local development', () => {
  process.env.NODE_ENV = 'development';
  const {container} = render(<AdsterraNativeBanner />);
  expect(container.querySelector('iframe')).toHaveAttribute('title', 'Advertisement from Adsterra');
});

test('repeated slots have isolated documents and resize only their own frame', () => {
  process.env.NODE_ENV = 'production';
  const {container} = render(<><AdsterraNativeBanner /><AdsterraNativeBanner /></>);
  const frames = container.querySelectorAll('iframe');
  expect(frames).toHaveLength(2);
  frames.forEach(frame => {
    expect(frame.srcdoc).toContain('id="container-eb3aa15be18612df3808d3f37c9745d1"');
    expect(frame.srcdoc).toContain('data-cfasync="false"');
    expect(frame.srcdoc).toContain('/eb3aa15be18612df3808d3f37c9745d1/invoke.js');
  });
  act(() => window.dispatchEvent(new MessageEvent('message', {source:frames[0].contentWindow,data:{type:'ltc-native-ad-resize',height:420}})));
  expect(frames[0].style.height).toBe('420px');
  expect(frames[1].style.height).toBe('300px');
  act(() => window.dispatchEvent(new MessageEvent('message', {data:{type:'ltc-native-ad-resize',height:900}})));
  expect(frames[0].style.height).toBe('420px');
});
