import React, { useRef, useState } from 'react';
import { CarouselSlide, SlideData } from './CarouselSlide';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

const SAMPLE_SLIDES: SlideData[] = [
  { id: '1', title: 'Imagination Spectrum', content: 'Discover how you visualize the world around you.', slideNumber: 1, totalSlides: 3 },
  { id: '2', title: 'What is Aphantasia?', content: 'The condition of not having a functioning minds eye.', slideNumber: 2, totalSlides: 3 },
  { id: '3', title: 'Your Cognitive Profile', content: 'Get personalized insights into your thought processes.', slideNumber: 3, totalSlides: 3 },
];

export const CarouselBuilder: React.FC = () => {
  const [slides] = useState<SlideData[]>(SAMPLE_SLIDES);
  const [isExporting, setIsExporting] = useState(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      for (let i = 0; i < slides.length; i++) {
        const node = slideRefs.current[i];
        if (node) {
          const dataUrl = await toPng(node, { pixelRatio: 2 });
          saveAs(dataUrl, `slide-${i + 1}.png`);
          
          // Add a small delay between downloads to prevent browser throttling
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('Failed to export slides:', error);
      alert('Failed to export slides. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bgMain p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-brand-textPrimary">Carousel Generator</h1>
          <button
            onClick={handleExportAll}
            disabled={isExporting}
            className="px-6 py-3 bg-[#7C3AED] text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {isExporting ? 'Exporting...' : 'Export All as PNG'}
          </button>
        </div>

        <div className="flex flex-col items-center gap-12 overflow-y-auto pb-12">
          {slides.map((slide, index) => (
            <div 
              key={slide.id} 
              className="shadow-2xl ring-1 ring-white/10 rounded-xl overflow-hidden transform scale-75 origin-top -mb-[337px]"
            >
              <CarouselSlide
                data={slide}
                ref={el => { slideRefs.current[index] = el; }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
