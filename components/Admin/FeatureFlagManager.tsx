import React from 'react';
import { Settings, CheckCircle, XCircle } from 'lucide-react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { UIStrings } from '@/types';

interface FeatureFlagManagerProps {
  ui: UIStrings;
}

export const FeatureFlagManager: React.FC<FeatureFlagManagerProps> = ({ ui }) => {
  const { flags, toggleFlag, loading } = useFeatureFlags();

  if (loading) return <div>Loading flags...</div>;

  return (
    <div className="bg-brand-paper rounded-[2rem] border border-stone-line overflow-hidden p-8 shadow-soft">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-brand-paper-accent flex items-center justify-center border border-stone-line text-brand-ink">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-serif font-bold text-brand-graphite">Feature Flags</h3>
          <p className="text-stone-400 text-sm">Enable or disable application features in real-time.</p>
        </div>
      </div>

      <div className="space-y-4">
        {flags.map((flag) => (
          <div key={flag.code} className="flex items-center justify-between p-6 bg-brand-paper-accent/30 rounded-2xl border border-stone-line/50 hover:border-brand-ink/20 transition-all group">
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-brand-graphite">{flag.name}</span>
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-stone-line">{flag.code}</span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">{flag.description}</p>
            </div>
            
            <button
              onClick={() => toggleFlag(flag.code, !flag.is_enabled)}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                flag.is_enabled 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
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
