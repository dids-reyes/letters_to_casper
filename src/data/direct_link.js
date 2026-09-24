const DIRECT_LINK_URL =
  'https://storyunicornupper.com/rxyce75in3?key=945fab619a2a948227fecaaf9d93f787';

export function displayDirectLinkAds() {
  const link = document.createElement('a');
  link.href = DIRECT_LINK_URL;
  link.target = '_blank';
  link.rel = 'noopener noreferrer sponsored';
  link.setAttribute('aria-hidden', 'true');
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
