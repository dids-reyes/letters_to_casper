import {createLetterImageCopy} from './downloadLetterImage';
jest.mock('html2canvas', () => jest.fn());

test('exports full text and completed headings without modifying the open letter', () => {
  const source = document.createElement('div');
  source.innerHTML = '<div class="letter-paper__head"><div class="letter-info">Fr</div><div class="letter-info">To</div></div><span class="timestamp-text">partial</span><div class="letter-paper__body" style="max-height:336px">partial</div><span class="Typewriter__cursor">|</span><div class="letter-paper__media"><iframe></iframe></div><div class="letter-paper__meta">63 reads</div>';
  const message = '🐻‍❄️ Hello\n'.repeat(25) + '<not markup>';
  const copy = createLetterImageCopy(source, {from:'Shen',to:'Cian',message,date:'May 26, 2024'});
  expect(copy.querySelector('.letter-info')).toHaveTextContent('From: Shen');
  expect(copy.querySelector('.letter-paper__body').textContent).toBe(message);
  expect(copy.querySelector('.letter-paper__body').style.maxHeight).toBe('none');
  expect(copy.querySelector('iframe')).toBeNull();
  expect(copy.querySelector('.Typewriter__cursor')).toBeNull();
  expect(copy.querySelector('.timestamp-text')).toHaveTextContent('May 26, 2024');
  expect(copy.querySelector('.letter-paper__meta')).toHaveTextContent('63 reads');
  expect(source.querySelector('.letter-paper__body')).toHaveTextContent('partial');
});
