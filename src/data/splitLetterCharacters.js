import GraphemeSplitter from 'grapheme-splitter';

const fallback = new GraphemeSplitter();

export default function splitLetterCharacters(text) {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter(undefined, {granularity: 'grapheme'});
    return Array.from(segmenter.segment(text), item => item.segment);
  }

  // The legacy splitter predates newer emoji. Keep their ZWJ sequences intact.
  return fallback.splitGraphemes(text).reduce((characters, part) => {
    const last = characters.length - 1;
    if (last >= 0 && (characters[last].endsWith('\u200d') || part.startsWith('\u200d'))) {
      characters[last] += part;
    } else {
      characters.push(part);
    }
    return characters;
  }, []);
}
