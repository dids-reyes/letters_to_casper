import html2canvas from 'html2canvas';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {FaSpotify, FaPlay} from 'react-icons/fa';

export function withExportTimeout(task, milliseconds = 15000) {
  let timer;
  return Promise.race([
    task,
    new Promise((_, reject) => { timer = window.setTimeout(() => reject(new Error('Image preparation timed out. Please try again.')), milliseconds); }),
  ]).finally(() => window.clearTimeout(timer));
}

export function ignoreOutsideExport(element, host) {
  if (['HEAD', 'STYLE', 'LINK'].includes(element.tagName)) return false;
  return element !== host && !element.contains(host) && !host.contains(element);
}

export function createLetterImageCopy(source, {from, to, message, date}) {
  const copy = source.cloneNode(true);
  copy.querySelectorAll('.letter-paper__media, .letter-paper__photo, .letter-paper__translation-control, .react-tooltip, .Typewriter__cursor, .letter-echo-picker, .letter-echo-breakdown').forEach(node => node.remove());
  copy.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
  copy.querySelectorAll('*').forEach(node => {
    node.style.animation = 'none';
    node.style.transition = 'none';
    node.style.color = '#332f24';
  });
  Object.assign(copy.style, {
    position:'relative', width:'620px', maxWidth:'none', height:'auto', maxHeight:'none',
    overflow:'visible', padding:'30px', boxSizing:'border-box', border:'0', borderRadius:'0',
    background:'#faf7ec', boxShadow:'none', animation:'none', transform:'none', color:'#332f24',
  });
  // Rebuild the heading independently of typing state and night-mode styles.
  const heading = document.createElement('div');
  heading.className = 'letter-paper__head';
  Object.assign(heading.style, {display:'block', visibility:'visible', opacity:'1', height:'auto', overflow:'visible', margin:'0 0 18px'});
  [['From:', from], ['To:', to]].forEach(([text, name]) => {
    const row = document.createElement('div');
    row.className = 'letter-info';
    const label = document.createElement('strong');
    label.textContent = `${text} `;
    label.style.setProperty('color', '#080704', 'important');
    label.style.fontWeight = '800';
    const value = document.createElement('span');
    value.textContent = String(name ?? '');
    value.style.setProperty('color', '#332f24', 'important');
    row.append(label, value);
    Object.assign(row.style, {display:'block', visibility:'visible', opacity:'1', height:'auto', overflow:'visible', fontFamily:'"Courier New", monospace', fontSize:'21px', lineHeight:'1.6', margin:'0 0 10px', whiteSpace:'pre-wrap', overflowWrap:'anywhere', color:'#332f24'});
    heading.appendChild(row);
  });
  const oldHeading = copy.querySelector('.letter-paper__head');
  if (oldHeading) oldHeading.replaceWith(heading);
  else copy.prepend(heading);
  const timestamp = copy.querySelector('.timestamp-text');
  if (timestamp) {timestamp.textContent = date; timestamp.style.fontSize = '14px';}
  const body = copy.querySelector('.letter-paper__body');
  if (body) {
    body.textContent = message;
    Object.assign(body.style, {
      height:'auto', maxHeight:'none', overflow:'visible', scrollbarGutter:'auto',
      whiteSpace:'pre-wrap', overflowWrap:'anywhere', fontFamily:'"Courier New", monospace',
      fontSize:'21px', lineHeight:'36px', margin:'24px 0 0', padding:'0 2px 2px',
      backgroundImage:'none',
      backgroundPosition:'0 -5px',
    });
  }
  const footer = copy.querySelector('.letter-paper__meta');
  if (footer) Object.assign(footer.style, {fontSize:'13px', marginTop:'24px', color:'#8a8264', flexWrap:'nowrap'});
  return copy;
}

