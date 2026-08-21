import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles,
  Clock,
  ShieldCheck,
  Tag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  Bike,
  Utensils,
  Percent,
  CheckCircle2,
} from 'lucide-react';

interface HeroBannerProps {
  onSelectCategory: (categoryName: string) => void;
  onApplyCouponCode: (code: string) => void;
} 

interface SlideData {
  id: number;
  badge: {
    text: string;
    icon: 'sparkles' | 'flame' | 'percent' | 'bike';
  };
  titleMain: string;
  titleHighlight: string;
  description: string;
  buttonText: string;
  buttonActionType: 'scroll_restaurants' | 'apply_welcome' | 'apply_foodgo' | 'explore_menu';
  image: string;
  promoCode?: string;
  promoLabel?: string;
  trustBadges: {
    icon: 'clock' | 'shield' | 'sparkles' | 'bike';
    text: string;
  }[];
  accentGradient: string;
}

const HERO_SLIDES: SlideData[] = [
  {
    id: 1,
    badge: {
      text: 'Spring Boot Full-Stack Food Platform',
      icon: 'sparkles',
    },
    titleMain: 'Crave it? Get it.',
    titleHighlight: 'Delivered hot & lightning fast.',
    description:
      'Order from the best local restaurants with real-time GPS tracking, seamless payments, and chef-curated menus.',
    buttonText: 'Order Now',
    buttonActionType: 'scroll_restaurants',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1000&auto=format&fit=crop&q=80',
    promoCode: 'WELCOME100',
    promoLabel: '20% OFF (Tap to apply)',
    trustBadges: [
      { icon: 'clock', text: '20-30 min avg. delivery' },
      { icon: 'shield', text: '100% Quality checked' },
      { icon: 'sparkles', text: 'Zero delivery on $25+' },
    ],
    accentGradient: 'from-orange-500/25 via-amber-500/15 to-transparent',
  },
  {
    id: 2,
    badge: {
      text: 'Exclusive New Customer Offer',
      icon: 'percent',
    },
    titleMain: '50% OFF Your First Order',
    titleHighlight: 'Feast like royalty for half the price.',
    description:
      'Enjoy massive savings on wood-fired artisanal pizzas, gourmet burgers, fresh sushi platters, and authentic pastas.',
    buttonText: 'Grab 50% Off Now',
    buttonActionType: 'apply_foodgo',
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000&auto=format&fit=crop&q=80',
    promoCode: 'FOODGO50',
    promoLabel: 'Flat $5 OFF (Tap to apply)',
    trustBadges: [
      { icon: 'sparkles', text: 'No min. cart value' },
      { icon: 'shield', text: 'Verified chef kitchens' },
      { icon: 'clock', text: 'Instant payment setup' },
    ],
    accentGradient: 'from-rose-500/25 via-orange-500/15 to-transparent',
  },
  {
    id: 3,
    badge: {
      text: 'Fresh Farm-to-Table Ingredients',
      icon: 'flame',
    },
    titleMain: 'Fresh Food, Every Time',
    titleHighlight: 'Curated recipes crafted with passion.',
    description:
      'Discover hundreds of signature meals prepared fresh upon order by award-winning local chefs with 100% organic produce.',
    buttonText: 'Explore Menu',
    buttonActionType: 'explore_menu',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=80',
    promoCode: 'WELCOME100',
    promoLabel: 'Try WELCOME100 for 20% OFF',
    trustBadges: [
      { icon: 'shield', text: 'Hygienic sealed boxes' },
      { icon: 'sparkles', text: 'Contactless drop-off' },
      { icon: 'clock', text: 'Freshly cooked hot' },
    ],
    accentGradient: 'from-emerald-500/20 via-amber-500/15 to-transparent',
  },
  {
    id: 4,
    badge: {
      text: 'Live GPS Fleet Radar Active',
      icon: 'bike',
    },
    titleMain: 'Fast Delivery at Your Door',
    titleHighlight: 'From kitchen to table in 20 mins.',
    description:
      'Our dedicated fleet of electric delivery drivers ensures your meals arrive piping hot with live turn-by-turn tracking.',
    buttonText: 'Order Food Now',
    buttonActionType: 'scroll_restaurants',
    image:
      'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1000&auto=format&fit=crop&q=80',
    promoCode: 'FOODGO50',
    promoLabel: 'Use code FOODGO50',
    trustBadges: [
      { icon: 'bike', text: 'Real-time GPS tracker' },
      { icon: 'clock', text: 'Guaranteed 20m SLA' },
      { icon: 'shield', text: 'Zero emission electric' },
    ],
    accentGradient: 'from-blue-500/20 via-orange-500/15 to-transparent',
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSelectCategory,
  onApplyCouponCode,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = HERO_SLIDES.length;

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
  };

  // Automatic slide interval: 3.5 seconds
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 3500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 40) {
      nextSlide();
    } else if (diff < -40) {
      prevSlide();
    }
    setTouchStartX(null);
  };

  const currentSlide = HERO_SLIDES[currentSlideIndex];

  const handleCtaClick = (actionType: SlideData['buttonActionType'], promoCode?: string) => {
    if (actionType === 'apply_welcome' && promoCode) {
      onApplyCouponCode(promoCode);
    } else if (actionType === 'apply_foodgo' && promoCode) {
      onApplyCouponCode(promoCode);
    } else {
      // Smooth scroll to restaurant section
      window.scrollTo({
        top: 380,
        behavior: 'smooth',
      });
    }
  };

  const renderBadgeIcon = (icon: SlideData['badge']['icon']) => {
    switch (icon) {
      case 'sparkles':
        return <Sparkles className="w-3.5 h-3.5 text-orange-400" />;
      case 'percent':
        return <Percent className="w-3.5 h-3.5 text-amber-400" />;
      case 'flame':
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      case 'bike':
        return <Bike className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const renderTrustIcon = (icon: SlideData['trustBadges'][0]['icon']) => {
    switch (icon) {
      case 'clock':
        return <Clock className="w-4 h-4 text-orange-400 shrink-0" />;
      case 'shield':
        return <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'bike':
        return <Bike className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div
      className="relative rounded-3xl overflow-hidden bg-slate-950 text-white shadow-xl mb-8 border border-slate-800 select-none group min-h-[380px] sm:min-h-[420px] flex flex-col justify-between"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Promotions and Featured Dishes Slider"
    >
      {/* Background slide images with cross-fade */}
      {HERO_SLIDES.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out pointer-events-none ${
            idx === currentSlideIndex ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={idx !== currentSlideIndex}
        >
          <img
            src={slide.image}
            alt=""
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000 ease-out"
          />
          {/* Gradient darkness overlays to keep text crisp and readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/40" />
          <div className={`absolute inset-0 bg-gradient-to-tr ${slide.accentGradient}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </div>
      ))}

      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Slide Content Container */}
      <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 max-w-3xl flex-1 flex flex-col justify-between">
        <div>
          {/* Top Pill / Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-slate-200 text-xs font-semibold mb-4 transition-all duration-300">
            {renderBadgeIcon(currentSlide.badge.icon)}
            <span>{currentSlide.badge.text}</span>
          </div>

          {/* Heading with smooth fade-in */}
          <div key={currentSlide.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {currentSlide.titleMain} <br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                {currentSlide.titleHighlight}
              </span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm sm:max-w-xl mt-3 leading-relaxed">
              {currentSlide.description}
            </p>
          </div>

          {/* Action CTAs & Promo Pill */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleCtaClick(currentSlide.buttonActionType, currentSlide.promoCode)}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>{currentSlide.buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Clickable Promo Code Badge */}
            {currentSlide.promoCode && (
              <div
                onClick={() => onApplyCouponCode(currentSlide.promoCode!)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-medium cursor-pointer transition-all active:scale-95"
                title="Click to apply discount coupon"
              >
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-white uppercase">{currentSlide.promoCode}</span>
                <span className="text-slate-300 hidden sm:inline">— {currentSlide.promoLabel}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Trust Badges */}
        <div className="mt-8 pt-5 border-t border-white/10 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg">
          {currentSlide.trustBadges.map((badge, bIdx) => (
            <div key={bIdx} className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-300">
              {renderTrustIcon(badge.icon)}
              <span className="truncate">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows (Prev / Next) */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/60 hover:bg-orange-500 text-white/80 hover:text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-200 opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/60 hover:bg-orange-500 text-white/80 hover:text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-200 opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Bottom Navigation Dots & Auto-play Indicator */}
      <div className="relative z-20 pb-4 flex items-center justify-center gap-2">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlideIndex;
          return (
            <button
              key={slide.id}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}: ${slide.titleMain}`}
              className={`transition-all duration-300 rounded-full cursor-pointer relative ${
                isActive
                  ? 'w-7 sm:w-8 h-2 bg-gradient-to-r from-orange-500 to-amber-400 shadow-sm shadow-orange-500/50'
                  : 'w-2 h-2 bg-white/30 hover:bg-white/60'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
