import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { UIStrings } from '@/types';

interface NewsletterSubscribeProps {
    ui: UIStrings;
    /** Pre-filled email (from authenticated user). User can still change it. */
    defaultEmail?: string;
    /** Where the subscription is happening — stored in the backend for analytics */
    source?: string;
}

type SubmitState = 'idle' | 'loading' | 'success' | 'duplicate' | 'error';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const NewsletterSubscribe: React.FC<NewsletterSubscribeProps> = ({
    ui,
    defaultEmail = '',
    source = 'news_page',
}) => {
    const [email, setEmail] = useState(defaultEmail);
    const [state, setState] = useState<SubmitState>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    // Update pre-fill if user logs in after mounting
    useEffect(() => {
        if (defaultEmail && email === '') {
            setEmail(defaultEmail);
        }
    }, [defaultEmail]);

    const isValidEmail = (v: string) =>
        /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(v.trim());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidEmail(email)) {
            setErrorMsg(ui.subscribeInvalidEmail);
            setState('error');
            return;
        }

        setState('loading');
        setErrorMsg('');

        try {
            const res = await fetch(`${API_BASE_URL}/api/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase(), source }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.status === 'already_subscribed') {
                    setState('duplicate');
                } else {
                    setState('success');
                }
            } else if (res.status === 422) {
                setErrorMsg(ui.subscribeInvalidEmail);
                setState('error');
            } else {
                setErrorMsg(ui.subscribeError);
                setState('error');
            }
        } catch {
            setErrorMsg(ui.subscribeError);
            setState('error');
        }
    };

    if (state === 'success') {
        return (
            <div className="flex flex-col items-center gap-3 py-6 text-center animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-bold text-brand-graphite">{ui.subscribeSuccess}</p>
                <p className="text-xs text-stone-400 font-sans">{email}</p>
            </div>
        );
    }

    if (state === 'duplicate') {
        return (
            <div className="flex flex-col items-center gap-3 py-6 text-center animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-sm font-bold text-brand-graphite">{ui.subscribeAlreadySubscribed}</p>
                <p className="text-xs text-stone-400 font-sans">{email}</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full" noValidate>
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (state === 'error') setState('idle');
                        }}
                        placeholder={ui.subscribePlaceholder}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-sans bg-brand-paper-accent text-brand-graphite placeholder-stone-400 outline-none transition-all ${
                            state === 'error'
                                ? 'border-red-400 ring-1 ring-red-300 dark:ring-red-800'
                                : 'border-stone-line focus:border-brand-ink focus:ring-1 focus:ring-brand-ink/30'
                        }`}
                        disabled={state === 'loading'}
                        autoComplete="email"
                    />
                </div>
                <button
                    type="submit"
                    disabled={state === 'loading' || !email}
                    className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-ink text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-inkHover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {state === 'loading' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        ui.subscribeButton
                    )}
                </button>
            </div>

            {state === 'error' && errorMsg && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-red-500 font-sans">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errorMsg}
                </div>
            )}
        </form>
    );
};
