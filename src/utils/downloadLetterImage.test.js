import {createLetterImageCopy, addPaperLines, addExportAttachments, withExportTimeout, ignoreOutsideExport} from './downloadLetterImage';
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
  expect(heading.style.display).toBe('block');
  expect(heading.style.opacity).toBe('1');
  expect(heading).toHaveTextContent('From: Shen');
  expect(heading).toHaveTextContent('To: Cian');
  heading.querySelectorAll('strong').forEach(label => {
    expect(label.style.color).toBe('rgb(8, 7, 4)');
    expect(label.style.getPropertyPriority('color')).toBe('important');
  });
});


test('Spotify exports a compact player-style preview with artwork and title but no raw URL', async () => {
  const originalFetch = global.fetch;
  const originalImage = global.Image;
  const originalCreateUrl = URL.createObjectURL;
  global.fetch = jest.fn(async url => url.includes('/oembed?')
    ? {ok:true,json:async()=>({title:'My song',thumbnail_url:'https://i.scdn.co/image/artwork'})}
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
