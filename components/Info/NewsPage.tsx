import React from 'react';
import { ArrowLeft, ArrowRight, Clock, Tag, Mail, Send, Facebook, BookOpen } from 'lucide-react';
import { UIStrings, Language } from '@/types';
import { useNavigate } from 'react-router-dom';
import { NewsletterSubscribe } from './NewsletterSubscribe';
import { useSeoMetadata } from '@/hooks/useSeoMetadata';
import { toast } from 'react-hot-toast';

interface NewsPageProps {
    ui: UIStrings;
    language: Language;
    onStartSurvey: () => void;
    userEmail?: string;
}

interface Article {
    id: string;
    date: string;
    tag: string;
    tag_color: string;
    read_min: number;
    title_uk: string;
    title_en: string;
    title_ru: string;
    excerpt_uk: string;
    excerpt_en: string;
    excerpt_ru: string;
    body_uk: string[];
    body_en: string[];
    body_ru: string[];
    imageUrl?: string;
}

/* eslint-disable max-len */
// Articles are fetched from the database via /api/news

const ArticleSkeleton: React.FC = () => (
    <div className="bg-brand-bgCard border border-stone-line rounded-[2rem] p-7 shadow-sm flex flex-col gap-4 animate-pulse-subtle">
        <div className="flex items-center justify-between gap-3">
            <div className="h-4 w-20 bg-stone-100 rounded-full"></div>
            <div className="h-4 w-12 bg-stone-100 rounded-full"></div>
        </div>
        <div className="w-full aspect-video mb-2 overflow-hidden rounded-2xl bg-stone-100"></div>
        <div className="space-y-3">
            <div className="h-3 w-16 bg-stone-100 rounded"></div>
            <div className="h-6 w-full bg-stone-100 rounded-lg"></div>
            <div className="h-6 w-4/5 bg-stone-100 rounded-lg"></div>
            <div className="h-4 w-full bg-stone-200/50 rounded mt-2"></div>
            <div className="h-4 w-2/3 bg-stone-200/50 rounded"></div>
        </div>
        <div className="mt-auto pt-3 border-t border-stone-line flex items-center gap-1">
            <div className="h-3 w-20 bg-stone-100 rounded"></div>
        </div>
    </div>
);

