import React from 'react';
import { Settings, Eye } from 'lucide-react';
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
  shareId?: string | null;
  onShareStart?: () => void;
}

export const AppShare: React.FC<AppShareProps> = ({
  ui,
  lang,
  user,
  isPublicView,
  publicNickname,
  currentSurvey,
  profileTypeLabel,
  onShowSettings,
  shareId,
  onShareStart
}) => {
  const shareUrl = (source?: string) => {
     // Require shareId for public links to hide user.id/google_id
     const id = shareId || 'public';
     const baseUrl = window.location.origin + '/results/' + id;
     const params = new URLSearchParams();
     if (source) params.set('s', source);
     
     // Only use public_id for referrals, never internal google_id
     if (user?.public_id) params.set('ref', user.public_id);
     
     // If we use shareId, it already points to a specific test, so 't' is not needed.
     // 't' is only a fallback for legacy non-UUID links which are now deprecated.
     if (!shareId && currentSurvey?.id) params.set('t', currentSurvey.id);
     
     const qs = params.toString();
     return qs ? `${baseUrl}?${qs}` : baseUrl;
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
          <div className="flex flex-wrap justify-center gap-2">
            <button 
              onClick={onShowSettings}
              className="flex items-center gap-2 px-6 py-3 bg-brand-paper border border-stone-line text-brand-graphite rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:border-brand-clay hover:text-brand-clay transition-all duration-300"
            >
              <Settings className="w-4 h-4" />
              {ui.editProfileSettings}
            </button>
            <a 
              href={shareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-brand-paper border border-stone-line text-brand-graphite rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:border-brand-ink hover:text-brand-ink transition-all duration-300"
            >
              <Eye className="w-4 h-4" />
              {ui.previewPublic}
            </a>
          </div>
        )}
        
        <a 
          href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl('r'))}&title=${encodeURIComponent(`I just discovered my ${profileTypeLabel || ''} Cognitive Architecture. What's yours?`)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onShareStart?.()}
          className="flex items-center gap-3 px-6 py-3 bg-[#FF4500] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-md"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.056 1.597.011.103.011.205.011.309 0 3.363-4.522 6.096-10.092 6.096-5.57 0-10.092-2.733-10.092-6.096 0-.104.011-.206.011-.309a1.735 1.735 0 0 1-1.056-1.597c0-.968.786-1.754 1.754-1.754.463 0 .89.182 1.207.491 1.207-.856 2.85-1.427 4.674-1.488l.8-3.747 3.597.747c-.012.062-.012.125-.012.192a1.25 1.25 0 1 1 1.25-1.25zm-2.511 7.221c-.689 0-1.25.56-1.25 1.25s.561 1.25 1.25 1.25S17 13.914 17 13.225s-.561-1.25-1.25-1.25zm-6.22 0c-.689 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25c.689 0 1.25-.56 1.25-1.25s-.561-1.25-1.25-1.25zm4.243 4.646c-.114-.114-.302-.114-.416 0-.616.616-1.637.74-2.11.74-.474 0-1.494-.124-2.11-.74a.294.294 0 0 0-.416 0 .294.294 0 0 0 0 .415c.749.749 2.083.87 2.526.87s1.777-.121 2.526-.87a.294.294 0 0 0 0-.415z"/>
          </svg>
          {ui.shareReddit}
        </a>
        
        <a 
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl('l'))}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onShareStart?.()}
          className="flex items-center gap-3 px-6 py-3 bg-[#0077b5] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-md"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
          {ui.shareLinkedIn}
        </a>
      </div>
    </div>
  );
};
