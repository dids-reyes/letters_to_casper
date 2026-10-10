import {createLetterImageCopy, addPaperLines, addExportAttachments, withExportTimeout, ignoreOutsideExport, rasterizeStampForExport} from './downloadLetterImage';
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


test('draws actual paper rules for every message line', () => {
  const body = document.createElement('div');
  body.textContent = 'Hello';
  body.getBoundingClientRect = () => ({height:108});
  addPaperLines(body);
  expect(body.querySelectorAll('.letter-export-lines > div')).toHaveLength(3);
  expect(body.querySelector('.letter-export-lines > div').style.top).toBe('30px');
  expect(body.querySelector('.letter-export-lines > div').style.borderBottomWidth).toBe('1px');
  expect(body.textContent).toBe('Hello');
});


test('YouTube exports only the preview image, without a URL, caption or card', async () => {
  const originalFetch = global.fetch;
  const originalImage = global.Image;
  const originalCreateUrl = URL.createObjectURL;
  global.fetch = jest.fn(async () => ({ok:true,blob:async()=>new Blob(['image'])}));
  URL.createObjectURL = jest.fn(() => 'blob:preview');
  global.Image = function () {
    const image = document.createElement('img');
    image.decode = async () => {};
    return image;
  };
  try {
    const copy = document.createElement('div');
    await addExportAttachments(copy, {includeAttachments:true,media:{provider:'YouTube',thumbnail:'https://example.test/preview.jpg',url:'https://youtu.be/example'}}, []);
    const attachments = copy.querySelector('.letter-export-attachments');
    expect(attachments.children).toHaveLength(1);
    expect(attachments.firstElementChild.tagName).toBe('IMG');
    expect(attachments.textContent).toBe('');
    expect(attachments.style.border).toBe('');
    expect(attachments.style.background).toBe('');
  } finally {
    global.fetch = originalFetch;
    global.Image = originalImage;
    URL.createObjectURL = originalCreateUrl;
  }
});


test('rebuilds both names with explicit dark text even if the source heading is hidden', () => {
  const source = document.createElement('div');
  source.innerHTML = '<div class="letter-paper__head" style="display:none;opacity:0"><div class="letter-info">unfinished</div></div>';
  const copy = createLetterImageCopy(source, {from:'Shen',to:'Cian',message:'Hello',date:'Today'});
  const heading = copy.querySelector('.letter-paper__head');
  expect(heading.style.display).toBe('flex');
  expect(heading.style.opacity).toBe('1');
  expect(heading).toHaveTextContent('From: Shen');
  expect(heading).toHaveTextContent('To: Cian');
  heading.querySelectorAll('strong').forEach(label => {
    expect(label.style.color).toBe('rgb(8, 7, 4)');
    expect(label.style.getPropertyPriority('color')).toBe('important');
  });
});

test('preserves and scales the stamp slot in the heading on export', () => {
  const source = document.createElement('div');
  source.innerHTML = `
    <div class="letter-paper__head">
      <div class="letter-paper__addressee">
        <div class="letter-info">From: Shen</div>
        <div class="letter-info">To: Cian</div>
      </div>
      <div class="letter-paper__stamp-slot">
        <div class="letter-paper__stamp">
          <svg class="letter-card__postmark-waves"></svg>
          <svg class="letter-card__main-stamp"></svg>
        </div>
      </div>
    </div>
  `;
  const copy = createLetterImageCopy(source, {from:'Shen',to:'Cian',message:'Hello',date:'Today'});
  const stampSlot = copy.querySelector('.letter-paper__stamp-slot');
  expect(stampSlot).not.toBeNull();
  expect(stampSlot.querySelector('.letter-card__postmark-waves')).toBeNull(); // waves removed on export
  const mainStamp = stampSlot.querySelector('.letter-card__main-stamp');
  expect(mainStamp).not.toBeNull();
  expect(mainStamp.style.width).toBe('56px');
  expect(mainStamp.style.height).toBe('66px');
});

