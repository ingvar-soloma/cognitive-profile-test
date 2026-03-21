import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Answer, UIStrings, Language, QuestionType, SurveyDefinition, Badge, User } from '@/types';
import { SURVEY_DATA, AVAILABLE_SURVEYS } from '@/constants';
import { Download, FileJson, BrainCircuit, ShieldAlert, Sparkles, Zap, MessageSquare, ChevronRight, User as UserIcon, Settings, RefreshCw, Check } from 'lucide-react';
import { ProfileService } from '@/services/ProfileService';
// @ts-ignore
import { encode } from '@toon-format/toon';
import ReactMarkdown from 'react-markdown';
import { GoogleAuthButton } from '@/components/Header';
import { AppShare } from '@/components/AppShare';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { ShareSettingsModal } from './ShareSettingsModal';

interface ResultsProps {
  answers: Record<string, Record<string, Answer>>;
  onReset: () => void;
  onGoHome: () => void;
  ui: UIStrings;
  lang: Language;
  filenamePrefix?: string;
  user: User | null;
  targetUser?: User | null;
  surveyId?: string;
  survey?: SurveyDefinition | null;
  initialRecommendations?: Record<string, string>;
  badges?: Badge[];
  isPublicView?: boolean;
  publicNickname?: string;
  initialShareId?: string | null;
  isAdmin?: boolean;
  analysisVersions?: string[];
  ownerId?: string;
}

const RadarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 21a9 9 0 1 0-9-9" />
    <path d="M12 8a4 4 0 1 1-4 4" />
    <path d="M12 12l9 9" />
  </svg>
);

export const BadgeIcon = ({ badge, size = "md" }: { badge: Badge, size?: "sm" | "md" | "lg" }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-10 h-10 text-xl",
    lg: "w-16 h-16 text-3xl"
  };

  return (
    <div className="relative inline-block">
      <div
        className={`${sizeClasses[size]} rounded-full bg-brand-paper-accent border border-stone-line flex items-center justify-center cursor-pointer hover:bg-brand-ink hover:border-brand-ink transition-all duration-300 shadow-sm`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="leading-none">{badge.icon || "🏆"}</span>
      </div>

      {showTooltip && badge.description && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-4 bg-brand-paper-accent border border-stone-line rounded-2xl shadow-xl z-[100] animate-fade-in text-center pointer-events-none">
          <div className="font-bold text-[10px] text-brand-ink uppercase tracking-[0.15em] mb-1">{badge.name}</div>
          <p className="text-[10px] text-stone-500 font-sans leading-relaxed">{badge.description}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-stone-line"></div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[7px] border-transparent border-t-brand-paper-accent -mt-[1px]"></div>
        </div>
      )}
    </div>
  );
};

