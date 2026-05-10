import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, ArrowDownCircle } from 'lucide-react';
import { QuestionCard } from './QuestionCard';
import { SurveyTimer } from './SurveyTimer';
import { LocalizedCategoryData, Answer, LocalizedScaleConfig } from '@/types';

interface SurveyProps {
  ui: any;
  currentCategoryIndex: number;
  totalCategories: number;
  activeCategory: LocalizedCategoryData;
  answers: Record<string, Answer>;
  onAnswerChange: (questionId: string, value: string | number | null, note: string) => void;
  onPrevCategory: () => void;
  onNextCategory: () => void;
  isLoading?: boolean;
  scaleConfig?: LocalizedScaleConfig;
  isQuestionAnswered: (q: any, ans: Answer | undefined) => boolean;
  showUnansweredIndicators?: boolean;
  totalQuestions?: number;
  answeredCount?: number;
  elapsedSeconds?: number;
}

const SkeletonLoader = () => (
  <div className="animate-pulse space-y-8">
    <div className="mb-8">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
    </div>
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex gap-4 mb-4">
            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            </div>
          </div>
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        </div>
      ))}
    </div>
  </div>
);

export const Survey: React.FC<SurveyProps> = ({
  ui,
  currentCategoryIndex,
  totalCategories,
  activeCategory,
  answers,
  onAnswerChange,
  onPrevCategory,
  onNextCategory,
  isLoading = false,
  scaleConfig,
  isQuestionAnswered,
  showUnansweredIndicators = false,
  totalQuestions = 0,
  answeredCount = 0,
  elapsedSeconds = 0
}) => {
  const unansweredIds = React.useMemo(() => {
    if (!activeCategory) return [];
    return activeCategory.questions
      .filter(q => !isQuestionAnswered(q, answers[q.id]))
      .map(q => q.id);
  }, [activeCategory, answers, isQuestionAnswered]);

  const scrollToFirstUnanswered = () => {
    if (unansweredIds.length > 0) {
      const el = document.getElementById(`question-${unansweredIds[0]}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  if (isLoading || !activeCategory) {
    return <SkeletonLoader />;
  }

  return (
    <div className="animate-fade-in">
      {/* Category Header */}
      <div className="mb-6">
        <span className="text-brand-ink/60 dark:text-brand-ink font-bold uppercase tracking-[0.2em] text-[10px] mb-2 block">
          {ui.part} {currentCategoryIndex + 1} {ui.of} {totalCategories}
        </span>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-textPrimary mb-3 tracking-tight">{activeCategory.title}</h2>
        <p className="text-stone-500 text-base md:text-lg leading-relaxed">{activeCategory.description}</p>
      </div>

      {/* Survey Stats */}
      <SurveyTimer
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        ui={ui}
        externalElapsedSeconds={elapsedSeconds}
      />

      {/* Questions List */}
      <div className="space-y-2">
        {activeCategory.questions.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
            answer={answers[q.id]}
            onAnswerChange={(val, note) => onAnswerChange(q.id, val, note)}
            ui={ui}
            scaleConfig={scaleConfig}
            isUnanswered={showUnansweredIndicators && unansweredIds.includes(q.id)}
          />
        ))}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-stone-line">
        <button
          onClick={onPrevCategory}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${currentCategoryIndex === 0
            ? 'text-stone-300 cursor-not-allowed opacity-50'
            : 'text-stone-500 hover:bg-stone-bg hover:text-brand-textPrimary'
            }`}
          disabled={currentCategoryIndex === 0}
        >
          <ChevronLeft className="w-4 h-4" />
          {ui.back}
        </button>

        <button
          onClick={onNextCategory}
          className="btn-primary px-8 shadow-soft"
        >
          <span className="uppercase tracking-widest text-xs font-bold">
            {currentCategoryIndex === totalCategories - 1 ? ui.finish : ui.next}
          </span>
          {currentCategoryIndex === totalCategories - 1 ? <CheckCircle className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating Scroll Button */}
      {unansweredIds.length > 0 && (
        <button
          onClick={scrollToFirstUnanswered}
          className="fixed bottom-6 right-6 z-40 bg-brand-ink text-white p-3.5 rounded-full shadow-soft hover:bg-brand-ink-hover transition-all transform hover:scale-110 flex items-center gap-2 group border border-white/10"
          title={ui.scrollToUnanswered}
        >
          <ArrowDownCircle className="w-5 h-5" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-xs font-bold whitespace-nowrap uppercase tracking-wider">
            {ui.scrollToUnanswered} ({unansweredIds.length})
          </span>
        </button>
      )}
    </div>
  );
};