export function addPaperLines(body) {
  if (!body) return;
  const lines = document.createElement('div');
  lines.setAttribute('aria-hidden', 'true');
  lines.className = 'letter-export-lines';
  Object.assign(lines.style, {position:'absolute', inset:'0', pointerEvents:'none'});
  for (let top = 30; top < body.getBoundingClientRect().height; top += 36) {
    const line = document.createElement('div');
    Object.assign(line.style, {position:'absolute', left:'0', right:'0', top:`${top}px`, borderBottom:'1px solid #e4dfcf'});
    lines.appendChild(line);
  }
  body.appendChild(lines);
}

async function loadExportImage(url, objectUrls) {
  const controller = new AbortController();
  try {
    const blob = await withExportTimeout((async () => {
      const response = await fetch(url, {signal: controller.signal});
      if (!response.ok) throw new Error('The attachment could not be loaded. Try again or choose Letter only.');
      return response.blob();
    })());
    const objectUrl = URL.createObjectURL(blob);
    objectUrls.push(objectUrl);
    const image = new Image();
    image.loading = 'eager';
    image.src = objectUrl;
    await withExportTimeout(image.decode());
    return image;
  } finally {
    controller.abort();
  }
}

export async function addExportAttachments(copy, data, objectUrls) {
  if (!data.includeAttachments) return;
  const attachments = document.createElement('div');
  attachments.className = 'letter-export-attachments';
  Object.assign(attachments.style, {display:'grid', gap:'16px', marginTop:'24px'});
  if (data.photoUrl) {
    const photo = await loadExportImage(data.photoUrl, objectUrls);
    // Match the opened letter's compact 340 × 255 photo preview.
    // Crop on canvas because the exporter does not reliably support object-fit.
    const preview = document.createElement('canvas');
    preview.width = 680;
    preview.height = 510;
    const context = preview.getContext('2d');
    if (!context) throw new Error('Could not prepare the photo preview');
    const scale = Math.max(preview.width / photo.naturalWidth, preview.height / photo.naturalHeight);
    const width = photo.naturalWidth * scale;
    const height = photo.naturalHeight * scale;
    context.drawImage(photo, (preview.width - width) / 2, (preview.height - height) / 2, width, height);
    preview.setAttribute('aria-label', 'Attached photo');
    Object.assign(preview.style, {display:'block', width:'340px', maxWidth:'100%', height:'auto', margin:'0 auto', borderRadius:'10px'});
    attachments.appendChild(preview);
  }
  if (data.media) {
    if (data.media.thumbnail) {
      const thumbnail = await loadExportImage(data.media.thumbnail, objectUrls);
      thumbnail.alt = `${data.media.provider} preview`;
      Object.assign(thumbnail.style, {display:'block', width:'100%', height:'auto', borderRadius:'8px'});
      attachments.appendChild(thumbnail);
    } else if (data.media.provider === 'Spotify') {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 15000);
      let metadata;
      try {
        const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(data.media.url)}`, {signal:controller.signal});
        if (!response.ok) throw new Error('Spotify preview unavailable');
        metadata = await response.json();
      } finally { window.clearTimeout(timer); }
      if (!metadata.title || !metadata.thumbnail_url) throw new Error('Spotify artwork unavailable');
      const artwork = await loadExportImage(metadata.thumbnail_url, objectUrls);
      artwork.alt = metadata.title;
      Object.assign(artwork.style, {display:'block', width:'112px', height:'112px', borderRadius:'8px', flexShrink:'0'});
      const preview = document.createElement('div');
      preview.className = 'letter-export-spotify';
      Object.assign(preview.style, {display:'flex', alignItems:'center', gap:'16px', position:'relative', height:'152px', boxSizing:'border-box', padding:'20px', borderRadius:'12px', background:'#282828', color:'#fff', fontFamily:'Arial, sans-serif'});
      const details = document.createElement('div');
      Object.assign(details.style, {minWidth:'0', flex:'1', alignSelf:'stretch', display:'flex', flexDirection:'column', justifyContent:'center', paddingRight:'36px'});
      const authorText =
        metadata.author_name ||
        metadata.author ||
        metadata.artist ||
        data.media?.author ||
        data.media?.author_name ||
        data.media?.artist;
      const title = document.createElement('strong');
      title.textContent = metadata.title;
      Object.assign(title.style, {display:'block', fontSize:'17px', lineHeight:'1.3', color:'#fff', overflowWrap:'anywhere'});
      details.appendChild(title);
      if (authorText) {
        const author = document.createElement('span');
        author.className = 'letter-export-spotify__author';
        author.textContent = authorText;
        Object.assign(author.style, {display:'block', marginTop:'3px', fontSize:'14px', color:'#b3b3b3', overflowWrap:'anywhere'});
        details.appendChild(author);
      }
      const provider = document.createElement('span');
      provider.textContent = 'Spotify';
      Object.assign(provider.style, {display:'block', marginTop:'3px', fontSize:'13px', color:'#b3b3b3'});
      details.appendChild(provider);
      const logo = document.createElement('span');
      logo.innerHTML = renderToStaticMarkup(createElement(FaSpotify, {size:22, color:'#fff'}));
      Object.assign(logo.style, {position:'absolute', top:'14px', right:'16px', color:'#fff'});
      const controls = document.createElement('div');
      Object.assign(controls.style, {display:'flex', alignItems:'center', gap:'12px', marginTop: authorText ? '10px' : '14px'});
      const progress = document.createElement('span');
      Object.assign(progress.style, {height:'4px', flex:'1', background:'#727272', borderRadius:'2px'});
      const play = document.createElement('span');
      play.innerHTML = renderToStaticMarkup(createElement(FaPlay, {size:13, color:'#181818'}));
      Object.assign(play.style, {display:'flex', alignItems:'center', justifyContent:'center', width:'32px', height:'32px', flexShrink:'0', borderRadius:'50%', background:'#fff', color:'#181818'});
      controls.append(progress, play);
      details.appendChild(controls);
      preview.append(artwork, details, logo);
      attachments.appendChild(preview);
    }
  }
  const footer = copy.querySelector('.letter-paper__meta');
  if (footer) footer.before(attachments);
  else copy.appendChild(attachments);
}

export default async function downloadLetterImage(source, data) {
  if (!source) throw new Error('Letter is not open');
  const copy = createLetterImageCopy(source, data);
  const host = document.createElement('div');
  Object.assign(host.style, {position:'absolute', left:'-10000px', top:'0', width:'620px', pointerEvents:'none'});
  host.setAttribute('aria-hidden', 'true');
  host.appendChild(copy);
  document.body.appendChild(host);
  const objectUrls = [];
  try {
    await addExportAttachments(copy, data, objectUrls);
    // Use fallback fonts if the page has an unrelated font still loading.
    await withExportTimeout(Promise.resolve(document.fonts?.ready), 3000).catch(() => {});
    addPaperLines(copy.querySelector('.letter-paper__body'));
    const height = Math.ceil(copy.getBoundingClientRect().height);
    const scale = Math.min(2, 8192 / Math.max(620, height), Math.sqrt(16000000 / (620 * Math.max(1, height))));
    const existingFrames = new Set(document.querySelectorAll('.html2canvas-container'));
    let canvas;
    try {
      canvas = await withExportTimeout(html2canvas(copy, {
        scale, backgroundColor:'#faf7ec', useCORS:true, logging:false, windowWidth:900,
        imageTimeout:10000, ignoreElements: element => ignoreOutsideExport(element, host),
      }), 25000);
    } finally {
      document.querySelectorAll('.html2canvas-container').forEach(frame => {
        if (!existingFrames.has(frame)) frame.remove();
      });
    }
    const blob = await withExportTimeout(new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Could not generate image')), 'image/png')), 10000);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `letters-to-casper-${String(data.id || 'letter').replace(/[^a-z0-9_-]/gi, '')}${data.includeAttachments ? '-with-attachments' : ''}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  } finally {
    objectUrls.forEach(url => URL.revokeObjectURL(url));
    host.remove();
  }
}
