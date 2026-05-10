import React from 'react';
import { Pricing } from '../Pricing';
import { ArrowLeft } from 'lucide-react';
import { UIStrings, Language } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useSeoMetadata } from '@/hooks/useSeoMetadata';

interface PricingPageProps {
    ui: UIStrings;
    language: Language;
    onStartSurvey: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ ui, language, onStartSurvey }) => {
    const navigate = useNavigate();
    useSeoMetadata({
        title: ui.pricingTitle || 'Pricing',
        description: ui.pricingDesc || 'Discover our cognitive profile plans.',
        canonical: '/pricing'
    });

    return (
        <div className="animate-fade-in pb-20 pt-6 md:pt-12">
            <div className="max-w-6xl mx-auto px-6 mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-stone-400 hover:text-brand-ink transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">{ui.back || 'Back'}</span>
                </button>
            </div>

            <Pricing
                ui={ui}
                language={language}
                onStartFree={() => { navigate('/'); setTimeout(onStartSurvey, 100); }}
                onStartPro={() => { navigate('/'); setTimeout(onStartSurvey, 100); }}
                onStartBusiness={() => window.location.href = "mailto:ingvar.soloma@gmail.com"}
            />
        </div>
    );
};
