import React, { forwardRef } from 'react';

export interface SlideData {
  id: string;
  title: string;
  content: string;
  slideNumber: number;
  totalSlides: number;
}

interface Props {
  data: SlideData;
}

export const CarouselSlide = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  return (
    <div 
      ref={ref}
      className="w-[1080px] h-[1350px] bg-brand-bgMain text-brand-textPrimary overflow-hidden relative flex flex-col justify-center p-24"
      style={{ backgroundColor: '#0F0F13', color: '#F9FAFB' }}
    >
      {/* Header */}
      <div className="absolute top-24 left-24 opacity-50 text-3xl font-bold tracking-widest uppercase">
        NEUROPROFILE V5
      </div>

      {/* Body */}
      <div className="flex flex-col items-center justify-center text-center space-y-12 flex-grow">
        <h1 className="font-bold text-[80px] leading-tight font-display text-[#7C3AED]">
          {data.title}
        </h1>
        <p className="font-normal text-[48px] leading-snug max-w-[800px]">
          {data.content}
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-24 left-0 right-0 text-center opacity-50 text-3xl tracking-wide uppercase">
        Slide {data.slideNumber} / {data.totalSlides}
      </div>
    </div>
  );
});

CarouselSlide.displayName = 'CarouselSlide';
