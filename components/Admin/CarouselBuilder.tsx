import React, { useRef, useState } from 'react';
import { CarouselSlide, SlideData } from './CarouselSlide';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

const SAMPLE_SLIDES: SlideData[] = [
  {
    "title": "Your brain has its own operating system.",
    "text": "Do you know its version?",
    "accent": true
  },
  {
    "title": "Standard tests are obsolete.",
    "text": "Most psychological tests ignore neurobiology. NeuroProfile v5 uses VVIQ and SDAM metrics to analyze your actual cognitive processor.",
    "accent": false
  },
  {
    "title": "The Output:",
    "text": "1. Cognitive Map (Aphantasia, Spatial Intelligence).\n2. AI Prompts tailored to your neuro-architecture.\n3. Monetization strategy for your specific cognitive traits.",
    "accent": false
  },
  {
    "title": "System Initialization",
    "text": "Run the core diagnostic via the link in bio.",
    "accent": true
  }
];

export const CarouselBuilder: React.FC = () => {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(SAMPLE_SLIDES, null, 2));
  const [slides, setSlides] = useState<SlideData[]>(SAMPLE_SLIDES);
  const [isExporting, setIsExporting] = useState(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleUpdateSlides = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        const mapped = parsed.map((s, i) => ({
          ...s,
          id: s.id || `slide-${i}`,
          slideNumber: i + 1,
          totalSlides: parsed.length
        }));
        setSlides(mapped);
      }
    } catch (e) {
      alert('Invalid JSON input');
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      for (let i = 0; i < slides.length; i++) {
        const node = slideRefs.current[i];
        if (node) {
          const dataUrl = await toPng(node, { pixelRatio: 2 });
          saveAs(dataUrl, `slide-${i + 1}.png`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('Failed to export slides:', error);
      alert('Failed to export slides');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bgMain p-8">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Controls */}
        <div className="space-y-6 lg:sticky lg:top-8 h-fit">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-brand-textPrimary">Carousel Generator</h1>
            <button
              onClick={handleExportAll}
              disabled={isExporting}
              className="px-6 py-3 bg-[#7C3AED] text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-lg"
            >
              {isExporting ? 'Exporting...' : 'Export All PNG'}
            </button>
          </div>

          <div className="space-y-4 bg-brand-bgCard p-6 rounded-3xl border border-stone-line/50">
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400">
              Slide Data (JSON Array)
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full h-[400px] bg-stone-bg/50 border border-stone-line rounded-2xl p-4 font-mono text-sm focus:ring-2 focus:ring-[#7C3AED]/20 outline-none transition-all"
            />
            <button
              onClick={handleUpdateSlides}
              className="w-full py-4 bg-brand-ink text-white rounded-2xl font-bold hover:bg-brand-ink/90 transition-all"
            >
              Update Preview
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center gap-8 pb-24">
          {slides.map((slide, index) => (
            <div 
              key={slide.id} 
              className="shadow-2xl ring-1 ring-white/10 rounded-2xl overflow-hidden transform scale-[0.45] origin-top -mb-[740px] last:mb-0"
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
