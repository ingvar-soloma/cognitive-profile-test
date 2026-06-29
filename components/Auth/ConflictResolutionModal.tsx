import React from 'react';
import { ShieldAlert, RefreshCw, Cloud, Monitor } from 'lucide-react';
import { Language, Answer } from '../../types';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  lang: Language;
  localAnswersCount: number;
  cloudAnswersCount: number;
  onSelectLocal: () => void;
  onSelectCloud: () => void;
  onClose: () => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  lang,
  localAnswersCount,
  cloudAnswersCount,
  onSelectLocal,
  onSelectCloud,
  onClose
}) => {
  if (!isOpen) return null;

  const t = {
    en: {
      title: 'Data Synchronization Conflict',
      desc: 'We found test answers on this device that differ from the answers saved in your cloud account.',
      localTitle: 'Keep Device Results',
      localDesc: `Use the answers currently on this device (${localAnswersCount} answered). This will overwrite your cloud data.`,
      cloudTitle: 'Use Cloud Results',
      cloudDesc: `Restore your previously saved cloud data (${cloudAnswersCount} answered). This will replace your local progress.`,
      warning: 'Warning: This action cannot be undone.',
      confirmBtn: 'Confirm Selection'
    },
    uk: {
      title: 'Конфлікт синхронізації даних',
      desc: 'Ми виявили відповіді на тести на цьому пристрої, які відрізняються від відповідей, збережених у вашому хмарному акаунті.',
      localTitle: 'Залишити дані з пристрою',
      localDesc: `Використовувати відповіді з цього пристрою (${localAnswersCount} відповідей). Це перезапише ваші хмарові дані.`,
      cloudTitle: 'Завантажити дані з хмари',
      cloudDesc: `Відновити ваші раніше збережені хмарові дані (${cloudAnswersCount} відповідей). Це замінить поточний прогрес на пристрої.`,
      warning: 'Увага: цю дію не можна скасувати.',
      confirmBtn: 'Підтвердити вибір'
    },
    ru: {
      title: 'Конфликт синхронизации данных',
      desc: 'Мы обнаружили ответы на тесты на этом устройстве, которые отличаются от ответов, сохраненных в вашем облачном аккаунте.',
      localTitle: 'Оставить данные с устройства',
      localDesc: `Использовать ответы с этого устройства (${localAnswersCount} ответов). Это перезапишет ваши облачные данные.`,
      cloudTitle: 'Загрузить данные из облака',
      cloudDesc: `Восстановить ваши ранее сохраненные облачные данные (${cloudAnswersCount} ответов). Это заменит текущий прогресс на устройстве.`,
      warning: 'Внимание: это действие нельзя отменить.',
      confirmBtn: 'Подтвердить выбор'
    }
  }[lang] || {
    en: {
      title: 'Data Synchronization Conflict',
      desc: 'We found test answers on this device that differ from the answers saved in your cloud account.',
      localTitle: 'Keep Device Results',
      localDesc: `Use the answers currently on this device (${localAnswersCount} answered). This will overwrite your cloud data.`,
      cloudTitle: 'Use Cloud Results',
      cloudDesc: `Restore your previously saved cloud data (${cloudAnswersCount} answered). This will replace your local progress.`,
      warning: 'Warning: This action cannot be undone.',
      confirmBtn: 'Confirm Selection'
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-bgMain/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-brand-bgCard/90 border border-stone-line rounded-[2.5rem] shadow-soft overflow-hidden animate-fade-in text-brand-textPrimary font-sans">
        <div className="bg-gradient-to-br from-brand-ink to-[#4A3B6D] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-white tracking-tight">{t.title}</h3>
              <p className="text-xs text-white/70 mt-1 font-sans">{t.desc}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option Local */}
            <button 
              onClick={onSelectLocal}
              className="flex flex-col text-left p-6 bg-brand-bgCard border border-stone-line hover:border-brand-clay rounded-[2rem] transition-all duration-300 hover:shadow-md group relative"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-clay/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Monitor className="w-5 h-5 text-brand-clay" />
              </div>
              <h4 className="font-serif font-bold text-base text-brand-textPrimary mb-2">{t.localTitle}</h4>
              <p className="text-xs text-stone-500 leading-relaxed font-sans">{t.localDesc}</p>
            </button>

            {/* Option Cloud */}
            <button 
              onClick={onSelectCloud}
              className="flex flex-col text-left p-6 bg-brand-bgCard border border-stone-line hover:border-brand-ink rounded-[2rem] transition-all duration-300 hover:shadow-md group relative"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-ink/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Cloud className="w-5 h-5 text-brand-ink" />
              </div>
              <h4 className="font-serif font-bold text-base text-brand-textPrimary mb-2">{t.cloudTitle}</h4>
              <p className="text-xs text-stone-500 leading-relaxed font-sans">{t.cloudDesc}</p>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-brand-clay/80 font-bold uppercase tracking-wider justify-center pt-2">
            <ShieldAlert className="w-4 h-4" />
            <span>{t.warning}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
