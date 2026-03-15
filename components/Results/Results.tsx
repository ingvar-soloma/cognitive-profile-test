import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Answer, UIStrings, Language, QuestionType, SurveyDefinition } from '@/types';
import { SURVEY_DATA, AVAILABLE_SURVEYS } from '@/constants';
import { Download, FileJson, BrainCircuit, ShieldAlert, Sparkles, Zap, MessageSquare } from 'lucide-react';
import { ProfileService } from '@/services/ProfileService';
// @ts-ignore
import { encode } from '@toon-format/toon';
import ReactMarkdown from 'react-markdown';
import { GoogleAuthButton } from '@/components/Header';

interface ResultsProps {
  answers: Record<string, Answer>;
  onReset: () => void;
  onGoHome: () => void;
  ui: UIStrings;
  lang: Language;
  filenamePrefix?: string;
  user: any;
  surveyId?: string;
  survey?: SurveyDefinition | null;
  initialRecommendations?: Record<string, string>;
}

const RadarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 21a9 9 0 1 0-9-9" />
    <path d="M12 8a4 4 0 1 1-4 4" />
    <path d="M12 12l9 9" />
  </svg>
);

export const Results: React.FC<ResultsProps> = ({
  answers, onReset, onGoHome, ui, lang, filenamePrefix, user, surveyId, survey, initialRecommendations = {}
}) => {
  const [geminiRecs, setGeminiRecs] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [showActions, setShowActions] = React.useState(false);

  const currentSurvey = survey || AVAILABLE_SURVEYS.find(s => s.id === surveyId);
  const surveyAnswers = React.useMemo(() => {
    if (!currentSurvey) return answers;
    // Check if answers follow the new nested structure { surveyId: { questionId: Answer } }
    if (answers[currentSurvey.id] && typeof answers[currentSurvey.id] === 'object' && !('questionId' in answers[currentSurvey.id])) {
      return (answers[currentSurvey.id] as unknown) as Record<string, Answer>;
    }
    return answers;
  }, [answers, currentSurvey]);

  const calculateCategoryScore = (subCatKey: string) => ProfileService.calculateCategoryScore(surveyAnswers, subCatKey);

  const hasAttemptedSave = React.useRef(false);

  React.useEffect(() => {
    if (hasAttemptedSave.current) return;

    const saveAndGetRecs = async () => {
      const activeProfileId = localStorage.getItem('neuroprofile_active_profile_id');
      const profiles = ProfileService.getProfiles();
      const activeProfile = profiles.find(p => p.id === activeProfileId);
      
      const targetSurveyId = surveyId || activeProfile?.surveyId;

      if (activeProfile && targetSurveyId) {
        // Step 0: Check if we ALREADY have recommendations from initial props or state
        const existingRec = initialRecommendations[targetSurveyId];
        if (existingRec && existingRec.trim().length > 0) {
           setGeminiRecs(existingRec);
           hasAttemptedSave.current = true;
           return;
        }

        hasAttemptedSave.current = true;
        setIsSaving(true);

        // Generate dynamic scores based on survey categories
        const currentSurvey = survey || AVAILABLE_SURVEYS.find(s => s.id === targetSurveyId);
        const scores: Record<string, number> = {};

        if (currentSurvey) {
          currentSurvey.categories.forEach(cat => {
            scores[cat.id] = ProfileService.calculateCategoryScore(surveyAnswers, cat.title.en);
          });
        }

        try {
          if (!user) {
            setIsSaving(false);
            return;
          }

          // Step 1: Fast save
          const result = await ProfileService.saveResultToBackend(activeProfile, targetSurveyId, scores, lang);

          if (result && result.status === 'success') {
            let existingRecForThisTest = null;
            
            // Check backend if not in initial props
            const existingResult = await ProfileService.loadResultFromBackend();
            if (existingResult && existingResult.gemini_recommendations) {
              if (typeof existingResult.gemini_recommendations === 'string') {
                existingRecForThisTest = existingResult.gemini_recommendations;
              } else if (existingResult.gemini_recommendations[targetSurveyId]) {
                existingRecForThisTest = existingResult.gemini_recommendations[targetSurveyId];
              }
            }

            if (existingRecForThisTest && existingRecForThisTest.trim().length > 0) {
              setGeminiRecs(existingRecForThisTest);
            } else {
              // Step 2: Stream LLM Analysis if missing
              setGeminiRecs('');
              await ProfileService.streamAnalysisFromBackend(activeProfile, targetSurveyId, scores, lang, (chunk) => {
                setGeminiRecs(prev => (prev || '') + chunk);
              });
            }
          }
        } catch (error) {
          console.error("Error managing backend results", error);
        } finally {
          setIsSaving(false);
        }
      }
    };
    saveAndGetRecs();
  }, [user, surveyId, survey]);



  const radarData = React.useMemo(() => {
    if (!currentSurvey) return [];

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

  // Prepare textual answers for display
  const textAnswers = React.useMemo(() => {
    return (Object.values(surveyAnswers) as Answer[]).filter(a => a.note && a.note.trim().length > 0);
  }, [surveyAnswers]);

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

  return (
    <div className="animate-fade-in text-left">
      <div className="bg-brand-paper-accent/40 backdrop-blur-xl rounded-[2.5rem] border border-stone-line shadow-soft overflow-hidden mb-12">
        <div className="bg-gradient-to-br from-brand-ink to-[#4A3B6D] p-10 md:p-14 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-clay/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tight leading-tight">{ui.resultsTitle}</h2>
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-paper-accent/10 backdrop-blur-md rounded-full border border-brand-paper-accent/20">
              <span className="text-xs font-bold tracking-[0.2em] uppercase">{getProfileDescription()}</span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-12">
          {/* AI Analysis Block */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-brand-ink/5 border border-brand-ink/10 flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-brand-ink" />
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-brand-graphite tracking-tight">AI Analysis & Insights</h3>
            </div>

            {isSaving ? (
              <div className="bg-brand-paper-accent/50 backdrop-blur-sm p-10 rounded-[2rem] border border-stone-line flex flex-col items-center gap-6 text-center shadow-sm">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-brand-ink/10 border-t-brand-ink animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-brand-ink/40" />
                </div>
                <div className="space-y-2">
                  <p className="font-serif text-xl font-bold text-brand-graphite">Synthesizing neurological insights...</p>
                  <p className="text-stone-400 text-sm font-sans">Connecting sensory nodes to cognitive patterns</p>
                </div>
              </div>
            ) : geminiRecs ? (
              <div className="bg-brand-paper-accent/80 backdrop-blur-md p-6 md:p-10 rounded-[2rem] border border-stone-line shadow-sm text-brand-graphite prose prose-stone dark:prose-invert max-w-none font-sans 
                prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-brand-ink dark:prose-headings:text-brand-clay
                prose-p:leading-relaxed prose-strong:text-brand-ink dark:prose-strong:text-brand-clay prose-strong:font-bold
                prose-ul:list-disc prose-li:marker:text-brand-clay dark:prose-li:marker:text-brand-ink
                transition-all duration-700">
                <ReactMarkdown>{geminiRecs}</ReactMarkdown>
              </div>
            ) : (
              <div className="bg-brand-paper/50 backdrop-blur-md p-12 md:p-16 rounded-[2.5rem] border-2 border-dashed border-stone-line text-center space-y-8 shadow-card relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-paper-accent/0 via-brand-paper-accent/0 to-brand-ink/[0.02] pointer-events-none"></div>
                <div className="flex justify-center relative z-10 transition-transform group-hover:scale-110 duration-700">
                  <div className="w-20 h-20 rounded-full bg-brand-paper-accent shadow-soft flex items-center justify-center border border-stone-line">
                    <ShieldAlert className="w-10 h-10 text-brand-clay" />
                  </div>
                </div>
                <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                  <h4 className="text-3xl font-serif text-brand-graphite font-bold tracking-tight">Unlock Your Full Narrative</h4>
                  <p className="text-stone-500 text-lg leading-relaxed font-sans">
                    Complete your journey of self-discovery. Sign in to unlock a comprehensive, personalized analysis and synchronize your cognitive profile across devices.
                  </p>
                  <div className="pt-4 flex justify-center">
                    <GoogleAuthButton />
                  </div>
                </div>
              </div>
            )}
          </div>

          {!user ? (
            <div className="relative p-12 md:p-20 bg-stone-bg/30 rounded-[2.5rem] border border-stone-line overflow-hidden text-center">
              <div className="absolute inset-0 backdrop-blur-[6px] bg-brand-paper/40 z-10 flex flex-col items-center justify-center p-8">
                <div className="w-12 h-12 rounded-full bg-brand-paper-accent border border-stone-line flex items-center justify-center mb-4 shadow-sm">
                  <Zap className="w-5 h-5 text-brand-clay" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-2 text-brand-graphite">Sensory Signature Pending</h3>
                <p className="text-sm text-stone-400 font-sans">Full neurological mapping is available for authenticated profiles.</p>
              </div>
              <div className="opacity-10 grayscale select-none pointer-events-none">
                <h3 className="text-2xl font-serif font-bold mb-8">Detailed Sensory Mapping</h3>
                <div className="flex flex-col gap-4 max-w-xs mx-auto">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-2 bg-stone-200 rounded-full w-full"></div>)}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24 pt-16 border-t border-stone-line">
                <div className="flex flex-col items-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-bg text-stone-400 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] mb-10">
                    <RadarIcon className="w-3 h-3" />
                    Sensory Signature Map
                  </div>
                  <div className="w-full aspect-square max-w-[450px] min-h-[350px] relative">
                    <div className="absolute inset-0 bg-brand-paper rounded-full blur-3xl opacity-30"></div>
                    <ResponsiveContainer width="100%" height="100%" minHeight={350}>
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                        <PolarGrid stroke="#E5E7EB" strokeWidth={1} />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 700, fontVariant: 'small-caps', letterSpacing: '0.1em' }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="transparent" tick={false} />
                        <Radar
                          name="Intensity"
                          dataKey="A"
                          stroke="#5E4B8B"
                          strokeWidth={3}
                          fill="#5E4B8B"
                          fillOpacity={0.12}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(229, 231, 235, 0.5)',
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
                    {Object.values(surveyAnswers).map((ans: any) => {
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
                      )
                    })}
                  </div>
                )}
              </div>

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
            </>
          )}
        </div>

        <div className="bg-stone-bg/50 border-t border-stone-line backdrop-blur-md">
          <button
            onClick={() => setShowActions(!showActions)}
            className="w-full py-8 text-[11px] uppercase tracking-[0.25em] font-bold text-stone-400 hover:text-brand-ink transition-all flex items-center justify-center gap-4 group"
          >
            <div className="w-8 h-px bg-stone-line group-hover:bg-brand-ink/20 group-hover:w-16 transition-all"></div>
            {showActions ? 'Archival Options' : 'Management & Archival'}
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
              <button onClick={onGoHome} className="btn-primary px-10 py-4 shadow-soft">
                {ui.goHome}
              </button>
              {!user && (
                <button onClick={onReset} className="text-stone-400 hover:text-brand-clay font-bold text-xs uppercase tracking-widest transition-colors py-4">
                  {ui.retake}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};