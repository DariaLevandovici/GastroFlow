import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MenuItem } from '../../../services/menuService';
import { ProductCard } from './ProductCard';
import { Button } from '../../../ui/button';

interface MenuCarouselProps {
  items: MenuItem[];
}

export function MenuCarousel({ items }: MenuCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  // We duplicate items to create the illusion of an infinite loop
  // 3 sets: left buffer, main view, right buffer
  const carouselItems = [...items, ...items, ...items];

  // On mount, jump to the middle block
  useEffect(() => {
    if (scrollRef.current && items.length > 0) {
      // Small timeout to allow DOM to render sizes
      setTimeout(() => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const singleBlockWidth = container.scrollWidth / 3;
        // Jump silently without animation
        container.scrollLeft = singleBlockWidth;
      }, 50);
    }
  }, [items]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;

    const singleBlockWidth = container.scrollWidth / 3;

    // If we've scrolled into the left buffer, seamlessly jump to the middle block
    if (container.scrollLeft < singleBlockWidth * 0.5) {
      // silent instantaneous jump back by singleBlockWidth
      container.style.scrollBehavior = 'auto';
      container.scrollLeft += singleBlockWidth;
    }
    // If we've scrolled into the right buffer, seamlessly jump back to the middle block
    else if (container.scrollLeft > singleBlockWidth * 2.5) {
      container.style.scrollBehavior = 'auto';
      container.scrollLeft -= singleBlockWidth;
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      // 344 = 320px card width + 24px gap (w-80 + space-x-6 approx, or gap-6)
      const firstChild = scrollRef.current.children[0] as HTMLElement;
      // Get exact width to handle responsiveness safely
      const itemWidth = firstChild.getBoundingClientRect().width + 24;

      scrollRef.current.style.scrollBehavior = 'smooth';
      scrollRef.current.scrollBy({ left: -itemWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const firstChild = scrollRef.current.children[0] as HTMLElement;
      const itemWidth = firstChild.getBoundingClientRect().width + 24;

      scrollRef.current.style.scrollBehavior = 'smooth';
      scrollRef.current.scrollBy({ left: itemWidth, behavior: 'smooth' });
    }
  };

  return (
    <div
      className="relative group w-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto pb-6 hide-scrollbar gap-6 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {carouselItems.map((item, index) => (
          <div
            // we use index in key because we have real duplicates
            key={`${item.id}-${index}`}
            className="w-[390px] min-w-[390px] max-w-[390px] flex-shrink-0 snap-start"
          >
            <ProductCard item={item} />
          </div>
        ))}
      </div>

      {/* Left Arrow */}
      <Button
        onClick={scrollLeft}
        size="icon"
        className={`absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 size-12 rounded-full bg-blue-700/80 hover:bg-blue-600 border border-white/20 text-white backdrop-blur-md shadow-lg transition-all duration-300 ${isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
          }`}
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      {/* Right Arrow */}
      <Button
        onClick={scrollRight}
        size="icon"
        className={`absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 size-12 rounded-full bg-blue-700/80 hover:bg-blue-600 border border-white/20 text-white backdrop-blur-md shadow-lg transition-all duration-300 ${isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
          }`}
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6" />
      </Button>
    </div>
  );
}