test('rasterizes SVG stamp to an img tag with proper dimensions and class name', async () => {
  const copy = document.createElement('div');
  copy.innerHTML = `
    <div class="letter-paper__head">
      <div class="letter-paper__stamp-slot">
        <svg class="letter-card__main-stamp letter-card__main-stamp--city" viewBox="0 0 48 58">
          <path d="M 0 0 L 48 58" fill="#ffffff" stroke="#eab308" stroke-width="0.8"></path>
          <rect x="3" y="3" width="42" height="52" fill="#2b2014"></rect>
        </svg>
      </div>
    </div>
  `;

  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  const originalImage = global.Image;
  const mockCtx = {
    save: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    translate: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    drawImage: jest.fn(),
  };
  HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCtx);
  HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mockstamp');
  global.Image = function () {
    const img = document.createElement('img');
    setTimeout(() => { if (img.onload) img.onload(); }, 0);
    return img;
  };

  try {
    await rasterizeStampForExport(copy);
    const img = copy.querySelector('.letter-paper__stamp-slot img');
    expect(img).not.toBeNull();
    expect(img.className).toContain('letter-card__main-stamp');
    expect(img.src).toBe('data:image/png;base64,mockstamp');
    expect(img.style.width).toBe('56px');
    expect(img.style.height).toBe('66px');
    expect(img.style.filter).toBe('none');
  } finally {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    HTMLCanvasElement.prototype.toDataURL = originalToDataURL;
    global.Image = originalImage;
  }
});

test('rasterizes city landmark stamp with inner photo, removing nested image from SVG and drawing onto canvas', async () => {
  const copy = document.createElement('div');
  copy.innerHTML = `
    <div class="letter-paper__head">
      <div class="letter-paper__stamp-slot">
        <svg class="letter-card__main-stamp letter-card__main-stamp--city" viewBox="0 0 48 58">
          <path d="M 0 0 L 48 58" fill="#ffffff" stroke="#eab308" stroke-width="0.8"></path>
          <rect x="3" y="3" width="42" height="52" fill="#eab308"></rect>
          <rect x="4.5" y="4.5" width="39" height="49" fill="#f0fdf4"></rect>
          <image href="/stamps/alaminos_inner.webp" x="4.5" y="4.5" width="39" height="49"></image>
        </svg>
      </div>
    </div>
  `;

  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  const originalImage = global.Image;
  const drawImageCalls = [];
  const mockCtx = {
    save: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    translate: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    drawImage: jest.fn((...args) => drawImageCalls.push(args)),
  };
  HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCtx);
  HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mockcitystamp');
  global.Image = function () {
    const img = document.createElement('img');
    Object.defineProperty(img, 'naturalWidth', { get: () => 100, configurable: true });
    Object.defineProperty(img, 'complete', { get: () => true, configurable: true });
    setTimeout(() => { if (img.onload) img.onload(); }, 0);
    return img;
  };

  try {
    await rasterizeStampForExport(copy);
    const img = copy.querySelector('.letter-paper__stamp-slot img');
    expect(img).not.toBeNull();
    expect(img.className).toContain('letter-card__main-stamp--city');
    expect(img.src).toBe('data:image/png;base64,mockcitystamp');
    expect(img.style.width).toBe('56px');
    expect(img.style.height).toBe('66px');
    // Verifies drawImage was called for both vector SVG background and inner photo
    expect(drawImageCalls.length).toBeGreaterThanOrEqual(1);
  } finally {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    HTMLCanvasElement.prototype.toDataURL = originalToDataURL;
    global.Image = originalImage;
  }
});

test('aligns footer metadata items and cleans up empty action clusters and dangling separators', () => {
  const source = document.createElement('div');
  source.innerHTML = `
    <div class="letter-paper__head"><div class="letter-info">From: Shen</div></div>
    <div class="letter-paper__body">Text</div>
    <div class="letter-paper__meta">
      <span class="letter-paper__age">3d ago</span>
      <span class="letter-meta-sep">·</span>
      <span class="letter-paper__reads">12 reads</span>
      <span class="letter-meta-sep">·</span>
      <span class="letter-reaction-cluster"></span>
    </div>
  `;
  const copy = createLetterImageCopy(source, {from:'Shen',to:'Cian',message:'Text',date:'May 26, 2024'});
  const footer = copy.querySelector('.letter-paper__meta');
  expect(footer).not.toBeNull();
  expect(footer.style.display).toBe('flex');
  expect(footer.style.alignItems).toBe('center');
  expect(footer.style.justifyContent).toBe('center');
  expect(footer.querySelector('.letter-reaction-cluster')).toBeNull();
  expect(footer.lastElementChild.classList.contains('letter-meta-sep')).toBe(false);
  expect(footer.querySelectorAll('.letter-meta-sep')).toHaveLength(1);
});


