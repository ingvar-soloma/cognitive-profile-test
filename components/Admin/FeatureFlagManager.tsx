import React from 'react';
import { Settings, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { UIStrings } from '@/types';

interface FeatureFlagManagerProps {
  ui: UIStrings;
}

export const FeatureFlagManager: React.FC<FeatureFlagManagerProps> = ({ ui }) => {
  const { flags, toggleFlag, loading } = useFeatureFlags();

  if (loading) return <div>Loading flags...</div>;

  return (
    <div className="bg-brand-bgCard rounded-[2.5rem] border border-stone-line/50 overflow-hidden p-8 md:p-12 shadow-soft animate-fade-in">
      <div className="flex items-center gap-5 mb-12">
        <div className="w-14 h-14 rounded-2xl bg-brand-ink/10 flex items-center justify-center border border-brand-ink/20 text-brand-ink shadow-sm">
          <Settings className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-2xl font-serif font-bold text-brand-textPrimary tracking-tight">Feature Flags</h3>
          <p className="text-stone-400 text-sm font-medium">Enable or disable application features in real-time.</p>
        </div>
      </div>

      <div className="space-y-5">
        {flags.map((flag) => (
          <div key={flag.code} className="flex flex-col sm:flex-row sm:items-center justify-between p-8 bg-stone-bg/30 rounded-3xl border border-stone-line/50 hover:border-brand-ink/30 transition-all group gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="font-bold text-brand-textPrimary text-lg">{flag.name}</span>
                <span className="text-[9px] font-mono text-stone-400 uppercase tracking-[0.2em] bg-brand-bgCard px-2.5 py-1 rounded-full border border-stone-line/50 shadow-sm">{flag.code}</span>
              </div>
              <p className="text-sm text-stone-500 leading-relaxed font-medium">{flag.description}</p>
            </div>
            
            <button
              onClick={() => toggleFlag(flag.code, !flag.is_enabled)}
              className={`flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-sm hover:scale-[1.02] active:scale-95 ${
                flag.is_enabled 
                  ? 'bg-brand-sage text-white hover:bg-brand-sage/90 shadow-brand-sage/20' 
                  : 'bg-stone-bg text-stone-400 hover:bg-stone-200 border border-stone-line'
              }`}
            >
              {flag.is_enabled ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {flag.is_enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
