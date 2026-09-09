import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import OriginsView from './OriginsView';
jest.mock('../data/keys', () => ({render_url:'https://example.test/api/messages', api_key:'test'}));
const originalFetch = global.fetch;
const feature = code => ({properties:{name:code === 'PH_DETAIL' ? 'Philippines detail' : 'Philippines',code},geometry:{type:'Polygon',coordinates:[[[120,10],[121,10],[121,11],[120,10]]]}});
beforeEach(() => {
  global.fetch = jest.fn(async url => ({ok:true,json:async()=>url.includes('origins.json')
    ? {features:[feature('PH'),feature('PH_DETAIL')]}
    : [{country:'PH',city:'Manila',latitude:14.6,longitude:121,count:3}]}));
  window.matchMedia = () => ({matches:true});
  HTMLElement.prototype.scrollTo = jest.fn();
});
afterEach(() => {global.fetch = originalFetch;});
test('opens at Philippines, shows real city totals, switches to world and retains rankings', async () => {
  const close = jest.fn();
  render(<OriginsView onClose={close}><h2>Top Letter Origins</h2></OriginsView>);
  const point = await screen.findByRole('button',{name:'Manila: 3 Letters'});
  expect(screen.getByRole('button',{name:'Philippines'})).toHaveAttribute('aria-pressed','true');
  fireEvent.click(point);
  expect(screen.getByRole('status')).toHaveTextContent('Manila');
  expect(screen.getByRole('status')).toHaveTextContent('3 Letters');
  fireEvent.click(screen.getByRole('button',{name:'Around the world'}));
  expect(screen.getByRole('button',{name:'Around the world'})).toHaveAttribute('aria-pressed','true');
  expect(screen.getByText('Top Letter Origins')).toBeInTheDocument();
  fireEvent.keyDown(document,{key:'Escape'});
  expect(close).toHaveBeenCalled();
});
test('shows a retry action for unavailable map data and restores body scrolling on close', async () => {
  global.fetch.mockResolvedValue({ok:false});
  const {unmount} = render(<OriginsView onClose={()=>{}} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('couldn’t load');
  fireEvent.click(screen.getByRole('button',{name:'Try again'}));
  await waitFor(()=>expect(global.fetch).toHaveBeenCalledTimes(4));
  unmount();
  expect(document.body.style.overflow).not.toBe('hidden');
});
