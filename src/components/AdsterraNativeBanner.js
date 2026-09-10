import React, {useEffect, useRef, useState} from 'react';

// Each frame gives the provider its own document and required container ID.
const BANNER_DOCUMENT = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;padding:0;background:transparent}body{display:flow-root}#container-eb3aa15be18612df3808d3f37c9745d1{display:flow-root}</style></head><body>
<div id="container-eb3aa15be18612df3808d3f37c9745d1"></div>
<script>
const container = document.getElementById('container-eb3aa15be18612df3808d3f37c9745d1');
function reportSize() {
  const height = Math.ceil(container.getBoundingClientRect().height);
  if (height > 0) parent.postMessage({type:'ltc-native-ad-resize', height}, '*');
}
new ResizeObserver(reportSize).observe(container);
window.addEventListener('load', reportSize);
</script>
<script async="async" data-cfasync="false" src="https://pl31267922.profitableratecpmnetwork.com/eb3aa15be18612df3808d3f37c9745d1/invoke.js"></script>
</body></html>`;

export default function AdsterraNativeBanner() {
  const frameRef = useRef(null);
  const [height, setHeight] = useState(300);
  useEffect(() => {
    const resize = event => {
      if (event.source !== frameRef.current?.contentWindow || event.data?.type !== 'ltc-native-ad-resize') return;
      const nextHeight = event.data.height;
      if (Number.isFinite(nextHeight) && nextHeight > 0) setHeight(Math.min(5000, Math.ceil(nextHeight)));
    };
    window.addEventListener('message', resize);
    return () => window.removeEventListener('message', resize);
  }, []);

  return <iframe ref={frameRef} className="letter-native-ad" title="Advertisement from Adsterra"
    srcDoc={BANNER_DOCUMENT} loading="lazy" scrolling="no"
    style={{display:'block', border:0, height, width:'100%'}} />;
}
