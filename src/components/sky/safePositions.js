// Includes the entire 44px touch target and a little room for drift.
export function getSafeStarPosition(width, height, zones, random = Math.random) {
  const padding = 40;
  const radius = 32;
  const valid = (x, y) => x >= padding && x <= width - padding && y >= padding && y <= height - padding && !zones.some(z =>
    x + radius >= z.x && x - radius <= z.x + z.width && y + radius >= z.y && y - radius <= z.y + z.height);
  for (let i = 0; i < 50; i++) {
    const x = padding + random() * Math.max(0, width - padding * 2);
    const y = padding + random() * Math.max(0, height - padding * 2);
    if (valid(x, y)) return { x, y };
  }
  // Search cells bounded by expanded exclusion edges; never return an unsafe fallback.
  const xs = [padding, width - padding, ...zones.flatMap(z => [z.x - radius - 1, z.x + z.width + radius + 1])].sort((a, b) => a - b);
  const ys = [padding, height - padding, ...zones.flatMap(z => [z.y - radius - 1, z.y + z.height + radius + 1])].sort((a, b) => a - b);
  for (let j = 1; j < ys.length; j++) for (let i = 1; i < xs.length; i++) {
    const x = (xs[i - 1] + xs[i]) / 2;
    const y = (ys[j - 1] + ys[j]) / 2;
    if (valid(x, y)) return { x, y };
  }
  return null; // Very short viewports may have no usable celestial window.
}
