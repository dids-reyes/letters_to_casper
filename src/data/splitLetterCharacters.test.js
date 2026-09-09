import splitLetterCharacters from './splitLetterCharacters';

const originalSegmenter = Intl.Segmenter;
afterEach(() => {Intl.Segmenter = originalSegmenter;});

test.each([false, true])('preserves compound emojis and text (legacy fallback: %s)', legacy => {
  if (legacy) Intl.Segmenter = undefined;
  for (const emoji of ['🐻‍❄️', '❤️‍🔥', '🙂‍↔️', '👩🏽‍💻', '👨‍👩‍👧‍👦', '🇵🇭']) {
    expect(splitLetterCharacters(emoji)).toEqual([emoji]);
    expect(splitLetterCharacters(`Hi ${emoji}!`).join('')).toBe(`Hi ${emoji}!`);
  }
  expect(splitLetterCharacters('a\nb')).toEqual(['a', '\n', 'b']);
  expect(splitLetterCharacters('e\u0301')).toEqual(['e\u0301']);
});
