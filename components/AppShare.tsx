import React from 'react';
import { Share2, Settings, Download } from 'lucide-react';
import { UIStrings, Language, SurveyDefinition } from '../types';

interface AppShareProps {
  ui: UIStrings;
  lang: Language;
  user: any;
  isPublicView?: boolean;
  publicNickname?: string;
  currentSurvey?: SurveyDefinition | null;
  profileTypeLabel?: string;
  onShowSettings?: () => void;
}

export const AppShare: React.FC<AppShareProps> = ({
  ui,
  lang,
  user,
  isPublicView,
  publicNickname,
  currentSurvey,
  profileTypeLabel,
  onShowSettings
}) => {
  const shareUrl = (source: string) => {
     const baseUrl = window.location.origin + '/results/' + (user?.id || 'public');
     const params = new URLSearchParams();
     params.set('s', source);
     if (user?.id) params.set('ref', user.id);
     return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className="mb-20 p-8 md:p-12 bg-brand-paper-accent/30 backdrop-blur-sm rounded-[2.5rem] border border-stone-line/50 flex flex-col md:flex-row items-center justify-between gap-8 group relative overflow-hidden">
      <div className="text-center md:text-left relative z-10">
        <h3 className="text-xl md:text-2xl font-serif font-bold text-brand-graphite mb-2">
          {isPublicView ? (publicNickname || 'Anonymous') : ui.shareProfile}
        </h3>
        <p className="text-stone-400 text-sm font-sans max-w-sm">
          {isPublicView ? ui.resultsDesc : ui.shareDescription}
        </p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4 relative z-10">
        {!isPublicView && user && onShowSettings && (
          <button 
            onClick={onShowSettings}
            className="flex items-center gap-2 px-6 py-3 bg-brand-paper border border-stone-line text-brand-graphite rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:shadow-soft transition-all duration-300"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        )}
        
        <a 
          href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl('r'))}&title=${encodeURIComponent(`I discovered my ${profileTypeLabel ? `${profileTypeLabel} (${currentSurvey?.title[lang] || ui.resultsTitle})` : (currentSurvey?.title[lang] || ui.resultsTitle)}. What's yours?`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-6 py-3 bg-[#FF4500] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-md"
        >
          <Share2 className="w-5 h-5" />
          {ui.shareReddit}
        </a>
        
        <a 
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl('l'))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-6 py-3 bg-[#0077b5] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-md"
        >
          <Share2 className="w-5 h-5" />
          {ui.shareLinkedIn}
        </a>
      </div>
    </div>
  );
};
