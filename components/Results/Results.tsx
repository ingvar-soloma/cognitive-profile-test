import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Answer, UIStrings, Language, QuestionType } from '@/types';
import { SURVEY_DATA } from '@/constants';
import { Download, FileJson, BrainCircuit, ShieldAlert } from 'lucide-react';
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
}

export const Results: React.FC<ResultsProps> = ({ answers, onReset, onGoHome, ui, lang, filenamePrefix, user }) => {
  const [geminiRecs, setGeminiRecs] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [showActions, setShowActions] = React.useState(false);

  const calculateCategoryScore = (subCatKey: string) => ProfileService.calculateCategoryScore(answers, subCatKey);

  const hasAttemptedSave = React.useRef(false);

  React.useEffect(() => {
    if (hasAttemptedSave.current) return;

    const saveAndGetRecs = async () => {
      const activeProfileId = localStorage.getItem('neuroprofile_active_profile_id');
      const profiles = ProfileService.getProfiles();
      const activeProfile = profiles.find(p => p.id === activeProfileId);

      if (activeProfile) {
        hasAttemptedSave.current = true;
        setIsSaving(true);
        const scores = {
          Visual: calculateCategoryScore('Visual'),
          Auditory: calculateCategoryScore('Auditory'),
          Tactile: calculateCategoryScore('Tactile'),
          Gustatory: calculateCategoryScore('Gustatory'),
          Olfactory: calculateCategoryScore('Olfactory'),
        };

        try {
          if (!user) {
            setIsSaving(false);
            return;
          }

          // Step 1: Fast save
          const result = await ProfileService.saveResultToBackend(activeProfile, activeProfile.surveyId, scores, lang);

          if (result && result.status === 'success') {
            // Check if there are already existing recommendations
            const existingResult = await ProfileService.loadResultFromBackend();
            if (existingResult && existingResult.gemini_recommendations && existingResult.gemini_recommendations.trim().length > 0) {
              setGeminiRecs(existingResult.gemini_recommendations);
              setIsSaving(false);
            } else {
              // Step 2: Stream LLM Analysis if missing
              setGeminiRecs('');
              await ProfileService.streamAnalysisFromBackend(activeProfile, activeProfile.surveyId, scores, lang, (chunk) => {
                setGeminiRecs(prev => (prev || '') + chunk);
                // Optionally stop spinner after first chunk
                setIsSaving(false);
              });
            }
          }
        } catch (error) {
          console.error("Error managing backend results", error);
          const existingResult = await ProfileService.loadResultFromBackend();
          if (existingResult && existingResult.gemini_recommendations) {
            setGeminiRecs(existingResult.gemini_recommendations);
          }
        } finally {
          setIsSaving(false);
        }
      }
    };
    saveAndGetRecs();
  }, [user]);

  const labels: Record<string, Record<Language, string>> = {
    Visual: { uk: 'Візуальна', en: 'Visual', ru: 'Визуальная' },
    Auditory: { uk: 'Аудіальна', en: 'Auditory', ru: 'Аудиальная' },
    Tactile: { uk: 'Тактильна', en: 'Tactile', ru: 'Тактильная' },
    Gustatory: { uk: 'Смакова', en: 'Gustatory', ru: 'Вкусовая' },
    Olfactory: { uk: 'Нюхова', en: 'Olfactory', ru: 'Обонятельная' },
  };

  const radarData = [
    { key: 'Visual', subject: labels['Visual'][lang], A: calculateCategoryScore('Visual'), fullMark: 5 },
    { key: 'Auditory', subject: labels['Auditory'][lang], A: calculateCategoryScore('Auditory'), fullMark: 5 },
    { key: 'Tactile', subject: labels['Tactile'][lang], A: calculateCategoryScore('Tactile'), fullMark: 5 },
    { key: 'Gustatory', subject: labels['Gustatory'][lang], A: calculateCategoryScore('Gustatory'), fullMark: 5 },
    { key: 'Olfactory', subject: labels['Olfactory'][lang], A: calculateCategoryScore('Olfactory'), fullMark: 5 },
  ];

  // Prepare textual answers for display
  const textAnswers = (Object.values(answers) as Answer[]).filter(a => a.note && a.note.trim().length > 0);

  const downloadFile = (extension: string) => {
    let content = "";
    if (extension === 'toon') {
      content = encode(answers);
    } else {
      content = JSON.stringify(answers, null, 2);
    }

    const prefix = filenamePrefix || 'aphantasia_profile';
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
    const visualScore = calculateCategoryScore('Visual');
    if (visualScore <= 1.5) return ui.profileAphantasia;
    if (visualScore <= 3) return ui.profileHypophantasia;
    if (visualScore >= 4.5) return ui.profileHyperphantasia;
    return ui.profilePhantasia;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden mb-8 transition-colors">
        <div className="bg-indigo-600 dark:bg-indigo-700 p-6 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">{ui.resultsTitle}</h2>
          <p className="opacity-90">{getProfileDescription()}</p>
        </div>

        <div className="p-6 md:p-8">
          {/* AI Analysis Block is now First! */}
          <div className="mb-10 content-start">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-indigo-500" />
              AI Аналіз & Рекомендації
            </h3>
            {isSaving ? (
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"></div>
                <span>Аналізуємо результати...</span>
              </div>
            ) : geminiRecs ? (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-slate-700 dark:text-slate-300 prose dark:prose-invert prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown>{geminiRecs}</ReactMarkdown>
              </div>
            ) : (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-600 text-center space-y-4 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
                <div className="flex justify-center relative z-10">
                  <ShieldAlert className="w-16 h-16 text-indigo-500 dark:text-indigo-400 drop-shadow-md" />
                </div>
                <div className="relative z-10">
                  <p className="text-xl text-indigo-900 dark:text-indigo-100 font-bold mb-2">
                    Ваш результат згенеровано!
                  </p>
                  <p className="text-base text-indigo-700 dark:text-indigo-300 mb-6 max-w-lg mx-auto">
                    Залогіньтеся через Google, щоб розблокувати повний детальний аналіз вашого профілю від ШІ, а також зберегти та синхронізувати прогрес. Без авторизації деталі приховані.
                  </p>
                  <div className="inline-flex justify-center transform hover:scale-105 transition-transform">
                    <GoogleAuthButton />
                  </div>
                </div>
              </div>
            )}
          </div>

          {!user ? (
            <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 mt-4 filter blur-[2px] opacity-70 cursor-not-allowed select-none">
              <h3 className="text-lg font-bold mb-4">Блок з деталями результатів (Приховано)</h3>
              <p>Детальна мапа сенсорики та оцінки будуть доступні після авторизації.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-8 items-center mb-10 border-t dark:border-slate-700 pt-10">
                <div className="w-full md:w-1/2 h-[350px] flex flex-col">
                  <h3 className="text-center font-bold text-slate-700 dark:text-slate-200 mb-4">{ui.sensoryMap}</h3>
                  <div className="flex-1 min-h-0 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#94a3b8" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#94a3b8" />
                        <Radar
                          name="Intensity"
                          dataKey="A"
                          stroke="#818cf8"
                          strokeWidth={3}
                          fill="#6366f1"
                          fillOpacity={0.4}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                          itemStyle={{ color: '#818cf8' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="w-full md:w-1/2">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 border-b dark:border-slate-700 pb-2">{ui.scoreDetails}</h3>
                  <ul className="space-y-3">
                    {radarData.map((item) => (
                      <li key={item.key} className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">{item.subject}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${(item.A / 5) * 100}%` }}
                            />
                          </div>
                          <span className="font-bold text-indigo-700 dark:text-indigo-400 w-8 text-right">{item.A}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-t dark:border-slate-700 pt-8">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">{ui.notesTitle}</h3>
                {textAnswers.length === 0 ? (
                  <p className="text-slate-400 dark:text-slate-500 italic">{ui.noNotes}</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.values(answers).map((ans) => {
                      const q = SURVEY_DATA.flatMap(c => c.questions).find(q => q.id === ans.questionId);
                      const isDrawing = q?.type === QuestionType.DRAWING && (ans.value as string)?.startsWith('data:image/');
                      const hasNote = ans.note && ans.note.trim() !== '';

                      if (!isDrawing && !hasNote && q?.type !== QuestionType.TEXT) return null;
                      if (q?.type === QuestionType.TEXT && !ans.value && !ans.note) return null;

                      return (
                        <div key={ans.questionId} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700 text-sm">
                          <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{q?.text[lang]}</p>

                          {isDrawing && (
                            <div className="mb-3 border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden bg-white">
                              <img
                                src={ans.value as string}
                                alt={q?.text[lang]}
                                className="w-full h-auto max-h-[200px] object-contain mx-auto"
                              />
                            </div>
                          )}

                          {hasNote && (
                            <p className="text-slate-600 dark:text-slate-400 italic">
                              {q?.type === QuestionType.DRAWING ? "Коментар: " : ""}
                              {ans.note}
                            </p>
                          )}

                          {q?.type === QuestionType.TEXT && ans.value && !isDrawing && (
                            <p className="text-slate-600 dark:text-slate-400">{ans.value}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 italic">
                <p className="font-bold mb-1 uppercase tracking-wider text-[9px] text-slate-500 dark:text-slate-400">{ui.disclaimerTitle}</p>
                <p>{ui.disclaimer}</p>
              </div>
            </>
          )}
        </div>


        <div className="border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setShowActions(!showActions)}
            className="w-full py-4 text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-white dark:bg-slate-800 flex items-center justify-center gap-2"
          >
            {showActions ? 'Hide options' : 'Show options (Download, Restart...)'}
          </button>

          {showActions && (
            <div className="bg-slate-50 dark:bg-slate-700/30 p-6 flex flex-wrap justify-center gap-4 animate-fade-in border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => downloadFile('json')}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 hover:shadow-sm transition-all"
              >
                <FileJson className="w-4 h-4" />
                {ui.downloadJson}
              </button>
              <button
                onClick={() => downloadFile('toon')}
                className="flex items-center gap-2 px-6 py-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700/50 text-amber-700 dark:text-amber-400 font-semibold rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                {ui.saveToon}
              </button>
              {!user && (
                <button
                  onClick={onReset}
                  className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 shadow-md hover:shadow-lg transition-all"
                >
                  {ui.retake}
                </button>
              )}
              <button
                onClick={onGoHome}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
              >
                {ui.goHome}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};