import React, { useEffect, useState, useRef } from 'react';
import { ProfileService } from '@/services/ProfileService';
import { UIStrings, Language } from '@/types';
import { Users, Search, Calendar, ChevronRight, User, Award, Table, Settings } from 'lucide-react';
import { BadgeManager } from './Admin/BadgeManager';
import { FeatureFlagManager } from './Admin/FeatureFlagManager';
import { BadgeIcon } from './Results/Results';

interface AdminDashboardProps {
  ui: UIStrings;
  lang: Language;
  onViewResult: (result: any) => void;
  results?: any[];
  onSetResults?: (results: any[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ ui, lang, onViewResult, results = [], onSetResults }) => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'records' | 'badges' | 'features'>('records');
  const lastFetchedQuery = useRef<string | null>(null);

  // Local debounce for search to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const load = async () => {
      // Avoid duplicate fetches for the same query
      if (lastFetchedQuery.current === debouncedSearch) return;
      lastFetchedQuery.current = debouncedSearch;

      if (results.length === 0) setLoading(true);
      const data = await ProfileService.fetchAllResults(debouncedSearch);
      if (onSetResults) onSetResults(data);
      setLoading(false);
    };
    load();
  }, [debouncedSearch, results.length, onSetResults]);

  if (loading && results.length === 0 && activeTab === 'records') return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-ink"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Tab Switcher */}
      <div className="flex gap-4 p-1.5 bg-brand-paper-accent/30 rounded-2xl border border-stone-line w-fit">
        <button 
          onClick={() => setActiveTab('records')}
          className={`px-8 py-2.5 rounded-xl flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest transition-all ${activeTab === 'records' ? 'bg-brand-ink text-white shadow-soft' : 'text-stone-400 hover:text-brand-ink'}`}
        >
          <Table className="w-4 h-4" />
          User Records
        </button>
        <button 
          onClick={() => setActiveTab('badges')}
          className={`px-8 py-2.5 rounded-xl flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest transition-all ${activeTab === 'badges' ? 'bg-brand-ink text-white shadow-soft' : 'text-stone-400 hover:text-brand-ink'}`}
        >
          <Award className="w-4 h-4" />
          Manage Badges
        </button>
        <button 
          onClick={() => setActiveTab('features')}
          className={`px-8 py-2.5 rounded-xl flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest transition-all ${activeTab === 'features' ? 'bg-brand-ink text-white shadow-soft' : 'text-stone-400 hover:text-brand-ink'}`}
        >
          <Settings className="w-4 h-4" />
          Features
        </button>
      </div>

      {activeTab === 'badges' ? (
        <div className="card-editorial p-0 border-stone-line/50">
           <BadgeManager ui={ui} lang={lang} />
        </div>
      ) : activeTab === 'features' ? (
        <FeatureFlagManager ui={ui} />
      ) : (
        <div className="card-editorial p-0 overflow-hidden border-stone-line/50">
      <div className="bg-brand-ink p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-editorial">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
            <Users className="w-6 h-6 text-brand-paper" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold tracking-tight">{ui.systemRecords}</h2>
            <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold mt-0.5">
               {ui.totalEntriesAnalyzed.replace('{count}', String(results.length))}
            </p>
          </div>
        </div>
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white transition-colors" />
          <input
            type="text"
            placeholder={ui.searchAdminPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-sm font-sans"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-bg/50 text-stone-400 text-[10px] uppercase tracking-[0.2em] font-bold">
              <th className="px-8 py-5 border-b border-stone-line/50">{ui.userProfile}</th>
              <th className="px-8 py-5 border-b border-stone-line/50">{ui.testSpecification}</th>
              <th className="px-8 py-5 border-b border-stone-line/50">{ui.timestamp}</th>
              <th className="px-8 py-5 border-b border-stone-line/50 text-right">{ui.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-line/30">
            {results.map((res) => (
              <tr key={(res.user_id) + res.created_at + res.test_type} className="hover:bg-brand-paper-accent/30 transition-all group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    {res.photo_url ? (
                      <div className="relative">
                        <img src={res.photo_url} className="w-10 h-10 rounded-full border border-stone-line shadow-sm" alt="" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-brand-sage rounded-full border-2 border-white"></div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-ink/5 border border-brand-ink/10 flex items-center justify-center text-brand-ink group-hover:bg-brand-ink group-hover:text-brand-paper transition-all duration-300">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="font-serif font-bold text-brand-graphite text-lg leading-none mb-1.5">
                        {res.first_name} {res.last_name || ''}
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] text-stone-400 font-mono tracking-tighter bg-stone-bg px-1.5 py-0.5 rounded border border-stone-line/50">ID: {res.user_id}</span>
                         {res.username && (
                           <span className="text-[10px] text-brand-ink/70 font-sans font-medium hover:underline cursor-pointer">@{res.username}</span>
                         )}
                         {res.email && (
                           <span className="text-[10px] text-stone-400 font-sans italic">{res.email}</span>
                         )}
                         <span className="text-[10px] text-stone-400 font-mono tracking-tighter bg-stone-bg px-1.5 py-0.5 rounded border border-stone-line/50 ml-1">
                           Credits: {res.credits || 0}
                         </span>
                      </div>
                      
                      {res.badges && res.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                           {res.badges.map((b: any) => (
                             <BadgeIcon key={b.code} badge={b} size="sm" />
                           ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="inline-flex flex-col">
                    <span className="text-xs font-bold text-brand-graphite mb-1">
                      {res.test_type === 'full_aphantasia_profile' ? ui.fullCognitiveProfile : ui.expressDiagnostics}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold bg-stone-bg rounded-full px-2 py-0.5 w-fit border border-stone-line/50">
                      {String(res.answers ? Object.values(res.answers).reduce((acc: number, curr: any) => acc + Object.keys(curr || {}).length, 0) : 0)} {ui.answersProvided}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col text-xs">
                    <span className="text-brand-graphite font-bold">
                        {new Date(res.created_at).toLocaleDateString(lang === 'uk' ? 'uk-UA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">
                        {new Date(res.created_at).toLocaleTimeString(lang === 'uk' ? 'uk-UA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => onViewResult(res)}
                      className="inline-flex items-center gap-2 text-brand-ink font-bold text-[10px] uppercase tracking-[0.2em] hover:text-brand-graphite transition-all group/btn"
                    >
                      {ui.details}
                      <div className="w-8 h-8 rounded-full bg-brand-ink/5 flex items-center justify-center group-hover/btn:bg-brand-ink group-hover/btn:text-white transition-all">
                        <ChevronRight className="w-4 h-4 translate-x-0 group-hover/btn:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                    <button
                      onClick={async () => {
                        const amountStr = window.prompt(`Deposit credits for ${res.first_name}:`, "500");
                        if (!amountStr) return;
                        const amount = parseInt(amountStr);
                        if (isNaN(amount) || amount <= 0) return alert("Invalid amount");
                        const comment = window.prompt("Optional comment:", "Admin bonus") || "Admin bonus";
                        
                        const authDataStr = localStorage.getItem('auth_token');
                        if (!authDataStr) return;
                        const authData = JSON.parse(authDataStr).user || JSON.parse(authDataStr);
                        
                        try {
                          const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/users/${res.user_id}/deposit`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              auth_data: authData,
                              amount,
                              comment
                            })
                          });
                          if (response.ok) {
                            alert("Deposit successful!");
                            // Quick local state update
                            if (onSetResults) {
                              onSetResults(results.map(r => r.user_id === res.user_id ? { ...r, credits: (r.credits || 0) + amount } : r));
                            }
                          } else {
                            alert("Failed to deposit.");
                          }
                        } catch (e) {
                          alert("Error making deposit.");
                        }
                      }}
                      className="inline-flex items-center px-2 py-1 bg-brand-sage/10 text-brand-sage rounded text-[9px] font-bold tracking-widest uppercase hover:bg-brand-sage hover:text-white transition-colors"
                    >
                      + Deposit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && results.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                   <div className="flex flex-col items-center gap-3">
                      <Search className="w-12 h-12 text-stone-200" />
                      <p className="text-stone-400 font-serif italic text-lg">{ui.noRecordsFound}</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
   )}
  </div>
  );
};
