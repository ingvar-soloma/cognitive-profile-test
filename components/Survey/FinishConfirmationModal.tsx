import React from 'react';
import { BrainCircuit, X, Languages, CheckCircle, Shield, Heart } from 'lucide-react';
import { Language } from '@/types';

interface FinishConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    ui: any;
    language: Language;
    onLanguageChange: (lang: Language) => void;
    tone: string;
    onToneChange: (tone: string) => void;
    cost?: number;
}

export const FinishConfirmationModal: React.FC<FinishConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    ui,
    language,
    onLanguageChange,
    tone,
    onToneChange,
    cost = 0
}) => {
    if (!isOpen) return null;

    const languages: { code: Language; label: string }[] = [
        { code: 'uk', label: 'Українська' },
        { code: 'en', label: 'English' },
        { code: 'ru', label: 'Русский' }
    ];

    const currentLangLabel = languages.find(l => l.code === language)?.label || language;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-brand-ink/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-brand-bgMain dark:bg-stone-bg rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in border border-stone-line">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-stone-300 hover:text-brand-textPrimary transition-colors p-1"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-brand-sage/10 rounded-2xl flex items-center justify-center text-brand-sage mb-6">
                        <BrainCircuit className="w-10 h-10" />
                    </div>

                    <h2 className="text-2xl font-serif font-bold text-brand-textPrimary mb-3 tracking-tight">
                        {ui.finishLanguageTitle}
                    </h2>

                    <p className="text-stone-500 mb-6 leading-relaxed text-sm font-sans px-4">
                        {ui.finishLanguageNote.replace('{lang}', currentLangLabel)}
                    </p>

                    <div className="w-full space-y-3 mb-8">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">
                            {ui.changeLanguage}
                            <span className="block mt-1 font-normal lowercase opacity-60">{ui.languageSyncNote}</span>
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => onLanguageChange(lang.code)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                        language === lang.code
                                            ? 'bg-brand-ink text-white border-brand-ink shadow-soft'
                                            : 'bg-stone-bg text-brand-textPrimary border-stone-line hover:bg-stone-100'
                                    }`}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-full space-y-3 mb-10 border-t border-stone-line pt-6">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">
                            {ui.chooseTone}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => onToneChange('professional')}
                                className={`px-4 py-3 rounded-xl text-[11px] font-bold transition-all border flex flex-col items-center gap-1 ${
                                    tone === 'professional'
                                        ? 'bg-brand-ink text-white border-brand-ink shadow-soft'
                                        : 'bg-stone-bg text-brand-textPrimary border-stone-line hover:bg-stone-100'
                                }`}
                            >
                                <Shield className="w-4 h-4 mb-1" />
                                {ui.toneProfessional}
                            </button>
                            <button
                                onClick={() => onToneChange('friendly')}
                                className={`px-4 py-3 rounded-xl text-[11px] font-bold transition-all border flex flex-col items-center gap-1 ${
                                    tone === 'friendly'
                                        ? 'bg-brand-ink text-white border-brand-ink shadow-soft'
                                        : 'bg-stone-bg text-brand-textPrimary border-stone-line hover:bg-stone-100'
                                }`}
                            >
                                <Heart className="w-4 h-4 mb-1" />
                                {ui.toneFriendly}
                            </button>
                        </div>
                        <p className="text-[10px] text-stone-400 font-sans italic mt-2 leading-relaxed">
                            {ui.toneHelp}
                        </p>
                    </div>

                    <div className="w-full mb-8 pt-2">
                         <div className="flex items-center justify-between px-2 text-stone-400 text-[11px] font-bold uppercase tracking-widest border-y border-stone-line/50 py-3">
                             <span>{ui.generationCost}</span>
                             <div className="flex items-center gap-2">
                                 {cost === 0 ? (
                                     <>
                                         <span className="line-through opacity-50">100</span>
                                         <span className="text-brand-sage text-xs">0 {ui.credits}</span>
                                     </>
                                 ) : (
                                     <span className="text-brand-ink text-xs">{cost} {ui.credits}</span>
                                 )}
                             </div>
                         </div>
                         {cost === 0 && (
                             <p className="text-brand-sage text-[10px] mt-2 font-medium italic">
                                 ✨ {ui.firstGenerationFree}
                             </p>
                         )}
                    </div>

                    <div className="w-full flex flex-col gap-3">
                        <button
                            onClick={onConfirm}
                            className="w-full py-4 bg-brand-sage text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-brand-sage/90 shadow-soft transition-all flex items-center justify-center gap-2"
                        >
                            {ui.confirmFinishAndGenerate}
                            <CheckCircle className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
