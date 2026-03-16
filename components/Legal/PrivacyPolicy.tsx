import React from 'react';
import { Shield, Database, Trash2, Mail, ArrowLeft } from 'lucide-react';
import { UIStrings, Language } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface PrivacyPolicyProps {
    ui: UIStrings;
    language: Language;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ ui, language }) => {
    const navigate = useNavigate();
    useDocumentTitle(ui.privacyPolicy);

    const emailBody = encodeURIComponent(ui.emailTemplateBody);
    const emailSubject = encodeURIComponent(ui.emailTemplateTitle);
    const mailtoUrl = `mailto:ingvar.soloma@gmail.com?subject=${emailSubject}&body=${emailBody}`;

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-20">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-stone-400 hover:text-brand-ink transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">{ui.back}</span>
            </button>

            <header className="mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-sage/10 text-brand-sage rounded-full text-[9px] font-bold tracking-[0.2em] uppercase mb-6 border border-brand-sage/20">
                    <Shield className="w-3 h-3" />
                    Security & Trust
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-graphite leading-tight mb-6">
                    {ui.privacyPolicy}
                </h1>
                <p className="text-lg text-stone-500 leading-relaxed max-w-2xl">
                    {language === 'uk' ? 'Ми цінуємо вашу приватність і прагнемо бути максимально прозорими у тому, як ми використовуємо ваші дані.' :
                        language === 'ru' ? 'Мы ценим вашу приватность и стремимся быть максимально прозрачными в том, как мы используем ваши данные.' :
                            'We value your privacy and strive to be as transparent as possible about how we use your data.'}
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                <section className="bg-brand-paper-accent border border-stone-line rounded-[2rem] p-8 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-brand-ink/5 flex items-center justify-center mb-6 border border-brand-ink/10">
                        <Database className="w-6 h-6 text-brand-ink" />
                    </div>
                    <h2 className="text-xl font-bold text-brand-graphite mb-4 font-serif">{ui.dataUsage}</h2>
                    <p className="text-sm text-stone-500 leading-relaxed mb-6">
                        {language === 'uk' ? 'Ми зберігаємо результати ваших тестів та AI-аналіз для того, щоб ви могли повернутися до них у будь-який час та відстежувати зміни у вашому когнітивному профілі.' :
                            language === 'ru' ? 'Мы сохраняем результаты ваших тестов и AI-анализ для того, чтобы вы могли вернуться к ним в любое время и отслеживать изменения в вашем когнитивном профиле.' :
                                'We save your test results and AI analysis so that you can return to them at any time and track changes in your cognitive profile.'}
                    </p>
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{ui.dataFromGoogle}</h3>
                        <ul className="space-y-2">
                            {['user_id', 'username', 'first_name', 'last_name', 'photo_url'].map(field => (
                                <li key={field} className="flex items-center gap-2 text-xs font-mono bg-stone-bg/50 px-3 py-2 rounded-lg border border-stone-line/50 text-brand-graphite">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-ink/30" />
                                    {field}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="bg-brand-paper-accent border border-stone-line rounded-[2rem] p-8 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-brand-clay/5 flex items-center justify-center mb-6 border border-brand-clay/10">
                        <Trash2 className="w-6 h-6 text-brand-clay" />
                    </div>
                    <h2 className="text-xl font-bold text-brand-graphite mb-4 font-serif">{ui.deleteData}</h2>
                    <p className="text-sm text-stone-500 leading-relaxed mb-6">
                        {ui.deleteDataDesc}
                    </p>
                    <a
                        href={mailtoUrl}
                        className="inline-flex items-center gap-3 px-6 py-3 bg-brand-clay text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-soft transition-all"
                    >
                        <Mail className="w-4 h-4" />
                        {ui.contactAdmin}
                    </a>
                </section>
            </div>

            <div className="prose prose-stone max-w-none text-stone-500 text-sm leading-relaxed">
                <h3 className="text-brand-graphite font-serif text-lg mb-4">{ui.principles}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                        <h4 className="font-bold text-brand-graphite text-xs uppercase tracking-wider mb-2">{ui.anonymity}</h4>
                        <p>{ui.anonymityDesc}</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-brand-graphite text-xs uppercase tracking-wider mb-2">{ui.security}</h4>
                        <p>{ui.securityDesc}</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-brand-graphite text-xs uppercase tracking-wider mb-2">{ui.transparency}</h4>
                        <p>{ui.transparencyDesc}</p>
                    </div>
                </div>
            </div>

            <footer className="mt-20 pt-8 border-t border-stone-line text-center">
                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                    NeuroProfile Project &copy; {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    );
};
