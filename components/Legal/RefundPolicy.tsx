import React from 'react';
import { ArrowLeft, Ban } from 'lucide-react';
import { UIStrings, Language } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useSeoMetadata } from '@/hooks/useSeoMetadata';

interface RefundPolicyProps {
    ui: UIStrings;
    language: Language;
}

export const RefundPolicy: React.FC<RefundPolicyProps> = ({ ui, language }) => {
    const navigate = useNavigate();
    useSeoMetadata({
        title: `${ui.refundPolicy || 'Refund Policy'}`,
        description: 'Refund Policy',
        canonical: '/refund-policy'
    });

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-20 px-4 pt-12 mt-12 md:mt-20">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-stone-400 hover:text-brand-ink transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">{ui.back}</span>
            </button>

            <header className="mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-clay/10 text-brand-clay rounded-full text-[9px] font-bold tracking-[0.2em] uppercase mb-6 border border-brand-clay/20">
                    <Ban className="w-3 h-3" />
                    Refund Policy
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-graphite leading-tight mb-6">
                    {ui.refundPolicy || 'Refund Policy'}
                </h1>
            </header>

            <div className="grid grid-cols-1 gap-8 mb-16">
                <section className="bg-brand-paper-accent border border-stone-line rounded-[2rem] p-8 shadow-sm">
                    <p className="text-sm text-stone-500 leading-relaxed">
                        Due to the immediate access and digital nature of the AI Cognitive Profile Test, all sales are final. We do not offer refunds once the test results have been generated and accessed by the user. If you experience technical issues preventing you from completing the test, please contact ingvar.soloma@gmail.com within 14 days of purchase.
                    </p>
                </section>
            </div>

            <footer className="mt-20 pt-8 border-t border-stone-line text-center">
                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                    NeuroProfile Project &copy; {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    );
};
