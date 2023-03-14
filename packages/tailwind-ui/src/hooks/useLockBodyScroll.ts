import { useEffect, useLayoutEffect, useState } from 'react';

export function useLockBodyScroll(isLocked = true) {
  const [isMounted, setIsMounted] = useState(false);

  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && window.document) {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.document && isMounted && isLocked) {
      window.document.body.style.overflow = 'hidden';
      window.document.body.style.marginRight = '0px';
      window.document.body.style.position = 'fixed';
      // window.document.body.style.top = `-${y}px`;
      window.document.body.style.top = '0px';
      window.document.body.style.left = '0px';
      window.document.body.style.right = '0px';
    }

    return () => {
      if (typeof window !== 'undefined' && window.document && isMounted && isLocked) {
        window.document.body.style.overflow = '';
        window.document.body.style.marginRight = '';
        window.document.body.style.position = '';
        window.document.body.style.top = '';
        window.document.body.style.left = '';
        window.document.body.style.right = '';
        // window.scrollTo(0, y);
      }
    };
  }, [isMounted, isLocked]);
}
