import html2canvas from 'html2canvas';

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
  copy.querySelectorAll('.letter-paper__head .letter-info').forEach((node, index) => {
    const label = document.createElement('strong');
    label.textContent = index === 0 ? 'From: ' : 'To: ';
    node.replaceChildren(label, document.createTextNode(String(index === 0 ? from : to)));
    Object.assign(node.style, {fontFamily:'"Courier New", monospace', fontSize:'20px', lineHeight:'1.6', margin:'0 0 10px'});
  });
  const timestamp = copy.querySelector('.timestamp-text');
  if (timestamp) {timestamp.textContent = date; timestamp.style.fontSize = '13px';}
  const body = copy.querySelector('.letter-paper__body');
  if (body) {
    body.textContent = message;
    Object.assign(body.style, {
      height:'auto', maxHeight:'none', overflow:'visible', scrollbarGutter:'auto',
      whiteSpace:'pre-wrap', overflowWrap:'anywhere', fontFamily:'"Courier New", monospace',
      fontSize:'20px', lineHeight:'36px', margin:'24px 0 0', padding:'0 2px 2px',
      backgroundImage:'repeating-linear-gradient(to bottom, transparent 0 35px, rgba(120,100,60,0.1) 35px 36px)',
      backgroundPosition:'0 -5px',
    });
  }
  const footer = copy.querySelector('.letter-paper__meta');
  if (footer) Object.assign(footer.style, {fontSize:'12px', marginTop:'24px', color:'#8a8264', flexWrap:'nowrap'});
  return copy;
}

export default async function downloadLetterImage(source, data) {
  if (!source) throw new Error('Letter is not open');
  const copy = createLetterImageCopy(source, data);
  const host = document.createElement('div');
  Object.assign(host.style, {position:'absolute', left:'-10000px', top:'0', width:'620px', pointerEvents:'none'});
  host.setAttribute('aria-hidden', 'true');
  host.appendChild(copy);
  document.body.appendChild(host);
  try {
    await document.fonts?.ready;
    const height = Math.ceil(copy.getBoundingClientRect().height);
    const scale = Math.min(2, 8192 / Math.max(620, height), Math.sqrt(16000000 / (620 * Math.max(1, height))));
    const canvas = await html2canvas(copy, {scale, backgroundColor:'#faf7ec', useCORS:true, logging:false, windowWidth:900});
    const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Could not generate image')), 'image/png'));
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `letters-to-casper-${String(data.id || 'letter').replace(/[^a-z0-9_-]/gi, '')}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  } finally {
    host.remove();
  }
}
