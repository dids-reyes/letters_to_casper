import React from 'react';
import {render} from '@testing-library/react';
import FeedUpdates from './FeedUpdates';

test('ordinary parent renders do not reset the measured layout or scroll', () => {
  const previous = window.ResizeObserver;
  const disconnect = jest.fn();
  window.ResizeObserver = jest.fn(() => ({observe: jest.fn(), disconnect}));
  const view = () => <div className="feed-report__pages"><section>
    <div className="feed-report__lead"><p>Updates</p></div>
    <FeedUpdates>{[1, 2, 3, 4].map(id => <article key={id}><div>Story {id}</div></article>)}</FeedUpdates>
  </section></div>;
  const {container, rerender, unmount} = render(view());
  const list = container.querySelector('.feed-report__updates');
  list.scrollTop = 25;
  const observerCount = window.ResizeObserver.mock.calls.length;
  rerender(view());
  expect(window.ResizeObserver).toHaveBeenCalledTimes(observerCount);
  expect(disconnect).not.toHaveBeenCalled();
  expect(list.scrollTop).toBe(25);
  unmount();
  expect(disconnect).toHaveBeenCalled();
  window.ResizeObserver = previous;
});