const ArticleCard: React.FC<{ article: Article; language: Language; onClick: () => void }> = ({ article, language, onClick }) => {
    const title = language === 'uk' ? article.title_uk : language === 'ru' ? article.title_ru : article.title_en;
    const excerpt = language === 'uk' ? article.excerpt_uk : language === 'ru' ? article.excerpt_ru : article.excerpt_en;
    const dateStr = new Date(article.date).toLocaleDateString(
        language === 'uk' ? 'uk-UA' : language === 'ru' ? 'ru-RU' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
    );

    return (
        <article
            onClick={onClick}
            className="group bg-brand-bgCard border border-stone-line rounded-[2rem] p-7 shadow-sm hover:shadow-soft hover:border-brand-ink/20 transition-all cursor-pointer flex flex-col gap-4"
        >
            <div className="flex items-center justify-between gap-3">
                <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${article.tag_color}`}>
                    <Tag className="w-2.5 h-2.5 inline-block mr-1" />{article.tag}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
                    <Clock className="w-3 h-3" />{article.read_min} min
                </span>
            </div>

            {article.imageUrl && (
                <div className="w-full aspect-video -mx-0 -mt-0 mb-2 overflow-hidden rounded-2xl border border-stone-line/50 bg-stone-100">
                    <img src={article.imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                </div>
            )}

            <div>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-2">{dateStr}</p>
                <h2 className="text-lg font-serif font-bold text-brand-textPrimary leading-snug mb-2 group-hover:text-brand-ink transition-colors line-clamp-2">
                    {title}
                </h2>
                <p className="text-sm text-stone-500 leading-relaxed font-sans line-clamp-2">{excerpt}</p>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-brand-ink transition-colors mt-auto pt-3 border-t border-stone-line">
                {language === 'uk' ? 'Читати далі' : language === 'ru' ? 'Читать дальше' : 'Read more'}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
        </article>
    );
};

const ArticleView: React.FC<{ article: Article; language: Language; ui: UIStrings; onBack: () => void }> = ({ article, language, ui, onBack }) => {
    const title = language === 'uk' ? article.title_uk : language === 'ru' ? article.title_ru : article.title_en;
    const body = language === 'uk' ? article.body_uk : language === 'ru' ? article.body_ru : article.body_en;
    const dateStr = new Date(article.date).toLocaleDateString(
        language === 'uk' ? 'uk-UA' : language === 'ru' ? 'ru-RU' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
    );

    const shareUrl = window.location.origin + `/blog?id=${article.id}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success(ui.linkCopied || 'Copied!');
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    return (
        <div className="animate-fade-in max-w-2xl">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-stone-400 hover:text-brand-ink transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">
                    {language === 'uk' ? 'Назад' : language === 'ru' ? 'Назад' : 'Back'}
                </span>
            </button>

            {article.imageUrl && (
                <div className="w-full h-64 mb-8 overflow-hidden rounded-[2rem] border border-stone-line shadow-soft">
                    <img src={article.imageUrl} alt={title} className="w-full h-full object-cover" />
                </div>
            )}

            <header className="mb-10">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${article.tag_color}`}>
                        {article.tag}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">{dateStr}</span>
                    <span className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
                        <Clock className="w-3 h-3" />{article.read_min} min
                    </span>

                    {/* Simple Share Buttons */}
                    <div className="flex items-center gap-2 ml-auto">
                         <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mr-1">{ui.share}:</span>
                         <button 
                            onClick={handleCopy}
                            title={ui.copyLink}
                            className="p-1.5 rounded-lg bg-stone-bg border border-stone-line hover:border-brand-ink/40 transition-colors"
                         >
                            <Mail className="w-3 h-3 text-brand-textPrimary" />
                         </button>
                         <a 
                            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-stone-bg border border-stone-line hover:border-[#229ED9]/40 transition-colors"
                         >
                            <Send className="w-3 h-3 text-[#229ED9]" />
                         </a>
                         <a 
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-stone-bg border border-stone-line hover:border-[#1877F2]/40 transition-colors"
                         >
                            <Facebook className="w-3 h-3 text-[#1877F2]" />
                         </a>
                    </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-textPrimary leading-tight tracking-tight">
                    {title}
                </h1>
            </header>

            <div className="space-y-5">
                {body.map((para, i) => (
                    <p key={i} className="text-[16px] text-stone-600 dark:text-stone-400 leading-relaxed font-sans">
                        {para}
                    </p>
                ))}
            </div>
        </div>
    );
};

export const NewsPage: React.FC<NewsPageProps> = ({ ui, language, userEmail }) => {
    const navigate = useNavigate();
    const [articles, setArticles] = React.useState<Article[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeArticle, setActiveArticle] = React.useState<Article | null>(null);
    const [selectedTag, setSelectedTag] = React.useState<string | null>(null);

    const tags = React.useMemo(() => {
        const unique = new Set(articles.map(a => a.tag));
        return Array.from(unique).sort();
    }, [articles]);

    const filteredArticles = React.useMemo(() => {
        if (!selectedTag) return articles;
        return articles.filter(a => a.tag === selectedTag);
    }, [articles, selectedTag]);

    React.useEffect(() => {
        fetch('/api/news')
            .then(res => res.json())
            .then(data => {
                setArticles(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch news:", err);
                setLoading(false);
            });
    }, []);

    const articleTitle = activeArticle
        ? (language === 'uk' ? activeArticle.title_uk : language === 'ru' ? activeArticle.title_ru : activeArticle.title_en)
        : undefined;
    
    useSeoMetadata({
        title: articleTitle ? `${articleTitle} | News` : `${ui.navNews} — Latest Updates & Research`,
        description: activeArticle 
            ? (language === 'uk' ? activeArticle.excerpt_uk : language === 'ru' ? activeArticle.excerpt_ru : activeArticle.excerpt_en)
            : (language === 'uk' 
                ? 'Новини та оновлення проєкту NeuroProfile. Дізнайтесь про нові функції AI-аналізу та дослідження афантазії.' 
                : language === 'ru' 
                    ? 'Новости и обновления проекта NeuroProfile. Узнайте о новых функциях AI-анализа и исследованиях афантазии.' 
                    : 'News and updates from the NeuroProfile project. Learn about new AI analysis features and aphantasia research.'),
        canonical: activeArticle ? `/news?id=${activeArticle.id}` : '/news'
    });

    if (activeArticle) {
        return (
            <div className="pb-20">
                <ArticleView
                    article={activeArticle}
                    language={language}
                    ui={ui}
                    onBack={() => setTimeout(() => setActiveArticle(null), 0)}
                />
            </div>
        );
    }

    return (
        <div className="animate-fade-in text-left pb-20 min-h-[800px]">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-stone-400 hover:text-brand-ink transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">{ui.back}</span>
            </button>

            <header className="mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-ink/5 text-brand-textPrimary rounded-full text-[9px] font-bold tracking-[0.2em] uppercase mb-6 border border-brand-ink/10">
                    <BookOpen className="w-3 h-3" />
                    NeuroProfile
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-textPrimary leading-tight mb-3 tracking-tight">
                    {window.location.pathname.includes('blog') ? ui.navBlog : ui.navNews}
                </h1>
                <p className="text-stone-500 text-base leading-relaxed max-w-xl font-sans">
                    {window.location.pathname.includes('blog') 
                        ? (language === 'uk' ? 'Думки, дослідження та корисні матеріали про когнітивну архітектуру.' : language === 'ru' ? 'Мысли, исследования и полезные материалы о когнитивной архитектуре.' : 'Thoughts, research, and useful materials on cognitive architecture.')
                        : (language === 'uk' ? 'Нові функції, технічні деталі та думки про розвиток проєкту.' : language === 'ru' ? 'Новые функции, технічні деталі та розмышления о развитии проекта.' : "New features, technical details, and thoughts on the project's development.")
                    }
                </p>
            </header>

            {/* Tag Filter */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-10 pb-2 border-b border-stone-line/30">
                    <button
                        onClick={() => setSelectedTag(null)}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                            !selectedTag 
                                ? 'bg-brand-ink text-white shadow-sm ring-1 ring-brand-ink/20' 
                                : 'bg-stone-bg/50 text-stone-400 hover:text-brand-textPrimary border border-stone-line/50'
                        }`}
                    >
                        {language === 'uk' ? 'Всі' : language === 'ru' ? 'Все' : 'All'}
                    </button>
                    {tags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                                selectedTag === tag 
                                    ? 'bg-brand-ink text-white shadow-sm ring-1 ring-brand-ink/20' 
                                    : 'bg-stone-bg/50 text-stone-400 hover:text-brand-textPrimary border border-stone-line/50'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            <div className="grid sm:grid-cols-2 gap-6 min-h-[400px]">
                {loading ? (
                    <>
                        <ArticleSkeleton />
                        <ArticleSkeleton />
                        <ArticleSkeleton />
                        <ArticleSkeleton />
                    </>
                ) : filteredArticles.length > 0 ? (
                    filteredArticles.map((article) => (
                        <ArticleCard
                            key={article.id}
                            article={article}
                            language={language}
                            onClick={() => setTimeout(() => setActiveArticle(article), 0)}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center text-stone-400 font-sans italic">
                        {language === 'uk' ? 'Новин поки немає.' : language === 'ru' ? 'Новостей пока нет.' : 'No news yet.'}
                    </div>
                )}
            </div>

            {/* Newsletter subscribe block */}
            <div className="mt-12 bg-brand-bgCard border border-stone-line rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-11 h-11 rounded-2xl bg-brand-ink/5 border border-brand-ink/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-brand-ink" />
                    </div>
                    <div>
                        <h2 className="text-base font-serif font-bold text-brand-textPrimary mb-1">{ui.subscribeTitle}</h2>
                        <p className="text-sm text-stone-500 font-sans">{ui.subscribeSubtitle}</p>
                    </div>
                </div>
                <NewsletterSubscribe
                    ui={ui}
                    defaultEmail={userEmail ?? ''}
                    source="news_page"
                />
            </div>
        </div>
    );
};
