import type { ReactNode } from 'react';
import { ScrollToTop } from '../ScrollToTop';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <ScrollToTop />
      <Header />
      {children}
      {showFooter && <Footer />}
    </div>
  );
}
