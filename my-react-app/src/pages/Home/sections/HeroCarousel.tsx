import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Button } from '../../../ui/button';

const carouselImages = [
  {
    url: 'https://images.unsplash.com/photo-1628497622768-78d74888e965?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwcmVzdGF1cmFudCUyMHN0ZWFrfGVufDF8fHx8MTc3MjMxMDEyN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Premium Steaks',
    description: 'Finest cuts, perfectly grilled'
  },
  {
    url: 'https://images.unsplash.com/photo-1676300184847-4ee4030409c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwcGFzdGElMjBkaXNofGVufDF8fHx8MTc3MjMxMDEyN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Artisan Pasta',
    description: 'Handcrafted with Italian tradition'
  },
  {
    url: 'https://images.unsplash.com/photo-1741244133042-970251e76066?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZGVzc2VydCUyMHBsYXRlZHxlbnwxfHx8fDE3NzIzMTAxMjd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Elegant Desserts',
    description: 'Sweet endings to remember'
  },
  {
    url: 'https://images.unsplash.com/photo-1769816042382-969141ce4b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwc2VhZm9vZCUyMHBsYXR0ZXJ8ZW58MXx8fHwxNzcyMzEwMTI4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Fresh Seafood',
    description: 'Ocean to table excellence'
  },
  {
    url: 'https://images.unsplash.com/photo-1632898657999-ae6920976661?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwYnVyZ2VyJTIwZmluZSUyMGRpbmluZ3xlbnwxfHx8fDE3NzIzMTAxMzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Gourmet Burgers',
    description: 'Elevated comfort food'
  }
];

export function HeroCarousel() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    fade: true,
    pauseOnHover: true,
    arrows: true,
  };

  return (
    <section className="pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          <Slider {...settings}>
            {carouselImages.map((image, index) => (
              <div key={index} className="relative">
                <div className="h-[600px] relative">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
                    <h2 className="text-5xl font-bold mb-4">{image.title}</h2>
                    <p className="text-xl text-gray-200 mb-8">{image.description}</p>
                    <Button size="lg" className="px-8 shadow-sm">
                      Order Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}
