import { useEffect } from 'react';

const SITE = 'NeuroProfile';

/**
 * Sets document.title for the current page.
 * Resets to the default title on unmount.
 *
 * @example
 * useDocumentTitle('About Aphantasia');  // → "About Aphantasia | NeuroProfile"
 * useDocumentTitle();                    // → "NeuroProfile"
 */
export function useDocumentTitle(pageTitle?: string) {
    useEffect(() => {
        const prev = document.title;
        document.title = pageTitle ? `${pageTitle} | ${SITE}` : SITE;
        return () => {
            document.title = prev;
        };
    }, [pageTitle]);
}
