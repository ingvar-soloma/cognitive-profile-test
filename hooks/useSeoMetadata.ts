import { useEffect } from 'react';

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'NeuroProfile';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://neuroprofile.org';

interface SeoProps {
  title?: string;
  description?: string;
  canonical?: string;
}

/**
 * Sets SEO metadata for the current page.
 */
export function useSeoMetadata({ title, description, canonical }: SeoProps) {
  useEffect(() => {
    // 1. Title
    const prevTitle = document.title;
    if (title) {
      document.title = `${title} | ${SITE_NAME}`;
    } else {
      document.title = SITE_NAME;
    }

    // 2. Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    let prevDescription = '';
    
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    } else {
      prevDescription = metaDescription.getAttribute('content') || '';
    }

    if (description) {
      metaDescription.setAttribute('content', description);
    }

    // 3. Canonical Link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    let prevCanonical = '';

    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    } else {
      prevCanonical = linkCanonical.getAttribute('href') || '';
    }

    const currentCanonical = canonical ? (canonical.startsWith('http') ? canonical : `${BASE_URL}${canonical}`) : `${BASE_URL}${window.location.pathname}`;
    linkCanonical.setAttribute('href', currentCanonical);

    return () => {
      document.title = prevTitle;
      if (prevDescription) {
        metaDescription?.setAttribute('content', prevDescription);
      } else {
        metaDescription?.remove();
      }
      
      if (prevCanonical) {
        linkCanonical?.setAttribute('href', prevCanonical);
      } else {
        linkCanonical?.remove();
      }
    };
  }, [title, description, canonical]);
}
