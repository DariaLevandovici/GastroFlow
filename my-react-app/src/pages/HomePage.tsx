import { HeroCarousel } from './Home/sections/HeroCarousel';
import { MenuSection } from './Home/sections/MenuSection';

export function HomePage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <main>
        <HeroCarousel />
        <MenuSection />
      </main>
    </div>
  );
}
