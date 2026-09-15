// Shared projection helpers for turning GeoJSON country outlines into flat
// SVG paths. Both the public OriginsView map and the admin analytics map
// draw from these so the two stay pixel-for-pixel the same map.

export const project = ([lon, lat], local) => local
  ? [(lon - 115) * 40, (22 - lat) * 40]
  : [(lon + 180) * 2, (85 - lat) * 2];

export const outline = (geometry, local) => {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polygons.map(polygon => polygon.map(ring => ring.map((point, i) => {
    const [x, y] = project(point, local);
    return `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ') + 'Z').join(' ')).join(' ');
};

export const countryName = code => {
  try { return new Intl.DisplayNames(['en'], {type: 'region'}).of(code); } catch { return code; }
};

export const letterCount = count => `${count.toLocaleString()} ${count === 1 ? 'Letter' : 'Letters'}`;