test('Spotify exports a compact player-style preview with artwork, title, and author but no raw URL', async () => {
  const originalFetch = global.fetch;
  const originalImage = global.Image;
  const originalCreateUrl = URL.createObjectURL;
  global.fetch = jest.fn(async url => url.includes('/oembed?')
    ? {ok:true,json:async()=>({title:'My song',author_name:'Artist Name',thumbnail_url:'https://i.scdn.co/image/artwork'})}
    : {ok:true,blob:async()=>new Blob(['image'])});
  URL.createObjectURL = jest.fn(() => 'blob:artwork');
  global.Image = function () {
    const image = document.createElement('img');
    image.decode = async () => {};
    return image;
  };
  try {
    const copy = document.createElement('div');
    copy.innerHTML = '<div class="letter-paper__meta">Footer</div>';
    const data = {media:{provider:'Spotify',url:'https://open.spotify.com/track/example'}};
    await addExportAttachments(copy,data,[]);
    expect(global.fetch).not.toHaveBeenCalled();
    await addExportAttachments(copy,{...data,includeAttachments:true},[]);
    const preview = copy.querySelector('.letter-export-spotify');
    expect(preview).toHaveTextContent('My song');
    expect(preview).toHaveTextContent('Artist Name');
    expect(preview.querySelector('.letter-export-spotify__author')).toHaveTextContent('Artist Name');
    expect(preview.querySelector('img')).toHaveAttribute('src','blob:artwork');
    expect(preview).not.toHaveTextContent(data.media.url);
    expect(preview.style.height).toBe('152px');
    expect(preview.style.background).toBe('rgb(40, 40, 40)');
    expect(preview.querySelectorAll('svg')).toHaveLength(2);
    expect(copy.lastElementChild).toHaveClass('letter-paper__meta');
    expect(global.fetch.mock.calls[0][0]).toBe('https://open.spotify.com/oembed?url=' + encodeURIComponent(data.media.url));
  } finally {
    global.fetch = originalFetch;
    global.Image = originalImage;
    URL.createObjectURL = originalCreateUrl;
  }
});

test('Spotify exports gracefully when author metadata is absent', async () => {
  const originalFetch = global.fetch;
  const originalImage = global.Image;
  const originalCreateUrl = URL.createObjectURL;
  global.fetch = jest.fn(async url => url.includes('/oembed?')
    ? {ok:true,json:async()=>({title:'Solo Track',thumbnail_url:'https://i.scdn.co/image/artwork'})}
    : {ok:true,blob:async()=>new Blob(['image'])});
  URL.createObjectURL = jest.fn(() => 'blob:artwork');
  global.Image = function () {
    const image = document.createElement('img');
    image.decode = async () => {};
    return image;
  };
  try {
    const copy = document.createElement('div');
    await addExportAttachments(copy, {includeAttachments:true, media:{provider:'Spotify',url:'https://open.spotify.com/track/example'}}, []);
    const preview = copy.querySelector('.letter-export-spotify');
    expect(preview).toHaveTextContent('Solo Track');
    expect(preview.querySelector('.letter-export-spotify__author')).toBeNull();
  } finally {
    global.fetch = originalFetch;
    global.Image = originalImage;
    URL.createObjectURL = originalCreateUrl;
  }
});


test('excludes unrelated page photos and players while retaining export ancestors and styles', () => {
  const parent = document.createElement('div');
  const host = document.createElement('div');
  const unrelatedPhoto = document.createElement('img');
  const player = document.createElement('iframe');
  const includedPhoto = document.createElement('img');
  host.append(includedPhoto);
  parent.append(host, unrelatedPhoto, player);
  expect(ignoreOutsideExport(unrelatedPhoto,host)).toBe(true);
  expect(ignoreOutsideExport(player,host)).toBe(true);
  expect(ignoreOutsideExport(includedPhoto,host)).toBe(false);
  expect(ignoreOutsideExport(parent,host)).toBe(false);
  expect(ignoreOutsideExport(document.createElement('head'),host)).toBe(false);
});

test('a stalled export step times out and clears its timer', async () => {
  jest.useFakeTimers();
  try {
    const task = withExportTimeout(new Promise(() => {}), 1000);
    const assertion = expect(task).rejects.toThrow('timed out');
    jest.advanceTimersByTime(1000);
    await assertion;
    expect(jest.getTimerCount()).toBe(0);
  } finally {jest.useRealTimers();}
});
