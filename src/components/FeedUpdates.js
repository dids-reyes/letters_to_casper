import React, {useLayoutEffect, useRef} from 'react';

// Match the first two pages with three single-column rows.
export default function FeedUpdates({children}) {
  const ref = useRef(null);
  const storyCount = React.Children.toArray(children).length;
  useLayoutEffect(() => {
    const list = ref.current;
    const pages = list.closest('.feed-report__pages');
    const lists = Array.from(pages.querySelectorAll('.feed-report__updates--scroll'));
    const leads = lists.map(item => item.previousElementSibling);
    const measure = () => {
      const scrollPositions = lists.map(item => item.scrollTop);
      lists.forEach(item => { item.style.gridTemplateRows = ''; item.style.maxHeight = ''; });
      leads.forEach(lead => { lead.style.minHeight = ''; });
      const leadHeight = Math.max(...leads.map(lead => lead.getBoundingClientRect().height));
      const rowHeights = [0, 0, 0];
      lists.forEach(item => {
        const stories = Array.from(item.children);
        stories.slice(0, 3).forEach((story, index) => {
          rowHeights[index] = Math.max(rowHeights[index], story.getBoundingClientRect().height);
        });
      });
      leads.forEach(lead => { lead.style.minHeight = `${leadHeight}px`; });
      lists.forEach((item, index) => {
        const gap = parseFloat(getComputedStyle(item).rowGap) || 0;
        item.style.gridTemplateRows = rowHeights.map(height => `${height}px`).join(' ');
        item.style.maxHeight = `${rowHeights.reduce((sum, height) => sum + height, 0) + gap * 2}px`;
        item.scrollTop = scrollPositions[index];
      });
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    // Observe text, not the cells whose heights we set, to avoid resize loops.
    lists.forEach(item => Array.from(item.children).forEach(story => observer?.observe(story.lastElementChild)));
    leads.forEach(lead => Array.from(lead.children).forEach(child => observer?.observe(child)));
    window.addEventListener('resize', measure);
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, [storyCount]);
  return <div ref={ref} className="feed-report__updates feed-report__updates--scroll" tabIndex={0} role="region" aria-label="Feed updates, scroll for more">{children}</div>;
}
