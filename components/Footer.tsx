import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Mail, MessageCircle } from 'lucide-react';
import { Language, UIStrings } from '@/types';

interface FooterProps {
    ui: any;
    language: Language;
}

export const Footer: React.FC<FooterProps> = ({ ui, language }) => {
    const infoLinks = [
        { path: '/about', label: ui.navAbout },
        { path: '/how-it-works', label: ui.navHowItWorks },
        { path: '/faq', label: ui.navFaq },
        { path: '/news', label: ui.navNews },
        { path: '/blog', label: ui.navBlog },
    ];

    const legalLinks = [
        { path: '/terms', label: ui.navTerms },
        { path: '/privacy', label: ui.privacyPolicy },
    ];

    const year = new Date().getFullYear();

    return (
        <footer className="bg-stone-bg dark:bg-brand-obsidian/40 border-t border-stone-line transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    {/* Brand */}
                    <div className="md:col-span-4">
                        <Link to="/" className="flex items-center gap-2 text-brand-graphite mb-6 group">
                            <div className="bg-brand-ink p-1.5 rounded-lg group-hover:scale-105 transition-transform">
                                <BrainCircuit className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-serif text-xl font-bold tracking-tight text-brand-graphite">
                                NP42 NeuroProfile
                            </span>
                        </Link>
                        <p className="text-stone-500 text-sm leading-relaxed mb-4 max-w-sm">
                            {ui.heroSubtitle}
                        </p>
                        <p className="text-[10px] text-stone-400 leading-relaxed mb-8 max-w-sm font-medium italic">
                            {ui.complianceDisclaimer}
                        </p>
                        <div className="flex gap-4">
                            <a href="mailto:ingvar.soloma@gmail.com" className="w-10 h-10 rounded-xl bg-white dark:bg-brand-paper-accent border border-stone-line flex items-center justify-center text-stone-400 hover:text-brand-ink transition-all shadow-sm">
                                <Mail className="w-5 h-5" />
                            </a>
                            <a href="https://t.me/ingvar_soloma" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white dark:bg-brand-paper-accent border border-stone-line flex items-center justify-center text-stone-400 hover:text-brand-ink transition-all shadow-sm">
                                <MessageCircle className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links - Info */}
                    <div className="md:col-span-4 md:col-start-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-6">
                            {ui.navAbout}
                        </h4>
                        <ul className="space-y-4">
                            {infoLinks.map(link => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-sm font-bold text-brand-graphite hover:text-brand-ink transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links - Legal */}
                    <div className="md:col-span-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-6">
                            {ui.legalInfo || 'Legal'}
                        </h4>
                        <ul className="space-y-4">
                            {legalLinks.map(link => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-sm font-bold text-brand-graphite hover:text-brand-ink transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-20 pt-8 border-t border-stone-line flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-widest">
                        &copy; {year} NP42 NeuroProfile. Project by Ingvar Soloma.
                    </p>
                    <p className="text-[10px] sm:text-xs text-stone-300 font-medium italic">
                        Built for those who see beyond. Don't Panic.
                    </p>
                </div>
            </div>
        </footer>
    );
};
