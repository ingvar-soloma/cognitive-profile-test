import React from 'react';
import { LocalizedQuestion, QuestionType, Answer, UIStrings, LocalizedScaleConfig } from '@/types';
import { MessageSquare, CheckCircle2, Lightbulb } from 'lucide-react';
import { DrawingCanvas } from './DrawingCanvas';

interface QuestionCardProps {
  question: LocalizedQuestion;
  answer?: Answer;
  onAnswerChange: (value: string | number | null, note: string) => void;
  ui: UIStrings;
  scaleConfig?: LocalizedScaleConfig;
  isUnanswered?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  answer,
  onAnswerChange,
  ui,
  scaleConfig,
  isUnanswered
}) => {
  const handleValueChange = (val: string | number) => {
    onAnswerChange(val, answer?.note || '');
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onAnswerChange(answer?.value ?? null, e.target.value);
  };

  // Generate scale numbers based on config or default 1-5
  const min = scaleConfig?.min ?? 1;
  const max = scaleConfig?.max ?? 5;
  const scaleNumbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div
      id={`question-${question.id}`}
      className={`bg-brand-bgCard rounded-[2rem] border p-6 md:p-8 mb-6 md:mb-8 transition-all hover:shadow-card relative
        ${isUnanswered
          ? 'border-brand-clay/30 bg-brand-clay/[0.02] ring-1 ring-brand-clay/10'
          : 'border-stone-line'}
      `}
    >
      {isUnanswered && (
        <div className="absolute -top-3 left-8 px-2.5 py-1 bg-brand-clay text-white text-[9px] font-bold rounded-full uppercase tracking-wider shadow-sm">
          {ui.unanswered}
        </div>
      )}
      <div className="flex items-start gap-4 mb-6">
        <div className="bg-stone-bg border border-stone-line px-3 py-1 rounded-full text-stone-400 mt-1 min-w-fit">
          <span className="font-bold text-[9px] uppercase tracking-[0.1em] block">{question.subCategory || 'Question'}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-serif font-bold text-brand-textPrimary leading-snug tracking-tight">{question.text}</h3>
          {question.hint && (
            <div className="flex items-start gap-2 mt-4 text-sm text-stone-400 bg-stone-bg/50 p-3 rounded-2xl border border-stone-line italic">
              <Lightbulb className="w-4 h-4 text-brand-clay flex-shrink-0 mt-0.5" />
              <span>{question.hint}</span>
            </div>
          )}
        </div>
      </div>

      <div className="pl-0 md:pl-4 space-y-6 mt-6">
        {/* Input Area based on Type */}
        <div className="min-h-[60px]">
          {question.type === QuestionType.SCALE && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-1 text-[10px] text-stone-400 font-bold uppercase tracking-[0.15em]">
                <span>{min}: Total Absence</span>
                <span>{max}: Extremely Realistic</span>
              </div>
              <div className="flex gap-2 w-full">
                {scaleNumbers.map((num) => {
                  const isSelected = answer?.value === num;
                  return (
                    <button
                      key={num}
                      onClick={() => handleValueChange(num)}
                      className={`
                        flex-1 h-14 rounded-2xl font-bold text-xl transition-all transform active:scale-95 border
                        ${isSelected
                          ? 'bg-brand-ink text-white border-brand-ink shadow-soft scale-[1.03]'
                          : 'bg-stone-bg text-stone-400 border-stone-line hover:border-brand-ink/30 hover:bg-stone-bg/80'
                        }
                      `}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
              <div className="text-center h-6">
                {answer?.value && typeof answer.value === 'number' && (
                  <span className="text-sm font-bold text-brand-ink animate-fade-in uppercase tracking-wider">
                    {scaleConfig?.labels[answer.value] || (
                      answer.value === 1 ? ui.scale1 :
                        answer.value === 2 ? ui.scale2 :
                          answer.value === 3 ? ui.scale3 :
                            answer.value === 4 ? ui.scale4 :
                              answer.value === 5 ? ui.scale5 : ''
                    )}
                  </span>
                )}
              </div>
            </div>
          )}

          {question.type === QuestionType.DRAWING && (
            <DrawingCanvas
              value={answer?.value as string}
              onChange={handleValueChange}
              ui={ui}
            />
          )}

          {question.type === QuestionType.CHOICE && question.options && (
            <div className="grid grid-cols-1 gap-3">
              {question.options.map((opt) => (
                <label
                  key={opt.value}
                  className={`
                    flex items-center p-4 border rounded-2xl cursor-pointer transition-all
                    ${answer?.value === opt.value
                      ? 'bg-brand-ink/[0.03] border-brand-ink/30 ring-1 ring-brand-ink/10 shadow-sm'
                      : 'bg-stone-bg/50 border-stone-line hover:border-brand-ink/20 hover:bg-stone-bg'
                    }
                  `}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${answer?.value === opt.value ? 'border-brand-ink bg-brand-ink' : 'border-stone-line'
                    }`}>
                    {answer?.value === opt.value && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                  <input
                    type="radio"
                    name={question.id}
                    value={opt.value}
                    checked={answer?.value === opt.value}
                    onChange={() => handleValueChange(opt.value)}
                    className="sr-only"
                  />
                  <span className={`ml-4 text-sm font-bold ${answer?.value === opt.value ? 'text-brand-ink' : 'text-brand-textPrimary'}`}>{opt.label}</span>
                  {answer?.value === opt.value && <CheckCircle2 className="w-5 h-5 ml-auto text-brand-sage" />}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Universal Text Area for elaboration */}
        {/* Universal Text Area for elaboration */}
        <div className="bg-brand-bgMain p-6 rounded-[1.5rem] border border-stone-line shadow-sm">
          <label className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">
            <MessageSquare className="w-3 h-3" />
            {question.type === QuestionType.TEXT ? ui.yourAnswer : ui.optionalComment}
          </label>
          <div className="relative">
            <textarea
              value={answer?.note || ''}
              onChange={handleNoteChange}
              placeholder={question.placeholder || ""}
              maxLength={300}
              className="w-full min-h-[100px] p-4 text-sm text-brand-textPrimary bg-brand-bgCard border border-stone-line rounded-2xl focus:ring-2 focus:ring-brand-ink/20 focus:border-brand-ink/30 outline-none transition-all resize-y placeholder-stone-400"
            />
            <div className="absolute bottom-3 right-4 text-[10px] text-stone-400 font-bold pointer-events-none">
              {(answer?.note || '').length} / 300
            </div>
          </div>
        </div>

        {/* Community Examples - Show only after answering */}
        {(answer?.value !== null && answer?.value !== undefined || (answer?.note && answer.note.length > 10)) && question.examples && question.examples.length > 0 && (
          <div className="mt-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[9px] font-bold text-stone-300 uppercase tracking-[0.2em] whitespace-nowrap">
                {ui.howOthersSeeIt}
              </span>
              <div className="h-px flex-1 bg-stone-100"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {question.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-stone-bg/50 border border-stone-line text-[11px] text-stone-400 leading-relaxed relative overflow-hidden group/ex italic"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-stone-line transition-all group-hover/ex:bg-brand-clay/30"></div>
                  {ex}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};