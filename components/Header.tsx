import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, Moon, Sun, ChevronDown, BookOpen, HelpCircle, FileText, Zap, Newspaper, Brain } from 'lucide-react';
import { Language } from '@/types';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
    appState: string;
    ui: any;
    language: Language;
    theme: 'light' | 'dark';
    progressPercent: number;
    activeProfileName?: string;
    onSetLanguage: (lang: Language) => void;
    onToggleTheme: () => void;
    onDownloadProgress: () => void;
    onNavigate: (state: any) => void;
    onLogout: () => void;
    user: any;
    isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    appState,
    ui,
    language,
    theme,
    progressPercent,
    onSetLanguage,
    onToggleTheme,
    onNavigate,
    onLogout,
    user,
    isAdmin
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    const [infoOpen, setInfoOpen] = useState(false);
    const infoRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
                setInfoOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const infoLinks = [
        { path: '/about', label: ui.navAbout, icon: Brain },
        { path: '/how-it-works', label: ui.navHowItWorks, icon: Zap },
        { path: '/faq', label: ui.navFaq, icon: HelpCircle },
        { path: '/news', label: ui.navNews, icon: Newspaper },
        { path: '/terms', label: ui.navTerms, icon: FileText },
        { path: '/privacy', label: ui.privacyPolicy, icon: BookOpen },
    ];

    const infoPathnames = infoLinks.map(l => l.path);
    const isInfoActive = infoPathnames.includes(pathname);

    const navBtnClass = (active: boolean) =>
        `px-3 lg:px-5 py-1.5 rounded-full text-[10px] lg:text-[11px] uppercase tracking-widest font-bold transition-all duration-300 ${
            active
                ? 'bg-brand-paper-accent text-brand-ink shadow-sm ring-1 ring-stone-line'
                : 'text-stone-400 hover:text-brand-graphite'
        }`;

    return (
        <header className="border-b border-stone-line bg-brand-paper/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo + Nav */}
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        className="flex items-center gap-2 text-brand-graphite cursor-pointer focus:outline-none rounded-lg transition-transform active:scale-95"
                        onClick={() => navigate('/')}
                        aria-label="Go to Home"
                    >
                        <div className="bg-brand-ink p-1.5 rounded-lg shrink-0">
                            <BrainCircuit className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-serif text-lg lg:text-xl font-bold tracking-tight text-brand-graphite hidden md:block">
                            NeuroProfile
                        </span>
                        <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-md bg-brand-clay/10 text-brand-clay text-[9px] font-bold uppercase tracking-widest border border-brand-clay/20">
                            Beta
                        </span>
                    </button>

                    <nav className="hidden md:flex ml-4 lg:ml-8 bg-stone-bg/80 p-1 rounded-full border border-stone-line gap-0.5 lg:gap-1">
                        {/* Tests — home / survey */}
                        <button
                            onClick={() => onNavigate('INTRO')}
                            className={navBtnClass(pathname === '/' && !!user || appState === 'SURVEY')}
                        >
                            {ui.navTests}
                        </button>

                        {/* Results */}
                        <button
                            onClick={() => onNavigate('DASHBOARD_RESULTS')}
                            className={navBtnClass(pathname.startsWith('/results') || pathname.startsWith('/history'))}
                        >
                            {ui.navResults}
                        </button>

                        {/* Recommendations */}
                        <button
                            onClick={() => onNavigate('RECOMMENDATIONS')}
                            className={navBtnClass(pathname === '/recommendations')}
                        >
                            {ui.navRecommendations}
                        </button>

                        {/* Info dropdown */}
                        <div className="relative" ref={infoRef}>
                            <button
                                onClick={() => setInfoOpen(p => !p)}
                                className={`${navBtnClass(isInfoActive)} flex items-center gap-1`}
                            >
                                {ui.navAbout?.split(' ')[0] ?? 'Info'}
                                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${infoOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {infoOpen && (
                                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-52 bg-brand-paper-accent border border-stone-line rounded-2xl shadow-soft py-1.5 z-50">
                                    {infoLinks.map(link => (
                                        <button
                                            key={link.path}
                                            onClick={() => { navigate(link.path); setInfoOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider transition-colors ${
                                                pathname === link.path
                                                    ? 'text-brand-ink bg-brand-ink/5'
                                                    : 'text-stone-500 hover:text-brand-graphite hover:bg-stone-bg/60'
                                            }`}
                                        >
                                            <link.icon className="w-3.5 h-3.5 flex-shrink-0" />
                                            {link.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Admin */}
                        {isAdmin && (
                            <button
                                onClick={() => onNavigate('USERS')}
                                className={navBtnClass(pathname === '/users')}
                            >
                                {ui.manageProfiles}
                            </button>
                        )}
                    </nav>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Language switcher */}
                    <div className="hidden sm:flex items-center gap-2 text-xs font-medium">
                        {(['uk', 'en', 'ru'] as Language[]).map(lang => (
                            <button
                                key={lang}
                                onClick={() => onSetLanguage(lang)}
                                className={`transition-all py-0.5 px-2 rounded-md ${
                                    language === lang
                                        ? 'text-brand-graphite bg-stone-bg ring-1 ring-stone-line shadow-sm'
                                        : 'text-stone-400 hover:text-brand-graphite'
                                }`}
                            >
                                {lang.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* Theme toggle */}
                    <button
                        onClick={onToggleTheme}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-bg text-brand-graphite border border-stone-line hover:border-brand-ink/40 transition-all active:scale-95 group shadow-sm"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'light' ? (
                            <Moon className="w-4 h-4 text-brand-ink group-hover:fill-brand-ink transition-all" />
                        ) : (
                            <Sun className="w-4 h-4 text-brand-clay group-hover:rotate-45 transition-transform" />
                        )}
                    </button>

                    <div className="h-4 w-px bg-stone-line hidden sm:block mx-1" />

                    {/* User / Login */}
                    {user ? (
                        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                            <button onClick={() => { }} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                {user.photo_url ? (
                                    <img src={user.photo_url} alt={user.first_name} className="w-8 h-8 rounded-full border border-stone-line shadow-sm" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-brand-clay/10 text-brand-clay flex items-center justify-center font-serif italic font-bold text-sm border border-brand-clay/20">
                                        {user.first_name?.[0] || 'U'}
                                    </div>
                                )}
                                <span className="text-sm font-medium hidden sm:block text-brand-graphite">{user.first_name}</span>
                            </button>
                            <button
                                onClick={onLogout}
                                className="text-[10px] font-bold text-stone-400 hover:text-brand-clay transition-colors uppercase tracking-[0.1em]"
                            >
                                {ui.logout}
                            </button>
                        </div>
                    ) : (
                        <GoogleAuthButton useOneTap={true} />
                    )}
                </div>
            </div>

            {/* Progress bar for survey */}
            {appState === 'SURVEY' && (
                <div className="h-1 bg-stone-100 w-full overflow-hidden">
                    <div
                        className="h-full bg-brand-sage transition-all duration-700 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            )}
        </header>
    );
};

export const GoogleAuthButton: React.FC<{ useOneTap?: boolean }> = ({ useOneTap = false }) => {
    return (
        <div className="ml-2">
            <GoogleLogin
                onSuccess={(credentialResponse) => {
                    if (!credentialResponse.credential) return;
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                    fetch(`${apiUrl}/api/auth/google/exchange`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ credential: credentialResponse.credential })
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data && data.id && data.hash) {
                                localStorage.setItem('auth_token', JSON.stringify(data));
                                globalThis.dispatchEvent(new CustomEvent('auth-login', { detail: data }));
                            }
                        })
                        .catch(err => console.error('Google OAuth Exchange Failed', err));
                }}
                onError={() => {
                    console.error('Google Login Failed');
                }}
                useOneTap={useOneTap}
                shape="pill"
            />
        </div>
    );
};