export const Results: React.FC<ResultsProps> = ({
  answers, onReset, onGoHome, ui, lang, filenamePrefix, user, targetUser, surveyId, survey, initialRecommendations = {}, badges = [],
  isPublicView,
  publicNickname,
  initialShareId,
  isAdmin,
  analysisVersions,
  ownerId
}) => {
  const navigate = useNavigate();
  const { isEnabled } = useFeatureFlags();
  const targetSurveyId = surveyId || initialRecommendations?.test_type || 'full_aphantasia_profile';
  const getInitialRec = () => {
    if (!initialRecommendations) return null;
    if (typeof initialRecommendations === 'string') return initialRecommendations;
    return initialRecommendations[targetSurveyId] || null;
  };

  const [resolvedRecommendations, setResolvedRecommendations] = useState<any>(initialRecommendations);
  
  // Sync state with prop if it changes (important when App.tsx finishes its background fetch)
  useEffect(() => {
    if (initialRecommendations) {
      setResolvedRecommendations(initialRecommendations);
    }
  }, [initialRecommendations]);

  const [geminiRecs, setGeminiRecs] = useState<string | null>(getInitialRec());
  const [shareId, setShareId] = useState<string | null>(initialShareId || null);
  const [currentVersionIndex, setCurrentVersionIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState<number | null>(null);

  const currentSurvey = useMemo(() => survey || AVAILABLE_SURVEYS.find(s => s.id === surveyId), [survey, surveyId]);

  const surveyAnswers = useMemo((): Record<string, Answer> => {
    if (!currentSurvey) return {};
    return answers[currentSurvey.id] || {};
  }, [answers, currentSurvey]);

  // Handle versions from either prop or mapping in recommendations
  const effectiveVersions = useMemo(() => {
    if (analysisVersions && analysisVersions.length > 0) return analysisVersions;
    if (!resolvedRecommendations || typeof resolvedRecommendations !== 'object' || !surveyId) return [];

    // Look for `${surveyId}_versions` in the flat recommendations object
    const versionKey = `${surveyId}_versions`;
    const discoveryKey = currentSurvey?.id ? `${currentSurvey.id}_versions` : null;

    const foundVersions = (resolvedRecommendations as any)[versionKey] || (discoveryKey ? (resolvedRecommendations as any)[discoveryKey] : null);

    if (Array.isArray(foundVersions)) return foundVersions;
    return [];
  }, [analysisVersions, resolvedRecommendations, surveyId, currentSurvey]);

  const radarData = useMemo(() => {
    if (!currentSurvey) return [];

    // Special grouping for full aphantasia profile to match the 5 main categories in the express test
    if (currentSurvey.id === 'full_aphantasia_profile') {
      const mapping = [
        {
          key: 'Visual',
          subject: { uk: 'Візуальна', en: 'Visual', ru: 'Визуальная' }[lang],
          criteria: ['Visual', 'Visual Reconstruction', 'Detailing', 'Construction', 'Dreams', 'Faces']
        },
        {
          key: 'Auditory',
          subject: { uk: 'Аудіальна', en: 'Auditory', ru: 'Аудиальная' }[lang],
          criteria: ['Auditory']
        },
        {
          key: 'Thinking',
          subject: { uk: 'Мислення', en: 'Thinking', ru: 'Мышление' }[lang],
          criteria: ['Abstract Thinking', 'Conceptualization', 'Logic', 'Mechanisms', 'Semantic', 'Learning', 'Decision Making', 'Argument', 'Episodic', 'Tactile', 'Gustatory', 'Olfactory', 'Empathy', 'Social']
        },
        {
          key: 'Inner voice',
          subject: { uk: 'Внутрішній голос', en: 'Inner voice', ru: 'Внутренний голос' }[lang],
          criteria: ['Dialogue', 'Speech', 'Working Memory']
        },
        {
          key: 'Schema',
          subject: { uk: 'Схема', en: 'Schema', ru: 'Схема' }[lang],
          criteria: ['Spatial Manipulation', 'Spatial Memory', 'Map', 'Navigation', 'Kinesthetics']
        }
      ];

      return mapping.map(group => {
        let total = 0;
        let count = 0;
        group.criteria.forEach(c => {
          const score = ProfileService.calculateCategoryScore(surveyAnswers, c);
          if (score > 0) {
            total += score;
            count++;
          }
        });
        return {
          key: group.key,
          subject: group.subject,
          A: count > 0 ? Number((total / count).toFixed(1)) : 0,
          fullMark: 5
        };
      });
    }

    // If survey has multiple categories, use them
    if (currentSurvey.categories.length > 1) {
      return currentSurvey.categories.map(cat => ({
        key: cat.id,
        subject: cat.title[lang],
        A: ProfileService.calculateCategoryScore(surveyAnswers, cat.title.en),
        fullMark: 5
      }));
    }

    // If only one category, look for sub-categories in its questions
    const cat = currentSurvey.categories[0];
    const subCats = new Set<string>();
    const subCatLabels: Record<string, string> = {};

    cat.questions.forEach(q => {
      if (q.subCategory) {
        subCats.add(q.subCategory.en);
        subCatLabels[q.subCategory.en] = q.subCategory[lang];
      }
    });

    if (subCats.size > 0) {
      return Array.from(subCats).map(sc => ({
        key: sc,
        subject: subCatLabels[sc],
        A: ProfileService.calculateCategoryScore(surveyAnswers, sc),
        fullMark: 5
      }));
    }

    return [{
      key: cat.id,
      subject: cat.title[lang],
      A: ProfileService.calculateCategoryScore(surveyAnswers, cat.title.en),
      fullMark: 5
    }];
  }, [currentSurvey, surveyAnswers, lang]);

  const triggerAnalysis = async () => {
    const activeProfileId = localStorage.getItem('neuroprofile_active_profile_id');
    const profiles = ProfileService.getProfiles();
    const activeProfile = profiles.find(p => p.id === activeProfileId) || (targetUser ? { answers } : null);

    // Use surveyId prop or the survey ID from current survey
    const targetSurveyId = surveyId || currentSurvey?.id;

    if (activeProfile && targetSurveyId) {
      setIsAnalyzing(true);
      setGeminiRecs('');

      // Mock Profile object to satisfy service
      const mockProfile = {
        ...activeProfile,
        answers: answers // Use the current answers prop directly
      } as any;

      const radarScores = radarData.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.A }), {});

      try {
        await ProfileService.streamAnalysisFromBackend(mockProfile, targetSurveyId, radarScores, lang, (chunk) => {
          setGeminiRecs(prev => (prev || '') + chunk);
        });
      } catch (e) {
        setGeminiRecs('Error during analysis. Please try again or contact admin.');
      } finally {
        setIsAnalyzing(false);
      }
    }
  };
  const [showActions, setShowActions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isPublic, setIsPublic] = useState(isPublicView || false);

  const isOwner = useMemo(() => {
    const currentUserId = user?.id || localStorage.getItem('neuroprofile_user_id');
    if (!currentUserId) return false;

    // Normalize IDs (remove 'g_' prefix if present)
    const normalize = (id: string) => id.startsWith('g_') ? id.substring(2) : id;
    const normalizedCurrentId = normalize(String(currentUserId));

    // Primary: check against explicitly passed ownerId (most reliable)
    if (ownerId) {
      return normalizedCurrentId === normalize(String(ownerId));
    }

    // Secondary: check against targetUser id (from public/admin profile data)
    if (targetUser?.id) {
      return normalizedCurrentId === normalize(String(targetUser.id));
    }

    // Tertiary: if no targetUser at all, it's our own local private profile
    if (!targetUser) return true;

    return false;
  }, [user, targetUser, ownerId]);
  const [nickname, setNickname] = useState('');
  const [useRealName, setUseRealName] = useState(false);

  // SEO Handling
  useEffect(() => {
    if (isPublicView) {
      // Add noindex tag dynamically
      const meta = document.createElement('meta');
      meta.name = "robots";
      meta.content = "noindex, nofollow";
      document.head.appendChild(meta);
      return () => { document.head.removeChild(meta); };
    }
  }, [isPublicView]);

  const handleUpdatePrivacy = async (forcedState?: boolean) => {
    let newState = isPublic;

    // If forcedState is boolean, use it (e.g. from onShareStart)
    if (forcedState === true || forcedState === false) {
      newState = forcedState;
    } else if (!showShareModal) {
      // If called from a direct toggle button (and modal is not open), toggle it
      newState = !isPublic;
    }

    // Privacy warning when turning off public access
    if (isPublic && !newState) {
      const confirmed = window.confirm(lang === 'uk'
        ? "Ви впевнені? Всі посилання, які ви публікували раніше, перестануть працювати, і інші не зможуть бачити ваші результати."
        : "Are you sure? All links you previously shared will stop working, and others won't be able to see your results.");
      if (!confirmed) return;
    }

    const finalNickname = useRealName ? `${user.first_name} ${user.last_name || ''}`.trim() : (nickname || null);
    const authDataString = localStorage.getItem('auth_token');
    if (!authDataString) return;

    try {
      setIsPublic(newState); // Optimistic update
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/me/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_data: JSON.parse(authDataString).user || JSON.parse(authDataString),
          is_public: newState,
          public_nickname: finalNickname
        })
      });
    } catch (e) {
      console.error("Failed to update privacy", e);
      setIsPublic(!newState); // Rollback
    }
    setShowShareModal(false);
  };
  const calculateCategoryScore = (subCatKey: string) => ProfileService.calculateCategoryScore(surveyAnswers, subCatKey);

  const hasAttemptedSave = useRef(false);

  useEffect(() => {
    if (hasAttemptedSave.current) return;

    const initializeResults = async () => {
      hasAttemptedSave.current = true;
      const targetSurveyId = surveyId || initialRecommendations?.test_type || 'full_aphantasia_profile';
      
      try {
        // Step 1: Check if we are viewing another user's profile (Admin or Public View)
        if (isPublicView || (isAdmin && targetUser)) {
          const propRec = initialRecommendations[targetSurveyId];
          if (propRec && propRec.trim().length > 0) {
            setGeminiRecs(propRec);
          }
          return; // Stop here, do not fetch the current logged-in user's data
        }

        // Step 2: Try to load EXISTING result from backend for the logged-in user
        if (user) {
          setIsSaving(true);
          const backendData = await ProfileService.loadResultFromBackend();
          
          if (backendData) {
            // Update profile settings from the same call
            setIsPublic(backendData.is_public || false);
            setNickname(backendData.public_nickname || '');
            
            // Prioritize specific share_id for this test type, with fallback to global share_id
            if (backendData.share_ids && backendData.share_ids[targetSurveyId]) {
              setShareId(backendData.share_ids[targetSurveyId]);
            } else if (backendData.share_id) {
              setShareId(backendData.share_id);
            }
            
            setUseRealName(!!backendData.public_nickname && backendData.public_nickname === `${user.first_name} ${user.last_name || ''}`.trim());
            
            // Check if backend has recommendations for THIS survey
            let backendRec = null;
            if (backendData.gemini_recommendations) {
              setResolvedRecommendations(backendData.gemini_recommendations);
              
              if (typeof backendData.gemini_recommendations === 'string') {
                backendRec = backendData.gemini_recommendations;
              } else {
                backendRec = backendData.gemini_recommendations[targetSurveyId];
              }
            }
            
            if (backendData.current_version_index !== undefined) {
              setCurrentVersionIndex(backendData.current_version_index);
            }

            if (backendRec && backendRec.trim().length > 0) {
              setGeminiRecs(backendRec);
              setIsSaving(false);
              return;
            }
          }
        }

        // Step 3: If no backend recs, and we have local answers, SAVE and trigger analysis
        const activeProfileId = localStorage.getItem('neuroprofile_active_profile_id');
        const profiles = ProfileService.getProfiles();
        const activeProfile = profiles.find(p => p.id === activeProfileId);

        if (activeProfile && targetSurveyId && !isPublicView) {
          setIsSaving(true);
          
          // Generate scores (copied from triggerAnalysis logic for consistency)
          const radarScores = radarData.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.A }), {});
          const result = await ProfileService.saveResultToBackend(activeProfile, targetSurveyId, radarScores, lang);
          
          if (result && result.status === 'success') {
             if (result.share_id) setShareId(result.share_id);
             
             // Check if save returned recommendations (might have migrated them)
             const savedRec = result.gemini_recommendations?.[targetSurveyId];
             if (result.gemini_recommendations) {
               setResolvedRecommendations(result.gemini_recommendations);
             }
             
             if (savedRec) {
               setGeminiRecs(savedRec);
               setIsSaving(false);
             } else {
               // Trigger streaming analysis
               setIsAnalyzing(true);
               await ProfileService.streamAnalysisFromBackend(activeProfile, targetSurveyId, radarScores, lang, (chunk) => {
                 setGeminiRecs(prev => (prev || '') + chunk);
               });
               setIsAnalyzing(false);
               setIsSaving(false);
             }
          } else if (result && result.status === 'error') {
              alert(result.detail || "Error saving results. Check your credits.");
              setIsSaving(false);
          }
        }
      } catch (error) {
        console.error("Error initializing results", error);
      } finally {
        setIsSaving(false);
      }
    };

    initializeResults();
  }, [user, surveyId, isPublicView, radarData, lang, initialRecommendations]);



  // Prepare textual answers for display
  const textAnswers = useMemo(() => {
    return (Object.values(surveyAnswers) as Answer[]).filter(a => a.note && a.note.trim().length > 0);
  }, [surveyAnswers]);

  const downloadMD = () => {
    const activeSurvey = survey || AVAILABLE_SURVEYS.find(s => s.id === surveyId);
    const testTitle = activeSurvey?.title[lang] || activeSurvey?.title['en'] || (surveyId ? surveyId.replace('_', ' ').toUpperCase() : 'Report');

    let md = `# Report for ${targetUser?.first_name || user?.first_name || "User"}\n`;
    md += `## Test: ${testTitle}\n\n`;

    // 1. Question - Score at the beginning
    md += "## Summary Scores\n\n";
    if (activeSurvey) {
      activeSurvey.categories.forEach(category => {
        category.questions.forEach(q => {
          const sAnswers = answers[activeSurvey.id] || {};
          const ans = sAnswers[q.id];
          if (ans && typeof ans.value === 'number') {
            md += `- ${q.text[lang] || q.text['en']}: **${ans.value}**\n`;
          }
        });
      });
    }

    md += "\n---\n\n";

    // 2. Question - Answer (Comment) for CURRENT test only
    md += "## Detailed Answers & Comments\n\n";
    if (activeSurvey) {
      const sAnswers = answers[activeSurvey.id] || {};
      if (sAnswers && typeof sAnswers === 'object' && Object.keys(sAnswers).length > 0) {
        activeSurvey.categories.forEach(cat => {
          cat.questions.forEach(q => {
            const ans = sAnswers[q.id];
            if (ans && (ans.value !== undefined || (ans.note && ans.note.trim() !== ''))) {
              md += `**Q: ${q.text[lang] || q.text['en']}**\n`;
              if (ans.value !== undefined && ans.value !== null) md += `A: ${ans.value}\n`;
              if (ans.note && ans.note.trim() !== '') md += `Comment: ${ans.note}\n`;
              md += "\n";
            }
          });
        });
      }
    }

    const prefix = filenamePrefix || 'report';
    const date = new Date().toISOString().slice(0, 10);
    const fileName = `${prefix}_${date}.md`;

    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const downloadFile = (extension: string) => {
    let content = "";
    if (extension === 'toon') {
      content = encode(answers);
    } else {
      content = JSON.stringify(answers, null, 2);
    }

    const prefix = filenamePrefix || 'neuro_profile';
    const date = new Date().toISOString().slice(0, 10);
    const fileName = `${prefix}_${date}.${extension}`;

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(content);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const getProfileDescription = () => {
    // If it's a sensory survey, use visual score for general label
    const visualScore = calculateCategoryScore('Visual');
    if (visualScore > 0) {
      if (visualScore <= 1.5) return ui.profileAphantasia;
      if (visualScore <= 3) return ui.profileHypophantasia;
      if (visualScore >= 4.5) return ui.profileHyperphantasia;
      return ui.profilePhantasia;
    }

    // Fallback or generic label for other tests
    if (radarData.length > 0) {
      const firstScore = radarData[0].A;
      if (firstScore <= 1.5) return ui.profileAphantasia;
      if (firstScore <= 3) return ui.profileHypophantasia;
      if (firstScore >= 4.5) return ui.profileHyperphantasia;
      return ui.profilePhantasia;
    }

    return currentSurvey?.title[lang] || ui.resultsTitle;
  };

  const profileTypeLabel = useMemo(() => {
    const visualScoreValue = radarData.find(d => d.key === 'Visual')?.A || (radarData.length > 0 ? radarData[0].A : 0);
    const type = ProfileService.getProfileType(visualScoreValue);
    return ProfileService.getProfileTypeLabel(type, lang);
  }, [radarData, lang]);

  return (
    <div className="animate-fade-in text-left">
      <div className="bg-brand-paper-accent/40 backdrop-blur-xl rounded-[2.5rem] border border-stone-line shadow-soft overflow-hidden mb-12">
        <div className="bg-gradient-to-br from-brand-ink to-[#4A3B6D] p-10 md:p-14 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-clay/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

          <div className="relative z-10">
            {(targetUser || user || isPublicView) && (
              <div className="flex flex-col items-center mb-6">
                <div className="flex items-center gap-4 mb-4 text-left">
                  {(targetUser?.photo_url || (!isPublicView && user?.photo_url)) ? (
                    <img src={targetUser?.photo_url || user.photo_url} className="w-16 h-16 rounded-full border-2 border-white/20 shadow-inner" alt="" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white border-2 border-white/20">
                      <UserIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div className="space-y-2 flex flex-col items-center">
                    <h1 className="text-xl md:text-2xl font-serif font-bold text-white tracking-tight">
                      {isPublicView ? (publicNickname || 'Anonymous') : (nickname || 'Anonymous')}
                    </h1>
                    {!isPublicView && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowShareModal(true)}
                          className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest border transition-all flex items-center gap-1.5 ${isPublic ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-brand-paper/10 border-white/20 text-brand-paper/40'}`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${isPublic ? 'bg-green-400 animate-pulse' : 'bg-white/40'}`}></div>
                          {isPublic ? ui.publicProfile : ui.privateProfile}
                          <Settings className="w-3 h-3 ml-1 opacity-60" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {badges.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-3">
                    {badges.map(b => (
                      <BadgeIcon key={b.code} badge={b} />
                    ))}
                  </div>
                )}
              </div>
            )}

            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tight leading-tight">
              {currentSurvey?.title[lang] || ui.resultsTitle}
            </h2>
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-paper-accent/10 backdrop-blur-md rounded-full border border-brand-paper-accent/20">
              <span className="text-xs font-bold tracking-[0.2em] uppercase">{getProfileDescription()}</span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-12">
          {(surveyId === 'express_demo' || isPublicView) && (
            <div className="mb-12 p-8 md:p-10 bg-gradient-to-br from-brand-ink/5 via-brand-paper to-brand-clay/5 rounded-[2rem] border border-brand-ink/10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-clay/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-clay/10 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-ink/5 rounded-full blur-3xl -ml-16 -mb-16 group-hover:bg-brand-ink/10 transition-colors"></div>

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-clay/10 text-brand-clay rounded-full text-[9px] font-bold tracking-[0.2em] uppercase mb-4">
                    <Sparkles className="w-3 h-3" />
                    {isPublicView ? ui.cognitiveAssessment : ui.readyForAnalysis}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-brand-graphite mb-2">
                    {isPublicView ? ui.visitorCtaTitle : ui.demoCtaTitle}
                  </h3>
                  <p className="text-stone-500 text-base max-w-xl font-sans leading-relaxed">
                    {isPublicView ? ui.visitorCtaDesc : ui.demoCtaDesc}
                  </p>
                </div>
                <button
                  onClick={() => navigate(isPublicView ? '/survey/express_demo' : '/survey/full_aphantasia_profile')}
                  className="shrink-0 h-14 px-8 bg-brand-ink text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:shadow-soft transition-all flex items-center justify-center gap-3 group/btn"
                >
                  <BrainCircuit className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                  {isPublicView ? ui.visitorCtaButton : ui.demoCtaButton}
                  <ChevronRight className="w-4 h-4 opacity-70 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          )}

          {/* AI Analysis Block */}
          <div className="mb-20">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-ink/5 border border-brand-ink/10 flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6 text-brand-ink" />
                </div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-brand-graphite tracking-tight">{ui.aiAnalysisTitle}</h3>
 
                {/* Version Switcher - Only for owner/admin, never on public view */}
                {!isPublicView && (effectiveVersions && effectiveVersions.length > 1) && (
                  <div className="flex items-center gap-2 ml-4 p-1 bg-brand-paper-accent/50 rounded-lg border border-stone-line/50">
                    {effectiveVersions.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedVersionIndex(idx)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${(selectedVersionIndex === idx || (selectedVersionIndex === null && (currentVersionIndex === idx || (currentVersionIndex === null && idx === effectiveVersions.length - 1))))
                            ? 'bg-brand-ink text-white shadow-sm'
                            : 'text-stone-400 hover:text-brand-ink'
                          }`}
                      >
                        V{idx + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!isPublicView && isAdmin && geminiRecs && (
                <button
                  disabled={isAnalyzing}
                  onClick={triggerAnalysis}
                  className="px-4 py-2 bg-brand-clay/10 text-brand-clay font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-brand-clay hover:text-white transition-all flex items-center gap-2 group border border-brand-clay/20"
                >
                  <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                  Regenerate
                </button>
              )}
            </div>

            {(isSaving && !geminiRecs) ? (
              <div className="bg-brand-paper-accent/50 backdrop-blur-sm p-10 rounded-[2rem] border border-stone-line flex flex-col items-center gap-6 text-center shadow-sm">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-brand-ink/10 border-t-brand-ink animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-brand-ink/40" />
                </div>
                <div className="space-y-2">
                  <p className="font-serif text-xl font-bold text-brand-graphite">{ui.synthesizingInsights}</p>
                  <p className="text-stone-400 text-sm font-sans">{ui.connectingNodes}</p>
                </div>
              </div>
            ) : (geminiRecs !== null) ? (
              <div className="relative transition-all duration-700">
                <div className={`bg-brand-paper-accent/80 backdrop-blur-md p-6 md:p-10 rounded-[2rem] border border-stone-line shadow-sm text-brand-graphite prose prose-stone dark:prose-invert max-w-none font-sans 
                  prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-brand-ink dark:prose-headings:text-brand-clay
                  prose-p:leading-relaxed prose-strong:text-brand-ink dark:prose-strong:text-brand-clay prose-strong:font-bold
                  prose-ul:list-disc prose-li:marker:text-brand-clay dark:prose-li:marker:text-brand-ink
                  ${isAnalyzing ? 'animate-pulse-subtle' : ''}`}>

                  {/* Version Info & Actions - Hide on public view */}
                  {!isPublicView && effectiveVersions && effectiveVersions.length > 1 && (
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-line/30">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] items-center uppercase font-bold tracking-widest text-stone-400">
                           Viewing Version {(selectedVersionIndex !== null ? selectedVersionIndex : (currentVersionIndex !== null ? currentVersionIndex : effectiveVersions.length - 1)) + 1}
                           {((selectedVersionIndex === null && (currentVersionIndex === null || currentVersionIndex === effectiveVersions.length - 1)) || (selectedVersionIndex !== null && selectedVersionIndex === effectiveVersions.length - 1)) && <span className="ml-2 text-brand-clay text-[9px]">(Latest)</span>}
                           {selectedVersionIndex === null && currentVersionIndex !== null && currentVersionIndex !== effectiveVersions.length - 1 && <span className="ml-2 text-brand-ink text-[9px]">(Default)</span>}
                        </span>
                      </div>

                      {isOwner && (
                        <button
                          onClick={async () => {
                            const idx = selectedVersionIndex !== null ? selectedVersionIndex : (currentVersionIndex !== null ? currentVersionIndex : effectiveVersions.length - 1);
                            try {
                              const authDataString = localStorage.getItem('auth_token') || localStorage.getItem('telegram_auth');
                              if (!authDataString) {
                                console.error('No auth token found');
                                return;
                              }
                              const authParsed = JSON.parse(authDataString);
                              const authData = authParsed.user || authParsed;
                              
                              const apiUrl = import.meta.env.VITE_API_URL || '';
                              const response = await fetch(`${apiUrl}/api/set-default-analysis`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  auth_data: authData,
                                  test_type: targetSurveyId,
                                  version_index: idx
                                })
                              });
                              if (response.ok) {
                                 const resData = await response.json();
                                 if (resData.current_version_index !== undefined) {
                                     setCurrentVersionIndex(resData.current_version_index);
                                     setSelectedVersionIndex(null); // Reset to show the new default
                                 } else {
                                     window.location.reload(); 
                                 }
                               } else {
                                const err = await response.json();
                                console.error('Failed to set default version:', err);
                              }
                            } catch (e) {
                              console.error('Failed to set default version', e);
                            }
                          }}
                          className="text-[10px] items-center uppercase font-bold tracking-widest text-brand-ink hover:underline flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Set as Default
                        </button>
                      )}
                    </div>
                  )}

                  {isAnalyzing && !geminiRecs && (
                    <div className="flex flex-col items-center gap-4 py-12">
                      <div className="w-10 h-10 rounded-full border-4 border-brand-ink/10 border-t-brand-ink animate-spin"></div>
                      <p className="text-stone-400 text-xs font-bold uppercase tracking-widest animate-pulse">{ui.synthesizingInsights}</p>
                    </div>
                  )}

                  <ReactMarkdown>{selectedVersionIndex !== null && effectiveVersions.length > 0 ? effectiveVersions[selectedVersionIndex] : geminiRecs}</ReactMarkdown>

                  {isAnalyzing && geminiRecs && (
                    <div className="mt-8 flex items-center gap-3 text-brand-ink animate-pulse">
                      <Zap className="w-4 h-4 fill-current" />
                      <span className="text-[10px] items-center uppercase font-bold tracking-widest">{ui.predictedTime?.split(' ')[0] || 'AI'} is typing...</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (isAdmin) ? (
              <div className="bg-brand-paper-accent/50 backdrop-blur-sm p-12 md:p-16 rounded-[2.5rem] border-2 border-dashed border-stone-line text-center space-y-8 shadow-card relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-paper-accent/0 via-brand-paper-accent/0 to-brand-ink/[0.05] pointer-events-none"></div>
                <div className="flex justify-center relative z-10 transition-transform group-hover:scale-110 duration-700">
                  <div className="w-20 h-20 rounded-full bg-brand-ink/10 shadow-soft flex items-center justify-center border border-brand-ink/20">
                    <BrainCircuit className="w-10 h-10 text-brand-ink" />
                  </div>
                </div>
                <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                  <h4 className="text-3xl font-serif text-brand-graphite font-bold tracking-tight">Generate Admin AI Analysis</h4>
                  <p className="text-stone-500 text-lg leading-relaxed font-sans">
                    As an administrator, you can force AI analysis for this test result even if it's disabled globally or for the user.
                  </p>
                  <div className="pt-4 flex justify-center">
                    <button
                      disabled={isAnalyzing}
                      onClick={triggerAnalysis}
                      className="h-14 px-8 bg-brand-ink text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:shadow-soft transition-all flex items-center justify-center gap-3 group/btn"
                    >
                      <Sparkles className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                      Run AI Analysis
                      <ChevronRight className="w-4 h-4 opacity-70 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            ) : isPublicView ? (
              null
            ) : (
              <div className="bg-brand-paper/50 backdrop-blur-md p-12 md:p-16 rounded-[2.5rem] border-2 border-dashed border-stone-line text-center space-y-8 shadow-card relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-paper-accent/0 via-brand-paper-accent/0 to-brand-ink/[0.02] pointer-events-none"></div>
                <div className="flex justify-center relative z-10 transition-transform group-hover:scale-110 duration-700">
                  <div className="w-20 h-20 rounded-full bg-brand-paper-accent shadow-soft flex items-center justify-center border border-stone-line">
                    <ShieldAlert className="w-10 h-10 text-brand-clay" />
                  </div>
                </div>
                <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                  <h4 className="text-3xl font-serif text-brand-graphite font-bold tracking-tight">{ui.unlockNarrativeTitle}</h4>
                  <p className="text-stone-500 text-lg leading-relaxed font-sans">
                    {ui.unlockNarrativeDesc}
                  </p>
                  <div className="pt-4 flex justify-center">
                    <GoogleAuthButton />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Share Section - Feature Flagged - Only for owner */}
          {isEnabled('share') && !isPublicView && user && (
            <AppShare
              ui={ui}
              lang={lang}
              user={user}
              isPublicView={isPublicView}
              publicNickname={publicNickname}
              currentSurvey={currentSurvey}
              profileTypeLabel={profileTypeLabel}
              onShowSettings={() => setShowShareModal(true)}
              shareId={shareId}
              onShareStart={() => {
                if (!isPublic) handleUpdatePrivacy(true);
              }}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24 pt-16 border-t border-stone-line">
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-bg text-stone-400 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] mb-10">
                <RadarIcon className="w-3 h-3" />
                {ui.sensorySignatureMap}
              </div>
              <div className="w-full h-[350px] md:h-[450px] min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={350}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#E5E7EB" strokeWidth={1} />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 700, fontVariant: 'small-caps', letterSpacing: '0.1em' }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="transparent" tick={false} />
                    <Radar
                      name={ui.intensity}
                      dataKey="A"
                      stroke="#5E4B8B"
                      strokeWidth={3}
                      fill="#5E4B8B"
                      fillOpacity={0.12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-brand-paper-accent)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid var(--color-stone-line)',
                        borderRadius: '16px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        fontFamily: 'Manrope, sans-serif'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-stone-300 uppercase tracking-[0.25em] mb-8">{ui.scoreDetails}</h3>
                <div className="grid gap-8">
                  {radarData.map((item) => (
                    <div key={item.key} className="group">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-brand-graphite font-bold text-[13px] uppercase tracking-wider">{item.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-brand-ink text-xl">{item.A}</span>
                          <span className="text-stone-400 text-[10px] font-bold">/ 5.0</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-stone-bg/50 rounded-full overflow-hidden border border-stone-line/50">
                        <div
                          className="h-full bg-gradient-to-r from-brand-ink to-brand-clay/60 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(94,75,139,0.2)]"
                          style={{ width: `${(item.A / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {!isPublicView && (
            <div className="border-t border-stone-line pt-12 mb-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-stone-bg border border-stone-line flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-stone-400" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-brand-graphite tracking-tight">{ui.notesTitle}</h3>
              </div>

              {textAnswers.length === 0 ? (
                <div className="p-12 text-center bg-stone-bg/50 rounded-3xl border border-stone-line border-dashed">
                  <p className="text-stone-400 italic font-sans">{ui.noNotes}</p>
                </div>
              ) : (
                <div className="grid gap-8 md:grid-cols-2">
                  {Object.values(surveyAnswers).map((ans: Answer) => {
                    const q = SURVEY_DATA.flatMap(c => c.questions).find(q => q.id === ans.questionId);
                    const isDrawing = q?.type === QuestionType.DRAWING && (ans.value as string)?.startsWith('data:image/');
                    const hasNote = ans.note && ans.note.trim() !== '';

                    if (!isDrawing && !hasNote && q?.type !== QuestionType.TEXT) return null;
                    if (q?.type === QuestionType.TEXT && !ans.value && !ans.note) return null;

                    return (
                      <div key={ans.questionId} className="bg-brand-paper-accent/60 backdrop-blur-sm p-6 rounded-[2rem] border border-stone-line shadow-sm hover:shadow-md transition-shadow flex flex-col gap-6">
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{q?.subCategory?.en || 'Perspective'}</div>
                          <p className="font-serif font-bold text-brand-graphite leading-tight text-lg">{q?.text[lang]}</p>
                        </div>

                        {isDrawing && (
                          <div className="rounded-2xl overflow-hidden border border-stone-line bg-white/50 dark:bg-stone-bg/20 p-4 shadow-inner">
                            <img
                              src={ans.value as string}
                              alt={q?.text[lang]}
                              className="w-full h-auto max-h-[250px] object-contain mx-auto mix-blend-multiply dark:mix-blend-normal dark:invert dark:brightness-150 dark:hue-rotate-180 opacity-90 transition-transform hover:scale-105 duration-500"
                            />
                          </div>
                        )}

                        {hasNote && (
                          <div className="bg-stone-bg/80 p-5 rounded-2xl border border-stone-line/50 relative">
                            <div className="absolute top-4 left-0 w-1 h-8 bg-brand-clay/20 rounded-r-full"></div>
                            <p className="text-stone-400 text-sm leading-relaxed italic">
                              "{ans.note}"
                            </p>
                          </div>
                        )}

                        {q?.type === QuestionType.TEXT && ans.value && !isDrawing && (
                          <p className="text-stone-400 leading-relaxed text-sm">{ans.value}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="mt-20 p-10 bg-brand-paper/50 backdrop-blur-sm rounded-[2rem] border border-brand-clay/10 text-[11px] text-stone-400 leading-relaxed max-w-4xl mx-auto shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="w-4 h-4 text-brand-clay" />
              <h5 className="font-bold uppercase tracking-[0.2em] text-[10px] text-brand-clay">{ui.disclaimerTitle}</h5>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-brand-clay/5">
              <p className="opacity-80 font-sans italic">{ui.disclaimer}</p>
              <a
                href="/privacy"
                className="text-brand-ink hover:underline font-bold uppercase tracking-widest text-[9px] whitespace-nowrap"
              >
                {ui.privacyPolicy}
              </a>
            </div>
          </div>
        </div>

        <div className="bg-stone-bg/50 border-t border-stone-line backdrop-blur-md">
          <button
            onClick={() => setShowActions(!showActions)}
            className="w-full py-8 text-[11px] uppercase tracking-[0.25em] font-bold text-stone-400 hover:text-brand-ink transition-all flex items-center justify-center gap-4 group"
          >
            <div className="w-8 h-px bg-stone-line group-hover:bg-brand-ink/20 group-hover:w-16 transition-all"></div>
            {showActions ? ui.archivalOptions : ui.managementArchival}
            <div className="w-8 h-px bg-stone-line group-hover:bg-brand-ink/20 group-hover:w-16 transition-all"></div>
          </button>

          {showActions && (
            <div className="p-12 md:p-20 flex flex-wrap justify-center gap-8 animate-fade-in border-t border-stone-line bg-brand-paper-accent/40 sticky bottom-0">
              <button onClick={() => downloadFile('json')} className="btn-secondary group flex items-center gap-3">
                <FileJson className="w-4 h-4 text-brand-ink group-hover:scale-110 transition-transform" />
                <span>{ui.downloadJson}</span>
              </button>
              <button onClick={() => downloadFile('toon')} className="border-2 border-brand-clay/20 text-brand-clay hover:bg-brand-clay hover:text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all shadow-sm hover:shadow-soft flex items-center gap-3 group">
                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                <span>{ui.saveToon}</span>
              </button>
              {isAdmin && (
                <button onClick={downloadMD} className="border-2 border-brand-ink/20 text-brand-ink hover:bg-brand-ink hover:text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all shadow-sm hover:shadow-soft flex items-center gap-3 group">
                  <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  <span>Download MD (Admin)</span>
                </button>
              )}
              {!user && (
                <button onClick={onReset} className="text-stone-400 hover:text-brand-clay font-bold text-xs uppercase tracking-widest transition-colors py-4">
                  {ui.retake}
                </button>
              )}
            </div>
          )}

          {/* ── FOOTER DISCLAIMER ────────────────────── */}
          <div className="mt-20 pt-10 border-t border-stone-line/30">
            <div className="bg-stone-50/50 p-6 md:p-8 rounded-[2rem] border border-stone-line/50 flex flex-col md:flex-row items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-brand-clay/10 flex-shrink-0 flex items-center justify-center border border-brand-clay/20">
                <ShieldAlert className="w-6 h-6 text-brand-clay" />
              </div>
              <div className="text-center md:text-left">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-graphite mb-1">
                  {ui.disclaimerTitle}
                </h4>
                <p className="text-[11px] text-stone-500 leading-relaxed font-sans max-w-3xl">
                  {ui.disclaimer}
                </p>
              </div>
            </div>
            <p className="mt-8 text-center text-[10px] text-stone-400 font-sans">
              &copy; {new Date().getFullYear()} NeuroProfile. Experimental Cognitive Research Platform.
            </p>
          </div>
        </div>
      </div>

      {/* Share Settings Modal */}
      <ShareSettingsModal
        show={showShareModal}
        onClose={() => setShowShareModal(false)}
        ui={ui}
        isPublic={isPublic}
        setIsPublic={setIsPublic}
        useRealName={useRealName}
        setUseRealName={setUseRealName}
        nickname={nickname}
        setNickname={setNickname}
        userId={user?.id?.toString()}
        publicId={user?.public_id}
        shareId={shareId}
        onSave={handleUpdatePrivacy}
      />
    </div>
  );
};