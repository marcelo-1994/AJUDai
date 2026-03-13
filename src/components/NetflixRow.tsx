import React, { useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NetflixCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  to: string;
  bgGradient: string;
  badge?: string;
  image?: string;
}

interface NetflixRowProps {
  title: string;
  items: NetflixCardProps[];
}

export const NetflixRow = memo(({ title, items }: NetflixRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.8;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mb-10 relative group">
      <h2 className="text-xl font-bold text-white mb-4 px-4 md:px-12">{title}</h2>
      
      <div className="relative">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 w-12 bg-black/50 hover:bg-black/80 text-white z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>

        <div 
          ref={rowRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 md:px-12 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, index) => (
            <Link 
              key={index} 
              to={item.to}
              className="snap-start shrink-0 w-64 md:w-72 relative group/card transition-transform duration-300 hover:scale-105 hover:z-20"
            >
              <div className={`aspect-video rounded-xl p-6 flex flex-col justify-between ${item.bgGradient} border border-white/10 shadow-lg overflow-hidden relative`}>
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay group-hover/card:opacity-60 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover/card:bg-transparent transition-colors"></div>
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                
                <div className="relative z-10 flex justify-between items-start">
                  <div className="p-3 bg-black/30 rounded-lg backdrop-blur-md border border-white/10">
                    {item.icon}
                  </div>
                  {item.badge && (
                    <span className="px-2 py-1 bg-white/10 backdrop-blur-md rounded text-[10px] font-bold text-white border border-white/20 uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </div>
                
                <div className="relative z-10 mt-4">
                  <h3 className="text-lg font-bold text-white mb-1 drop-shadow-md">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-white/80 line-clamp-2 drop-shadow-md">{item.description}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 w-12 bg-black/50 hover:bg-black/80 text-white z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>
    </div>
  );
});

NetflixRow.displayName = 'NetflixRow';
