import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Info, Check } from 'lucide-react';
import { UIStrings } from '@/types';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  ui: UIStrings;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onClose, onAccept, ui }) => {
  const [hasConsented, setHasConsented] = useState(false);
  const [hasMLConsented, setHasMLConsented] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 pt-12 sm:pt-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500">
            <ShieldCheck className="w-8 h-8" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{ui.consentTitle}</h2>
          </div>

          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="font-bold mb-1">{ui.disclaimerTitle}</p>
                <p className="leading-relaxed">{ui.disclaimer}</p>
              </div>
            </div>

            <div className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <Info className="w-5 h-5 text-blue-500 shrink-0" />
              <div>
                <p className="font-bold mb-1">{ui.gdprTitle}</p>
                <p className="leading-relaxed">{ui.gdprText}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group">
              <div className="relative flex items-center justify-center pt-0.5">
                <input 
                  type="checkbox" 
                  className="peer h-5 w-5 appearance-none rounded border-2 border-slate-300 dark:border-slate-600 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                  checked={hasConsented}
                  onChange={(e) => setHasConsented(e.target.checked)}
                />
                <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {ui.consentCheckbox}
              </span>
            </label>

            <label className="flex gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group">
              <div className="relative flex items-center justify-center pt-0.5">
                <input 
                  type="checkbox" 
                  className="peer h-5 w-5 appearance-none rounded border-2 border-slate-300 dark:border-slate-600 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                  checked={hasMLConsented}
                  onChange={(e) => setHasMLConsented(e.target.checked)}
                />
                <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {ui.consentMLCheckbox || "I consent to the use of my depersonalized data to improve AI models."}
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 h-12 px-6 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all order-2 sm:order-1"
            >
              {ui.back}
            </button>
            <button
              disabled={!hasConsented || !hasMLConsented}
              onClick={onAccept}
              className={`flex-1 h-12 px-6 rounded-xl font-bold transition-all shadow-lg active:scale-95 order-1 sm:order-2 ${
                (hasConsented && hasMLConsented) 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30' 
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              {ui.accept}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
