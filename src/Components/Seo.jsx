import { useEffect } from 'react';

const setMetaTag = (attribute, name, content) => {
  if (!content) return;
  const selector = `meta[${attribute}="${name}"]`;
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
};

const setCanonicalTag = (href) => {
  if (!href) return;
  let link = document.head.querySelector('link[rel="canonical"]');

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }

  link.setAttribute('href', href);
};

const Seo = ({
  title,
  description,
  canonical,
  image,
  type = 'website',
  keywords,
}) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:url', canonical || window.location.href);
    setMetaTag('property', 'og:image', image);
    setMetaTag('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);
    setCanonicalTag(canonical || window.location.href);
  }, [title, description, canonical, image, type, keywords]);

  return null;
};

export default Seo;
