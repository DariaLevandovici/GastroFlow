import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useApp } from '../context/AppContext';

// Componentă care face scroll automat sus și resetează search-ul
// la fiecare schimbare de pagină
export function ScrollToTop() {
  const { pathname } = useLocation();
  const { setSearchQuery } = useApp();

  useEffect(() => {
    // Scroll în partea de sus
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Resetare search
    setSearchQuery('');
  }, [pathname]);

  return null;
}
