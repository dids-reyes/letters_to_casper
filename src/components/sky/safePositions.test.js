import { getSafeStarPosition } from './safePositions';

test.each([[375, 812], [320, 667], [1440, 900]])('whole touch targets avoid exclusions at %sx%s, even on fallback', (width, height) => {
  const zones = [{ x: 0, y: 0, width, height: 120 }, { x: 0, y: height - 320, width, height: 320 }];
  for (const random of [Math.random, () => 0, () => 1]) {
    const point = getSafeStarPosition(width, height, zones, random);
    expect(point).not.toBeNull();
    expect(point.x).toBeGreaterThanOrEqual(40);
    expect(point.x).toBeLessThanOrEqual(width - 40);
    expect(point.y - 32).toBeGreaterThan(120);
    expect(point.y + 32).toBeLessThan(height - 320);
  }
});
test('no unsafe fallback when exclusions fill a short viewport', () => {
  expect(getSafeStarPosition(375, 400, [{ x: 0, y: 0, width: 375, height: 400 }])).toBeNull();
});
