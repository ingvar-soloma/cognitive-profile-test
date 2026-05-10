import React from 'react';
import { UIStrings, Language } from '@/types';
import { ShieldCheck, Brain, Rocket, Building2 } from 'lucide-react';

interface PricingProps {
    ui: UIStrings;
    language?: Language;
    onStartFree: () => void;
    onStartPro?: () => void;
    onStartBusiness?: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ ui, language, onStartFree, onStartPro, onStartBusiness }) => {
    return (
        <section className="py-16 px-4 border-t border-stone-line/30">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-textPrimary leading-tight">
                        {ui.pricingTitle || "Choose your access tier"}
                    </h2>
                    <p className="text-stone-500 text-lg max-w-2xl mx-auto">
                        {ui.pricingDesc || "Transparent access models tailored to your needs"}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Free Tier */}
                    <div className="flex flex-col bg-brand-bgCard rounded-3xl border border-stone-line p-8 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-brand-clay/10 flex items-center justify-center text-brand-clay">
                                <Brain className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-brand-textPrimary font-serif">
                                {ui.pricingFree || "Free Tier"}
                            </h3>
                        </div>
                        <p className="text-sm text-stone-500 mb-8 flex-1 leading-relaxed">
                            {ui.pricingFreeDesc || "Maximum reach and basic cognitive snapshot. Profile history saved."}
                        </p>
                        <button
                            onClick={onStartFree}
                            className="w-full py-4 px-6 bg-white border border-stone-line rounded-xl text-xs font-bold uppercase tracking-widest text-stone-600 hover:text-brand-ink hover:border-brand-ink/30 transition-all shadow-sm"
                        >
                            {ui.pricingFreeButton || "Start Free (Contribute to Science)"}
                        </button>
                    </div>

                    {/* Pro Tier */}
                    <div className="flex flex-col bg-brand-ink/5 rounded-3xl border-2 border-brand-ink/20 p-8 shadow-md relative transition-transform hover:-translate-y-1 duration-300">
                        <div className="absolute top-0 right-8 -translate-y-1/2 bg-brand-ink text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                            Recommended
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-brand-ink/10 flex items-center justify-center text-brand-ink">
                                <Rocket className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-brand-textPrimary font-serif">
                                {ui.pricingPro || "Pro Tier"}
                            </h3>
                        </div>
                        <div className="text-4xl font-serif font-bold text-brand-ink mb-2">$9.99</div>
                        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-6 border-b border-stone-line/50 pb-6">One-time payment</div>

                        <p className="text-sm text-stone-600 mb-8 flex-1 leading-relaxed">
                            {ui.pricingProDesc || "Full report (20+ parameters), normative comparison and personalized recommendations."}
                        </p>

                        <button
                            onClick={onStartPro}
                            className="w-full py-4 px-6 bg-brand-ink text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-inkHover hover:shadow-lg transition-all"
                        >
                            Get Full Profile
                        </button>
                    </div>

                    {/* Business Tier */}
                    <div className="flex flex-col bg-brand-bgCard rounded-3xl border border-stone-line p-8 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-brand-textPrimary font-serif">
                                {ui.pricingBusiness || "Business Tier"}
                            </h3>
                        </div>
                        <p className="text-sm text-stone-500 mb-8 flex-1 leading-relaxed">
                            {ui.pricingBusinessDesc || "Specialized forms for HR tasks, team analysis, and API integration."}
                        </p>
                        <button
                            onClick={onStartBusiness}
                            className="w-full py-4 px-6 bg-transparent border border-stone-line rounded-xl text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-brand-textPrimary hover:bg-stone-bg transition-all"
                        >
                            Contact Sales
                        </button>
                    </div>
                </div>

                {/* Transparency / Compliance Block */}
                <div className="mt-20 max-w-3xl mx-auto bg-stone-50 dark:bg-stone-900/40 rounded-3xl p-8 border border-stone-200 dark:border-stone-800">
                    <div className="flex items-center gap-3 mb-4">
                        <ShieldCheck className="w-6 h-6 text-brand-clay" />
                        <h4 className="text-brand-textPrimary font-bold font-serif text-lg">
                            {ui.pricingHowWeUseDataTitle || "How we use your data"}
                        </h4>
                    </div>
                    <p className="text-sm text-stone-500 leading-relaxed">
                        {ui.pricingHowWeUseDataDesc || "In the Free tier, your anonymized data is aggregated to train our ML models. In Paid tiers (Pro/Business), your data is strictly isolated and used solely to generate your personal insights."}
                    </p>
                </div>
            </div>
        </section>
    );
};
