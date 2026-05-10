import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, Moon, Sun, ChevronDown, BookOpen, HelpCircle, FileText, Zap, Newspaper, Brain, Menu, X, Globe, Sparkles } from 'lucide-react';
import { Language, UIStrings } from '@/types';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useLocation, Link } from 'react-router-dom';

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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [adminStats, setAdminStats] = useState<{ online: number, total: number } | null>(null);
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

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    // Admin polling for online stats
    useEffect(() => {
        if (!isAdmin || !user) return;

        const fetchStats = async () => {
            try {
                const storedAuth = localStorage.getItem('auth_token');
                if (!storedAuth) return;
                const auth = JSON.parse(storedAuth);
                
                const apiUrl = import.meta.env.VITE_API_URL || '';
                const res = await fetch(`${apiUrl}/api/admin/online-stats?user_id=${auth.id}&hash=${auth.hash}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAdminStats(data);
                }
            } catch (err) {
                console.error('Failed to fetch admin stats', err);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, [isAdmin, user]);

    const infoLinks = [
        { path: '/early-access', label: ui.navEarlyAccess, icon: Sparkles },
        { path: '/about', label: ui.navAbout, icon: Brain },
        { path: '/how-it-works', label: ui.navHowItWorks, icon: Zap },
        { path: '/blog', label: ui.navBlog, icon: BookOpen, soon: true },
        { path: '/faq', label: ui.navFaq, icon: HelpCircle },
        { path: '/news', label: ui.navNews, icon: Newspaper },
        { path: '/terms', label: ui.navTerms, icon: FileText },
        { path: '/privacy', label: ui.privacyPolicy, icon: BookOpen },
    ];

    const mainLinks: { path: string; label: string; active: boolean; soon?: boolean; isNew?: boolean }[] = [
        { path: '/', label: ui.navTests, active: pathname === '/' || appState === 'SURVEY' },
        { path: '/results', label: ui.navResults, active: pathname.startsWith('/results') || pathname.startsWith('/history') },
        { path: '/recommendations', label: ui.navRecommendations, active: pathname === '/recommendations', isNew: true },
        { path: '/pricing', label: 'Pricing', active: pathname === '/pricing' },
    ];

    const infoPathnames = infoLinks.map(l => l.path);
    const isInfoActive = infoPathnames.includes(pathname);

    const navBtnClass = (active: boolean) =>
        `px-3 lg:px-5 py-1.5 rounded-full text-[10px] lg:text-[11px] uppercase tracking-widest font-bold transition-all duration-300 ${
            active
                ? 'bg-brand-bgCard text-brand-ink shadow-sm ring-1 ring-stone-line'
                : 'text-stone-400 hover:text-brand-textPrimary'
        }`;

    return (
        <header className="border-b border-stone-line bg-brand-bgMain/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo + Nav */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="md:hidden p-2 text-stone-500 hover:text-brand-ink transition-colors mr-1"
                        aria-label="Open Menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <Link
                        to="/"
                        className="flex items-center gap-2 text-brand-textPrimary cursor-pointer focus:outline-none rounded-lg transition-transform active:scale-95"
                        aria-label="Go to Home"
                    >
                        <div className="bg-brand-ink p-1.5 rounded-lg shrink-0">
                            <BrainCircuit className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-serif text-base sm:text-lg lg:text-xl font-bold tracking-tight text-brand-textPrimary hidden xs:block">
                            NP42 | NeuroProfile
                        </span>
                        <span className="ml-[6px] px-1.5 py-0.5 rounded-full bg-brand-ink/10 text-brand-ink text-[10px] font-bold uppercase tracking-tight border border-brand-ink/20 leading-none inline-flex items-center shadow-sm shrink-0">
                            beta V4
                        </span>
                    </Link>

                    <nav className="hidden md:flex ml-4 lg:ml-8 bg-stone-bg/80 p-1 rounded-full border border-stone-line gap-0.5 lg:gap-1">
                        {mainLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={navBtnClass(link.active)}
                            >
                                {link.label}
                                {link.soon && (
                                    <span className="ml-1.5 px-1 py-0.5 rounded-md bg-brand-clay/10 text-brand-clay text-[7px] font-extrabold uppercase tracking-tighter border border-brand-clay/20 leading-none inline-block align-middle">
                                        {ui.soon}
                                    </span>
                                )}
                                {link.isNew && (
                                    <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-brand-ink/10 text-brand-ink text-[7px] font-extrabold uppercase tracking-tighter border border-brand-ink/20 leading-none inline-block align-middle shadow-sm">
                                        {ui.newLabel}
                                    </span>
                                )}
                            </Link>
                        ))}

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
                                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-52 bg-brand-bgCard border border-stone-line rounded-2xl shadow-soft py-1.5 z-50">
                                    {infoLinks.map(link => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setInfoOpen(false)}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider transition-colors ${
                                                pathname === link.path
                                                    ? 'text-brand-ink bg-brand-ink/5'
                                                    : 'text-stone-500 hover:text-brand-textPrimary hover:bg-stone-bg/60'
                                            }`}
                                        >
                                            <link.icon className="w-3.5 h-3.5 flex-shrink-0" />
                                            {link.label}
                                            {link.soon && (
                                                <span className="ml-auto px-1 py-0.5 rounded-md bg-brand-clay/10 text-brand-clay text-[7px] font-extrabold uppercase tracking-tighter border border-brand-clay/20 leading-none">
                                                    {ui.soon}
                                                </span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Admin */}
                        {isAdmin && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onNavigate('USERS')}
                                    className={navBtnClass(pathname === '/users')}
                                >
                                    {ui.manageProfiles}
                                </button>
                                {adminStats && (
                                    <div className="flex items-center gap-2 px-2 py-1 bg-brand-sage/10 rounded-full border border-brand-sage/20 animate-pulse">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-sage shadow-[0_0_8px_rgba(132,153,135,0.8)]" />
                                        <span className="text-[9px] font-bold text-brand-sage uppercase tracking-tighter">
                                            {adminStats.online} / {adminStats.total}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                    {/* Minimize Language selector */}
                    <div className="flex items-center border border-stone-line bg-stone-bg/40 rounded-lg p-0.5 shrink-0">
                        {(['uk', 'en', 'ru'] as Language[]).map(lang => (
                            <button
                                key={lang}
                                onClick={() => onSetLanguage(lang)}
                                className={`px-1.5 sm:px-2 py-1 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-tight transition-all ${
                                    language === lang
                                        ? 'bg-white text-brand-ink shadow-sm ring-1 ring-stone-line/50'
                                        : 'text-stone-400 hover:text-stone-600'
                                }`}
                            >
                                {lang === 'uk' ? 'UA' : lang.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* Theme toggle */}
                    <button
                        onClick={onToggleTheme}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-stone-bg text-brand-textPrimary border border-stone-line hover:border-brand-ink/40 transition-all active:scale-95 group shadow-sm shrink-0"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'light' ? (
                            <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-ink group-hover:fill-brand-ink transition-all" />
                        ) : (
                            <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-clay group-hover:rotate-45 transition-transform" />
                        )}
                    </button>

                    <div className="h-4 w-px bg-stone-line hidden sm:block mx-0.5" />

                    {/* User / Login */}
                    <div className="flex items-center gap-2">
                        {user ? (
                            <div className="flex items-center gap-2">
                                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-brand-sage/10 rounded-full border border-brand-sage/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-sage shadow-[0_0_8px_rgba(132,153,135,0.8)]" />
                                    <span className="text-[10px] font-bold text-brand-sage uppercase tracking-tighter">
                                        {user.credits ?? 0} {ui.credits || 'Credits'}
                                    </span>
                                </div>
                                <button 
                                    onClick={onLogout}
                                    className="flex items-center gap-2 p-1 hover:bg-stone-bg rounded-lg transition-colors"
                                    title={ui.logout}
                                >
                                    {user.photo_url ? (
                                        <img src={user.photo_url} alt={user.first_name} className="w-8 h-8 rounded-lg border border-stone-line shadow-sm" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-lg bg-brand-clay/10 text-brand-clay flex items-center justify-center font-serif italic font-bold text-sm border border-brand-clay/20">
                                            {user.first_name?.[0] || 'U'}
                                        </div>
                                    )}
                                    <span className="hidden lg:block text-[10px] font-bold text-stone-400 uppercase tracking-widest">{ui.logout}</span>
                                </button>
                            </div>
                        ) : (
                            <div className="scale-90 sm:scale-100 origin-right">
                                <GoogleAuthButton useOneTap={false} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[1000] md:hidden">
                    <div 
                        className="absolute inset-0 bg-brand-textPrimary/40 backdrop-blur-sm transition-opacity duration-300" 
                        onClick={() => setMobileMenuOpen(false)} 
                    />
                    <div className="absolute inset-y-0 left-0 w-[85%] max-w-[320px] h-screen bg-brand-bgMain shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 z-[1001]">
                        <div className="p-5 border-b border-stone-line flex items-center justify-between bg-brand-bgMain">
                             <div className="flex items-center gap-2">
                                <div className="bg-brand-ink p-1.5 rounded-lg">
                                    <BrainCircuit className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-serif text-lg font-bold text-brand-textPrimary">NP42 | NeuroProfile</span>
                                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-brand-ink/10 text-brand-ink text-[10px] font-bold uppercase tracking-tight border border-brand-ink/20 leading-none inline-flex items-center shadow-sm">
                                    beta V4
                                </span>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-stone-500 hover:text-brand-clay">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-8 bg-brand-bgMain">
                            {user && (
                                <div className="mx-1 px-4 py-3 bg-brand-sage/10 rounded-2xl border border-brand-sage/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-sage shadow-[0_0_8px_rgba(132,153,135,0.8)]" />
                                        <span className="text-[10px] font-bold text-brand-sage uppercase tracking-widest">{ui.credits || 'Credits'}</span>
                                    </div>
                                    <span className="text-sm font-bold text-brand-sage">{user.credits ?? 0}</span>
                                </div>
                            )}
                            <div className="space-y-2">
                                <h3 className="px-3 text-[11px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-3">{ui.navTests}</h3>
                                <div className="space-y-1">
                                    {mainLinks.map(link => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                                                link.active ? 'bg-brand-ink/10 text-brand-ink ring-1 ring-brand-ink/20' : 'text-brand-textPrimary hover:bg-stone-bg'
                                            }`}
                                        >
                                            {link.label}
                                            {link.soon && (
                                                <span className="ml-2 px-1 py-0.5 rounded-md bg-brand-clay/10 text-brand-clay text-[7px] font-extrabold uppercase tracking-tighter border border-brand-clay/20 leading-none">
                                                    {ui.soon}
                                                </span>
                                            )}
                                            {link.isNew && (
                                                <span className="ml-2 px-1.5 py-0.5 rounded-md bg-brand-ink/10 text-brand-ink text-[7px] font-extrabold uppercase tracking-tighter border border-brand-ink/20 leading-none shadow-sm">
                                                    {ui.newLabel}
                                                </span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="px-3 text-[11px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-3">{ui.navAbout}</h3>
                                <div className="grid grid-cols-1 gap-1">
                                    {infoLinks.map(link => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                                                pathname === link.path ? 'bg-brand-ink/10 text-brand-ink ring-1 ring-brand-ink/20' : 'text-brand-textPrimary hover:bg-stone-bg'
                                            }`}
                                        >
                                            <link.icon className="w-4.5 h-4.5 opacity-70" />
                                            {link.label}
                                            {link.soon && (
                                                <span className="ml-auto px-1 py-0.5 rounded-md bg-brand-clay/10 text-brand-clay text-[7px] font-extrabold uppercase tracking-tighter border border-brand-clay/20 leading-none">
                                                    {ui.soon}
                                                </span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-stone-line bg-stone-bg/50 space-y-4">
                            {/* Settings (Language + Theme) */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-stone-400" />
                                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{ui.language}</span>
                                    </div>
                                    <div className="flex gap-1 border border-stone-line/50 p-0.5 rounded-lg bg-brand-bgMain/50">
                                        {(['uk', 'en', 'ru'] as Language[]).map(lang => (
                                            <button
                                                key={lang}
                                                onClick={() => onSetLanguage(lang)}
                                                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                                                    language === lang ? 'bg-brand-ink text-white shadow-sm' : 'text-stone-500 hover:text-brand-textPrimary'
                                                }`}
                                            >
                                                {lang.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {theme === 'light' ? <Moon className="w-4 h-4 text-stone-400" /> : <Sun className="w-4 h-4 text-stone-400" />}
                                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Theme</span>
                                    </div>
                                    <button
                                        onClick={onToggleTheme}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-bgMain border border-stone-line text-[10px] font-bold text-brand-textPrimary uppercase tracking-widest transition-all active:scale-95"
                                    >
                                        {theme === 'light' ? 'Dark' : 'Light'}
                                    </button>
                                </div>
                            </div>

                            {/* PWA / Browser Link */}
                            {(() => {
                                // Check if in standalone mode (PWA)
                                const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
                                if (isStandalone || true) { // Always show for now if requested, or limit to standalone
                                    return (
                                        <a 
                                            href={window.location.origin + window.location.pathname} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed border-stone-line text-stone-500 hover:text-brand-ink transition-colors group"
                                        >
                                            <Globe className="w-4 h-4 group-hover:animate-pulse" />
                                            <span className="text-[11px] font-bold uppercase tracking-widest">Open in Browser</span>
                                        </a>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    </div>
                </div>
            )}

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
                    const apiUrl = import.meta.env.VITE_API_URL || '';
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
