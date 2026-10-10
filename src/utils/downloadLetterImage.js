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
  const isParchment =
    source.classList.contains('letter-card--paper-parchment') ||
    source.closest?.('.letter-paper-wrapper')?.classList.contains('letter-card--paper-parchment');
  const isCream =
    source.classList.contains('letter-card--paper-cream') ||
    source.closest?.('.letter-paper-wrapper')?.classList.contains('letter-card--paper-cream');
  const paperBg = isParchment ? '#ede2cb' : isCream ? '#f4eddb' : '#faf7ec';
  Object.assign(copy.style, {
    position:'relative', width:'620px', maxWidth:'none', height:'auto', maxHeight:'none',
    overflow:'visible', padding:'30px', boxSizing:'border-box', border:'0', borderRadius:'0',
    background:paperBg, boxShadow:'none', animation:'none', transform:'none', color:'#332f24',
  });
  // Rebuild the heading independently of typing state and night-mode styles.
  const oldHeading = copy.querySelector('.letter-paper__head');
  const oldStampSlot = (oldHeading || copy || source).querySelector('.letter-paper__stamp-slot');

  const heading = document.createElement('div');
  heading.className = 'letter-paper__head';
  Object.assign(heading.style, {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    visibility: 'visible',
    opacity: '1',
    height: 'auto',
    overflow: 'visible',
    margin: '0 0 18px',
  });

  const addressee = document.createElement('div');
  addressee.className = 'letter-paper__addressee';
  Object.assign(addressee.style, {
    flex: '1 1 auto',
    minWidth: '0',
  });

  [['From:', from], ['To:', to]].forEach(([text, name], idx) => {
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
    Object.assign(row.style, {
      display: 'block',
      visibility: 'visible',
      opacity: '1',
      height: 'auto',
      overflow: 'visible',
      fontFamily: '"Courier New", monospace',
      fontSize: '21px',
      lineHeight: '1.6',
      margin: idx === 0 ? '0 0 8px' : '0',
      whiteSpace: 'pre-wrap',
      overflowWrap: 'anywhere',
      color: '#332f24',
    });
    addressee.appendChild(row);
  });
  heading.appendChild(addressee);

  if (oldStampSlot) {
    const stampSlotCopy = oldStampSlot.cloneNode(true);
    Object.assign(stampSlotCopy.style, {
      flexShrink: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingLeft: '20px',
      visibility: 'visible',
      opacity: '1',
    });

    stampSlotCopy.querySelectorAll('.letter-card__postmark-waves').forEach(node => node.remove());

    const stampBtn = stampSlotCopy.querySelector('.letter-paper__stamp-btn');
    if (stampBtn) {
      Object.assign(stampBtn.style, {
        border: 'none',
        background: 'transparent',
        padding: '0',
        margin: '0',
        outline: 'none',
        boxShadow: 'none',
        transform: 'none',
        pointerEvents: 'none',
      });
    }

    const stampWrapper = stampSlotCopy.querySelector('.letter-paper__stamp') || stampSlotCopy.firstElementChild;
    if (stampWrapper) {
      Object.assign(stampWrapper.style, {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        visibility: 'visible',
        opacity: '1',
        filter: 'none',
      });
    }

    const mainStamp = stampSlotCopy.querySelector('.letter-card__main-stamp');
    if (mainStamp) {
      Object.assign(mainStamp.style, {
        width: '56px',
        height: '66px',
        display: 'block',
        visibility: 'visible',
        opacity: '1',
      });
    }
    heading.appendChild(stampSlotCopy);
  }

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
  if (footer) {
    Object.assign(footer.style, {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '7px',
      flexWrap: 'nowrap',
      width: 'auto',
      boxSizing: 'border-box',
      margin: '20px auto 0',
      padding: '0',
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '12px',
      lineHeight: '1',
      color: '#7d765c',
      textAlign: 'center',
      whiteSpace: 'nowrap',
    });

    footer.querySelectorAll('.letter-meta-sep').forEach(sep => {
      Object.assign(sep.style, {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 1px',
        width: '3px',
        height: '14px',
        lineHeight: '1',
        transform: 'translateY(1px)',
        opacity: '0.55',
        color: '#8a8264',
        fontSize: '12px',
        flexShrink: '0',
      });
    });

    footer.querySelectorAll('.letter-paper__badges, .letter-paper__pin, .letter-paper__age, .letter-paper__reads, .letter-paper__actions, .letter-paper__locate, .letter-paper__share, .letter-reaction-cluster').forEach(item => {
      Object.assign(item.style, {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
        lineHeight: '1',
        height: 'auto',
        fontSize: '12px',
        color: '#7d765c',
        border: 'none',
        background: 'transparent',
        padding: '0',
        margin: '0',
        textDecoration: 'none',
        boxShadow: 'none',
        flexShrink: '0',
      });
    });

    const actionsWrapper = footer.querySelector('.letter-paper__actions');
    if (actionsWrapper) {
      Object.assign(actionsWrapper.style, {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
      });
    }

    const readsWrapper = footer.querySelector('.letter-paper__reads');
    if (readsWrapper) {
      Object.assign(readsWrapper.style, {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        lineHeight: '1',
      });
    }

    footer.querySelectorAll('svg').forEach(svg => {
      Object.assign(svg.style, {
        display: 'inline-block',
        verticalAlign: 'middle',
        margin: '0',
        marginRight: svg.nextElementSibling ? '4px' : '0',
        flexShrink: '0',
        color: '#7d765c',
        fill: 'currentColor',
      });
      const currentH = svg.getAttribute('height') || '14';
      const numH = parseFloat(currentH) || 14;
      svg.setAttribute('height', String(Math.min(13, numH)));
      svg.setAttribute('width', String(Math.min(13, numH)));
    });

    footer.querySelectorAll('span, strong, time, a, button').forEach(el => {
      if (el.classList.contains('letter-meta-sep')) return;
      el.style.color = '#7d765c';
      el.style.lineHeight = '1';
      el.style.verticalAlign = 'middle';
    });

    footer.querySelectorAll('.letter-echo-picker, .letter-echo-breakdown, .react-tooltip, [role="tooltip"]').forEach(el => el.remove());

    // Clean up empty containers or clusters (such as reaction cluster when 0 reactions)
    footer.querySelectorAll('.letter-paper__actions, .letter-reaction-cluster, .letter-paper__badges, .letter-echo-summary').forEach(el => {
      if (!el.textContent.trim() && !el.querySelector('svg, img')) {
        el.remove();
      }
    });

    const cleanSepsInContainer = (container) => {
      const items = Array.from(container.children);
      items.forEach((child, idx) => {
        if (child.classList.contains('letter-meta-sep')) {
          const prev = items[idx - 1];
          const next = items[idx + 1];
          if (!prev || !next || prev.classList.contains('letter-meta-sep') || next.classList.contains('letter-meta-sep')) {
            child.remove();
          }
        }
      });
    };
    cleanSepsInContainer(footer);
    const remainingActions = footer.querySelector('.letter-paper__actions');
    if (remainingActions) {
      cleanSepsInContainer(remainingActions);
      if (!remainingActions.textContent.trim() && !remainingActions.querySelector('svg, img')) {
        remainingActions.remove();
        cleanSepsInContainer(footer);
      }
    }
  }
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

