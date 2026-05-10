import React from 'react';
import { ShieldAlert, Download } from 'lucide-react';
import { UIStrings } from '@/types';

interface ShareSettingsModalProps {
  show: boolean;
  onClose: () => void;
  ui: UIStrings;
  isPublic: boolean;
  setIsPublic: (val: boolean) => void;
  useRealName: boolean;
  setUseRealName: (val: boolean) => void;
  nickname: string;
  setNickname: (val: string) => void;
  userId?: string;
  publicId?: string;
  shareId?: string | null;
  onSave: () => void;
}

export const ShareSettingsModal: React.FC<ShareSettingsModalProps> = ({
  show,
  onClose,
  ui,
  isPublic,
  setIsPublic,
  useRealName,
  setUseRealName,
  nickname,
  setNickname,
  userId,
  publicId,
  shareId,
  onSave
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 animate-fade-in backdrop-blur-xl bg-brand-ink/40">
      <div className="bg-brand-bgMain shadow-2xl rounded-[3rem] border border-stone-line w-full max-w-lg overflow-hidden flex flex-col animate-scale-in">
        <div className="p-8 md:p-12 space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand-bgCard flex items-center justify-center border border-stone-line text-brand-ink">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold text-brand-textPrimary leading-tight tracking-tight">Public Profile Settings</h3>
              <p className="text-stone-400 text-sm font-sans mt-2">Control how your cognitive architecture is shared with the world.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-brand-bgCard/50 rounded-2xl border border-stone-line/50">
              <div className="space-y-1">
                <p className="text-sm font-bold text-brand-textPrimary">Make Profile Public</p>
                <p className="text-xs text-stone-400">Allows anyone with the link to see your results.</p>
              </div>
              <button 
                onClick={() => setIsPublic(!isPublic)}
                className={`w-12 h-6 rounded-full transition-colors relative ${isPublic ? 'bg-brand-ink' : 'bg-stone-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isPublic ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="useRealName" 
                  checked={useRealName} 
                  onChange={(e) => setUseRealName(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-line text-brand-ink focus:ring-brand-ink"
                />
                <label htmlFor="useRealName" className="text-sm text-brand-textPrimary font-bold">Show my real name</label>
              </div>
              
              {!useRealName && (
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Public Nickname</label>
                   <input 
                     type="text"
                     value={nickname}
                     onChange={(e) => setNickname(e.target.value)}
                     placeholder="Anonymous"
                     className="w-full px-4 py-3 bg-brand-bgCard rounded-xl border border-stone-line focus:ring-1 focus:ring-brand-ink outline-none text-sm"
                   />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Share Link (with referral)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}/results/${shareId || userId}?ref=${publicId || userId}`}
                  className="flex-1 px-4 py-3 bg-brand-bgCard/30 rounded-xl border border-stone-line text-xs font-mono text-stone-500 overflow-hidden text-ellipsis"
                />
                <button 
                  onClick={() => {
                    window.navigator.clipboard.writeText(`${window.location.origin}/results/${shareId || userId}?ref=${publicId || userId}`);
                  }}
                  className="px-4 py-3 bg-brand-bgMain border border-stone-line rounded-xl text-brand-ink hover:bg-brand-bgCard transition-colors"
                >
                  <Download className="w-4 h-4 rotate-[-90deg]" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
             <button 
               onClick={onClose}
               className="flex-1 py-4 text-sm font-bold text-stone-400 uppercase tracking-widest hover:text-stone-600 transition-colors"
             >
               {ui.back}
             </button>
             <button 
               onClick={onSave}
               className="flex-1 py-4 bg-brand-ink text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-brand-inkHover hover:shadow-lg transition-all"
             >
               {ui.finish}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
