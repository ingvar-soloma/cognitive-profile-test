import React, { useEffect, useState, useRef, useMemo } from 'react';
import { History, FileText, ChevronRight, BarChart2, Search, Calendar, User, Users } from 'lucide-react';
import { Profile, UIStrings } from '@/types';
import { AVAILABLE_SURVEYS } from '@/constants';
import { ProfileService } from '@/services/ProfileService';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface DashboardResultsProps {
    profiles: Profile[];
    onViewResult: (profileId: string, surveyId: string) => void;
    ui: UIStrings;
    language: 'uk' | 'en' | 'ru';
    isAdmin?: boolean;
    adminResults?: any[];
    onSetAdminResults?: (results: any[]) => void;
}

export const DashboardResults: React.FC<DashboardResultsProps> = ({ profiles, onViewResult, ui, language, isAdmin, adminResults = [], onSetAdminResults }) => {
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const lastFetchedQuery = useRef<string | null>(null);
    useDocumentTitle(isAdmin ? ui.systemDatabase : ui.navResults);

    // Local debounce for search to avoid too many requests
    useEffect(() => {
        if (!isAdmin) return;
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, isAdmin]);

    useEffect(() => {
        if (!isAdmin) return;
        const load = async () => {
            if (lastFetchedQuery.current === debouncedSearch && adminResults.length > 0) return;
            lastFetchedQuery.current = debouncedSearch;

            if (adminResults.length > 0 && !debouncedSearch) {
                return;
            }
            
            setLoading(true);
            const data = await ProfileService.fetchAllResults(debouncedSearch);
            if (onSetAdminResults) onSetAdminResults(data);
            setLoading(false);
        };
        load();
    }, [debouncedSearch, isAdmin, onSetAdminResults, adminResults.length]);

    const localSurveyResults = profiles.filter(p => !p.id.startsWith('admin_')).flatMap(profile => {
        return AVAILABLE_SURVEYS
            .filter(survey => {
                const isSubTest = survey.id === 'sensory_only' || survey.id === 'processes_only' || survey.id === 'strategies_only';
                if (isSubTest) return false;
                
                const questions = survey.categories.flatMap(c => c.questions);
                const surveyAnswers = profile.answers[survey.id] || {};
                const hasRecommendation = !!(profile as any).gemini_recommendations?.[survey.id];
                return questions.some(q => surveyAnswers[q.id]) || hasRecommendation;
            })
            .map(survey => {
                const surveyAnswers = profile.answers[survey.id] || {};
                return {
                    id: `${profile.id}_${survey.id}`,
                    profileId: profile.id,
                    surveyId: survey.id,
                    title: profile.name,
                    subtitle: survey?.title[language] || 'General Test',
                    answerCount: survey.categories.flatMap(c => c.questions).filter(q => surveyAnswers[q.id]).length,
                    date: profile.lastUpdated,
                    isLocal: true
                };
            });
    });

    // Group admin results by user
    const groupedAdminResults = useMemo(() => {
        if (!isAdmin) return [];
        
        const userGroups: Record<string, any> = {};
        
        adminResults.forEach(res => {
            const uid = res.user_id;
            if (!userGroups[uid]) {
                userGroups[uid] = {
                    userId: uid,
                    username: res.username,
                    name: `${res.first_name} ${res.last_name || ''}`,
                    photo_url: res.photo_url,
                    tests: []
                };
            }
            
            // For each record, find which surveys it has
            AVAILABLE_SURVEYS
                .filter(survey => {
                    const isSubTest = survey.id === 'sensory_only' || survey.id === 'processes_only' || survey.id === 'strategies_only';
                    if (isSubTest) return false;
                    const surveyAnswers = res.answers?.[survey.id] || {};
                    const questions = survey.categories.flatMap(c => c.questions);
                    return questions.some(q => surveyAnswers[q.id]);
                })
                .forEach(survey => {
                    const surveyAnswers = res.answers?.[survey.id] || {};
                    userGroups[uid].tests.push({
                        id: `${res.user_id}_${survey.id}_${res.created_at || ''}`,
                        surveyId: survey.id,
                        subtitle: survey?.title[language] || 'General Test',
                        answerCount: Object.keys(surveyAnswers).length,
                        date: res.created_at || new Date().toISOString(),
                        fullData: {
                            ...res,
                            test_type: survey.id
                        }
                    });
                });
        });
        
        // Convert to array and sort tests by date descendant
        return Object.values(userGroups).map((group: any) => ({
            ...group,
            tests: group.tests.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        }));
    }, [adminResults, isAdmin, language]);

    const handleView = (item: any) => {
        if (item.isLocal) {
            onViewResult(item.profileId, item.surveyId);
        } else {
            onViewResult('ADMIN_OBJECT', item.fullData);
        }
    };

    return (
        <div className="animate-fade-in text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-brand-ink/5 border border-brand-ink/10 rounded-2xl text-brand-ink shadow-sm">
                        <History className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-graphite tracking-tight leading-tight mb-2">
                            {isAdmin ? ui.systemDatabase : ui.navResults}
                        </h1>
                        <p className="text-stone-500 font-sans">
                            {isAdmin ? ui.activeUsersCount.replace('{count}', String(groupedAdminResults.length)) : ui.resultsHistoryDesc}
                        </p>
                    </div>
                </div>

                {isAdmin && (
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                            type="text"
                            placeholder={ui.searchUsersPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full bg-brand-paper border border-stone-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-ink/20"
                        />
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-ink"></div>
                </div>
            ) : isAdmin ? (
                <div className="grid gap-8">
                    {groupedAdminResults.map((userGroup: any) => (
                        <div key={userGroup.userId} className="card-editorial p-1 border-stone-line/50 overflow-hidden">
                            <div className="bg-stone-bg/30 px-6 py-4 border-b border-stone-line flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    {userGroup.photo_url ? (
                                        <img src={userGroup.photo_url} className="w-10 h-10 rounded-full border border-stone-line" alt="" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-brand-ink/5 flex items-center justify-center text-brand-ink">
                                            <User className="w-5 h-5" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-brand-graphite leading-tight">{userGroup.name}</h3>
                                        <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                                            <span>ID: {userGroup.userId}</span>
                                            {userGroup.username && (
                                                <span className="text-brand-ink/70 font-sans font-medium">@{userGroup.username}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-brand-paper rounded-full text-[10px] uppercase font-bold text-stone-400 tracking-wider shadow-sm ring-1 ring-stone-line/50">
                                    {userGroup.tests.length} {ui.testsFound}
                                </span>
                            </div>
                            
                            <div className="p-4 grid gap-3">
                                {userGroup.tests.map((test: any) => (
                                    <button
                                        key={test.id}
                                        onClick={() => handleView({ isLocal: false, fullData: test.fullData })}
                                        className="flex items-center justify-between p-4 bg-brand-paper-accent/40 border border-stone-line rounded-2xl hover:bg-brand-paper-accent hover:shadow-sm hover:border-brand-ink/20 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-brand-ink/5 rounded-xl flex items-center justify-center text-brand-ink group-hover:bg-brand-ink group-hover:text-white transition-colors duration-300">
                                                <BarChart2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-brand-graphite">{test.subtitle}</div>
                                                <div className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mt-0.5">
                                                    {test.answerCount} {ui.answersLabel} • {new Date(test.date).toLocaleString(language === 'uk' ? 'uk-UA' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-brand-ink translate-x-0 group-hover:translate-x-0.5 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    {groupedAdminResults.length === 0 && (
                        <div className="text-center py-12 text-stone-400 italic">{ui.noUsersFound}</div>
                    )}
                </div>
            ) : (
                <div className="grid gap-5">
                    {localSurveyResults.length === 0 ? (
                        <div className="card-editorial p-10 md:p-16 text-center">
                            <div className="w-16 h-16 bg-stone-bg border border-stone-line rounded-full flex items-center justify-center mx-auto mb-6 text-stone-200">
                                <FileText className="w-8 h-8" />
                            </div>
                            <p className="text-stone-500 text-base mb-8 font-sans max-w-sm mx-auto">{ui.noTestsYet}</p>
                            <button
                                onClick={() => window.location.hash = ''}
                                className="btn-primary px-8 py-3 shadow-soft uppercase tracking-widest text-xs font-bold"
                            >
                                {ui.goToTests}
                            </button>
                        </div>
                    ) : (
                        localSurveyResults.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleView(item)}
                                className="flex items-center justify-between p-6 bg-brand-paper-accent border border-stone-line rounded-[2rem] shadow-card hover:shadow-soft hover:border-brand-ink/30 transition-all text-left group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-brand-ink/5 border border-brand-ink/10 rounded-2xl flex items-center justify-center text-brand-ink group-hover:scale-105 group-hover:bg-brand-ink group-hover:text-white transition-all duration-300 shadow-sm">
                                        <BarChart2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-serif font-bold text-brand-graphite text-xl md:text-2xl tracking-tight mb-0.5">
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-stone-400 font-sans">
                                            <span className="font-medium text-stone-500">{item.subtitle}</span>
                                            <span className="w-1 h-1 bg-stone-200 rounded-full" />
                                            <span className="font-bold uppercase tracking-wider text-[9px] text-stone-300">{item.answerCount} {ui.answersLabel}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="hidden lg:flex flex-col items-end">
                                        <span className="text-[10px] uppercase font-bold text-stone-300 tracking-widest mb-1">{ui.dateLabel}</span>
                                        <span className="text-sm font-bold text-brand-graphite">
                                            {new Date(item.date).toLocaleDateString(language === 'uk' ? 'uk-UA' : 'en-US', { dateStyle: 'medium' })}
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-stone-bg flex items-center justify-center border border-stone-line group-hover:bg-brand-ink/5 transition-colors shrink-0">
                                        <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-brand-ink group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}

            <div className="mt-16 pt-8 border-t border-stone-line flex justify-between items-center text-[10px] uppercase font-bold tracking-[0.2em] text-stone-300">
                <span>{ui.securityPrivacy}</span>
                <a href="/privacy" className="text-brand-ink hover:underline">{ui.privacyPolicy}</a>
            </div>
        </div>
    );
};