export const SCALLOP_48_58 =
  "M 0 0 L 0.6 0 A 1.4 1.4 0 0 1 3.4 0 L 4.0 0 L 4.6 0 A 1.4 1.4 0 0 1 7.4 0 L 8.0 0 L 8.6 0 A 1.4 1.4 0 0 1 11.4 0 L 12.0 0 L 12.6 0 A 1.4 1.4 0 0 1 15.4 0 L 16.0 0 L 16.6 0 A 1.4 1.4 0 0 1 19.4 0 L 20.0 0 L 20.6 0 A 1.4 1.4 0 0 1 23.4 0 L 24.0 0 L 24.6 0 A 1.4 1.4 0 0 1 27.4 0 L 28.0 0 L 28.6 0 A 1.4 1.4 0 0 1 31.4 0 L 32.0 0 L 32.6 0 A 1.4 1.4 0 0 1 35.4 0 L 36.0 0 L 36.6 0 A 1.4 1.4 0 0 1 39.4 0 L 40.0 0 L 40.6 0 A 1.4 1.4 0 0 1 43.4 0 L 44.0 0 L 44.6 0 A 1.4 1.4 0 0 1 47.4 0 L 48.0 0 L 48 0.7 A 1.4 1.4 0 0 1 48 3.5 L 48 4.1 L 48 4.8 A 1.4 1.4 0 0 1 48 7.6 L 48 8.3 L 48 9.0 A 1.4 1.4 0 0 1 48 11.8 L 48 12.4 L 48 13.1 A 1.4 1.4 0 0 1 48 15.9 L 48 16.6 L 48 17.2 A 1.4 1.4 0 0 1 48 20.0 L 48 20.7 L 48 21.4 A 1.4 1.4 0 0 1 48 24.2 L 48 24.9 L 48 25.5 A 1.4 1.4 0 0 1 48 28.3 L 48 29.0 L 48 29.7 A 1.4 1.4 0 0 1 48 32.5 L 48 33.1 L 48 33.8 A 1.4 1.4 0 0 1 48 36.6 L 48 37.3 L 48 38.0 A 1.4 1.4 0 0 1 48 40.8 L 48 41.4 L 48 42.1 A 1.4 1.4 0 0 1 48 44.9 L 48 45.6 L 48 46.2 A 1.4 1.4 0 0 1 48 49.0 L 48 49.7 L 48 50.4 A 1.4 1.4 0 0 1 48 53.2 L 48 53.9 L 48 54.5 A 1.4 1.4 0 0 1 48 57.3 L 48 58.0 L 47.4 58 A 1.4 1.4 0 0 1 44.6 58 L 44.0 58 L 43.4 58 A 1.4 1.4 0 0 1 40.6 58 L 40.0 58 L 39.4 58 A 1.4 1.4 0 0 1 36.6 58 L 36.0 58 L 35.4 58 A 1.4 1.4 0 0 1 32.6 58 L 32.0 58 L 31.4 58 A 1.4 1.4 0 0 1 28.6 58 L 28.0 58 L 27.4 58 A 1.4 1.4 0 0 1 24.6 58 L 24.0 58 L 23.4 58 A 1.4 1.4 0 0 1 20.6 58 L 20.0 58 L 19.4 58 A 1.4 1.4 0 0 1 16.6 58 L 16.0 58 L 15.4 58 A 1.4 1.4 0 0 1 12.6 58 L 12.0 58 L 11.4 58 A 1.4 1.4 0 0 1 8.6 58 L 8.0 58 L 7.4 58 A 1.4 1.4 0 0 1 4.6 58 L 4.0 58 L 3.4 58 A 1.4 1.4 0 0 1 0.6 58 L 0.0 58 L 0 57.3 A 1.4 1.4 0 0 1 0 54.5 L 0 53.9 L 0 53.2 A 1.4 1.4 0 0 1 0 50.4 L 0 49.7 L 0 49.0 A 1.4 1.4 0 0 1 0 46.2 L 0 45.6 L 0 44.9 A 1.4 1.4 0 0 1 0 42.1 L 0 41.4 L 0 40.8 A 1.4 1.4 0 0 1 0 38.0 L 0 37.3 L 0 36.6 A 1.4 1.4 0 0 1 0 33.8 L 0 33.1 L 0 32.5 A 1.4 1.4 0 0 1 0 29.7 L 0 29.0 L 0 28.3 A 1.4 1.4 0 0 1 0 25.5 L 0 24.9 L 0 24.2 A 1.4 1.4 0 0 1 0 21.4 L 0 20.7 L 0 20.0 A 1.4 1.4 0 0 1 0 17.2 L 0 16.6 L 0 15.9 A 1.4 1.4 0 0 1 0 13.1 L 0 12.4 L 0 11.8 A 1.4 1.4 0 0 1 0 9.0 L 0 8.3 L 0 7.6 A 1.4 1.4 0 0 1 0 4.8 L 0 4.1 L 0 3.5 A 1.4 1.4 0 0 1 0 0.7 L 0 0.0 Z";

