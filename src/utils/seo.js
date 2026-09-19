/**
 * Utility to manage document metadata, canonical links, and Open Graph tags for SEO and search engine indexing.
 */

function setMetaTag(attribute, attrValue, content) {
  if (!content) return;
  let element = document.querySelector(`meta[${attribute}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonicalUrl(url) {
  if (!url) return;
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function setJsonLd(id, data) {
  if (!data) return;
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export function updatePageSeo({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage = 'https://letterstocasper.com/ltc-header-social.png',
  jsonLd,
  jsonLdId = 'page-json-ld',
} = {}) {
  const previousTitle = document.title;
  const previousDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
  const previousCanonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');

  if (title) document.title = title;
  if (description) {
    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:description', description);
    setMetaTag('name', 'twitter:description', description);
  }
  if (title) {
    setMetaTag('property', 'og:title', title);
    setMetaTag('name', 'twitter:title', title);
  }
  if (canonicalUrl) {
    setCanonicalUrl(canonicalUrl);
    setMetaTag('property', 'og:url', canonicalUrl);
  }
  setMetaTag('property', 'og:type', ogType);
  if (ogImage) {
    setMetaTag('property', 'og:image', ogImage);
  }
  if (jsonLd) {
    setJsonLd(jsonLdId, jsonLd);
  }

  // Cleanup function to restore previous metadata on component unmount
  return () => {
    if (previousTitle) document.title = previousTitle;
    if (previousDescription) {
      setMetaTag('name', 'description', previousDescription);
      setMetaTag('property', 'og:description', previousDescription);
    }
    if (previousCanonical) {
      setCanonicalUrl(previousCanonical);
    }
    const jsonLdScript = document.getElementById(jsonLdId);
    if (jsonLdScript) {
      jsonLdScript.remove();
    }
  };
}
