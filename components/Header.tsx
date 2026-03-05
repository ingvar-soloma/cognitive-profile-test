import React, { useEffect, useRef } from 'react';
import { BrainCircuit, Moon, Sun, Download } from 'lucide-react';
import { Language } from '@/types';

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
  onGoToIntro: () => void;
  telegramUser: any;
}

export const Header: React.FC<HeaderProps> = ({
  appState,
  ui,
  language,
  theme,
  progressPercent,
  activeProfileName,
  onSetLanguage,
  onToggleTheme,
  onDownloadProgress,
  onGoToIntro,
  telegramUser
}) => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
            onClick={onGoToIntro}
            aria-label="Go to Home"
          >
            <BrainCircuit className="w-8 h-8" />
            <span className="font-bold text-lg hidden sm:block">NeuroProfile</span>
          </button>

          {telegramUser && (
            <div className="flex items-center gap-2 ml-2">
              {telegramUser.photo_url ? (
                <img src={telegramUser.photo_url} alt={telegramUser.first_name} className="w-8 h-8 rounded-full border border-indigo-200 shadow-sm" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-200">
                  {telegramUser.first_name}
                </div>
              )}
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden xs:block">{telegramUser.first_name}</span>
            </div>
          )}

          {!telegramUser && (
            <div id="telegram-login-container" className="ml-2">
              <TelegramButton />
            </div>
          )}

          {activeProfileName && !telegramUser && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-full border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{ui.activeProfile}:</span>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{activeProfileName}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Language Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            {(['uk', 'en', 'ru'] as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => onSetLanguage(lang)}
                className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${language === lang
                  ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {appState === 'SURVEY' && (
            <button
              onClick={onDownloadProgress}
              className="ml-4 p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
              title={ui.resume}
              aria-label="Save Progress"
            >
              <Download className="w-5 h-5" />
            </button>
          )}

          {appState === 'SURVEY' && (
            <div className="hidden sm:flex flex-col w-32 items-end ml-4">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{progressPercent}% {ui.progress}</span>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export const TelegramButton: React.FC = () => {
  const handleLogin = () => {
    const tg = (window as any).Telegram;
    if (tg && tg.Login) {
      tg.Login.auth(
        {
          client_id: import.meta.env.VITE_TELEGRAM_CLIENT_ID,
          request_access: 'write',
        },
        (data: any) => {
          if (data && (window as any).onTelegramAuth) {
            (window as any).onTelegramAuth(data);
          }
        }
      );
    } else {
      console.error('Telegram Login SDK is not loaded. Please ensure oauth.telegram.org script is in index.html');
      alert('Telegram SDK loading failed. Please check your adblocker or connection.');
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="tg-auth-button px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.98-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .33z" />
      </svg>
      Sign In
    </button>
  );
};