export async function rasterizeStampForExport(copy) {
  const stampSlot = copy.querySelector('.letter-paper__stamp-slot');
  if (!stampSlot) return;
  const mainStamp = stampSlot.querySelector('.letter-card__main-stamp');
  if (!mainStamp || mainStamp.tagName.toLowerCase() !== 'svg') return;

  const pad = 4; // Margin for tactile drop shadow so scallop edges are never clipped
  const origW = 48;
  const origH = 58;
  const totalW = origW + pad * 2; // 56
  const totalH = origH + pad * 2; // 66

  // 6x pixel ratio ensures ultra-crisp HD rendering (336 x 396 px)
  const pixelRatio = 6;
  const canvasW = Math.round(totalW * pixelRatio);
  const canvasH = Math.round(totalH * pixelRatio);

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (ctx.scale) ctx.scale(pixelRatio, pixelRatio);
  if (ctx.translate) ctx.translate(pad, pad);

  // Check if stamp has an <image> element (city landmark photo stamps)
  const imgEl = mainStamp.querySelector('image');
  let photoHref = imgEl ? (imgEl.getAttribute('href') || imgEl.getAttribute('xlink:href')) : null;

  // Extract styling from SVG DOM
  const pathEl = mainStamp.querySelector('path');
  const dPath = pathEl?.getAttribute('d') || SCALLOP_48_58;
  const strokeColor = pathEl?.getAttribute('stroke') || '#ca8a04';
  const strokeWidth = parseFloat(pathEl?.getAttribute('stroke-width') || pathEl?.getAttribute('strokeWidth') || '0.9');

  const rects = Array.from(mainStamp.querySelectorAll('rect'));
  const frameColor = rects[0]?.getAttribute('fill') || strokeColor;
  const bgColor = rects[1]?.getAttribute('fill') || '#fefae0';

  // 1. Draw tactile drop shadow behind scallop
  let p = null;
  if (typeof Path2D !== 'undefined') {
    try {
      p = new Path2D(dPath);
    } catch (_) {}
  }

  if (p) {
    ctx.save();
    ctx.shadowColor = 'rgba(45, 30, 15, 0.28)';
    ctx.shadowBlur = 3.5;
    ctx.shadowOffsetY = 1.8;
    ctx.shadowOffsetX = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fill(p);
    ctx.restore();

    // 2. Scallop white body & crisp perforated deckle stroke
    ctx.fillStyle = '#ffffff';
    ctx.fill(p);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = Math.max(0.85, strokeWidth);
    ctx.lineJoin = 'round';
    ctx.stroke(p);
  } else if (ctx.fillRect && ctx.strokeRect) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 48, 58);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = Math.max(0.85, strokeWidth);
    ctx.strokeRect(0, 0, 48, 58);
  }

  // 3. Outer contrasting frame
  ctx.fillStyle = frameColor;
  ctx.fillRect(3, 3, 42, 52);

  // 4. Inner canvas background
  ctx.fillStyle = bgColor;
  ctx.fillRect(4.5, 4.5, 39, 49);

  // 5. Central Artwork
  if (photoHref) {
    try {
      const fullUrl = (typeof window !== 'undefined' && window.location && !photoHref.startsWith('data:'))
        ? new URL(photoHref, window.location.href).href
        : photoHref;
      const photoImg = new Image();
      photoImg.crossOrigin = 'anonymous';
      await withExportTimeout(new Promise((resolve, reject) => {
        photoImg.onload = resolve;
        photoImg.onerror = reject;
        photoImg.src = fullUrl;
      }), 4000).catch(async () => {
        if (!fullUrl.startsWith('data:')) {
          try {
            const resp = await fetch(fullUrl);
            if (resp.ok) {
              const blob = await resp.blob();
              const dUri = await new Promise((res, rej) => {
                const r = new FileReader();
                r.onloadend = () => res(r.result);
                r.onerror = rej;
                r.readAsDataURL(blob);
              });
              await new Promise((res, rej) => {
                photoImg.onload = res;
                photoImg.onerror = rej;
                photoImg.src = dUri;
              });
            }
          } catch (_) {}
        }
      });

      if (photoImg.complete && photoImg.naturalWidth) {
        ctx.drawImage(photoImg, 4.5, 4.5, 39, 49);
      }
    } catch (_) {}
  } else {
    // Pure vector artwork: clone SVG, remove outer scallop path, draw via Image
    try {
      const cloneSvg = mainStamp.cloneNode(true);
      cloneSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      cloneSvg.setAttribute('viewBox', '0 0 48 58');
      cloneSvg.setAttribute('width', '48');
      cloneSvg.setAttribute('height', '58');
      const clonePath = cloneSvg.querySelector('path');
      if (clonePath) clonePath.remove();

      const svgXml = new XMLSerializer().serializeToString(cloneSvg);
      const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgXml)}`;
      const vectorImg = new Image();
      await withExportTimeout(new Promise((res, rej) => {
        vectorImg.onload = res;
        vectorImg.onerror = rej;
        vectorImg.src = dataUri;
      }), 4000).catch(() => {});

      if (vectorImg.complete && vectorImg.naturalWidth) {
        ctx.drawImage(vectorImg, 0, 0, 48, 58);
      }
    } catch (_) {}
  }

  // 6. Fine interior frame line
  ctx.strokeStyle = 'rgba(202, 138, 4, 0.35)';
  ctx.lineWidth = 0.4;
  ctx.strokeRect(5.5, 5.5, 37, 47);

  // 7. Replace SVG in DOM with crisp high-res <img> tag
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const exportImg = document.createElement('img');
    exportImg.className = mainStamp.getAttribute('class') || (typeof mainStamp.className === 'string' ? mainStamp.className : mainStamp.className?.baseVal || '');
    exportImg.src = dataUrl;
    exportImg.alt = mainStamp.getAttribute('aria-label') || 'Postage stamp';
    Object.assign(exportImg.style, {
      width: `${totalW}px`,
      height: `${totalH}px`,
      display: 'block',
      margin: `-${pad}px -${pad}px -${pad}px 0`,
      visibility: 'visible',
      opacity: '1',
      filter: 'none',
      maxWidth: 'none',
      maxHeight: 'none',
      objectFit: 'contain',
    });

    if (typeof exportImg.decode === 'function') {
      await exportImg.decode().catch(() => {});
    }

    mainStamp.replaceWith(exportImg);
  } catch (_) {}
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
    await rasterizeStampForExport(copy);
    await addExportAttachments(copy, data, objectUrls);
    // Use fallback fonts if the page has an unrelated font still loading.
    await withExportTimeout(Promise.resolve(document.fonts?.ready), 3000).catch(() => {});
    addPaperLines(copy.querySelector('.letter-paper__body'));
    const height = Math.ceil(copy.getBoundingClientRect().height);
    const scale = Math.min(2.5, 8192 / Math.max(620, height), Math.sqrt(16000000 / (620 * Math.max(1, height))));
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
