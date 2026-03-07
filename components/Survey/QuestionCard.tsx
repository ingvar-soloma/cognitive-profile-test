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
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-6 mb-6 transition-all hover:shadow-md relative
        ${isUnanswered
          ? 'border-red-300 dark:border-red-900 shadow-red-50 dark:shadow-none ring-1 ring-red-100 dark:ring-red-900/30'
          : 'border-slate-200 dark:border-slate-700'}
      `}
    >
      {isUnanswered && (
        <div className="absolute -top-3 left-6 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded uppercase tracking-wider animate-bounce">
          {ui.unanswered}
        </div>
      )}
      <div className="flex items-start gap-3 mb-2">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400 mt-1 min-w-fit">
          <span className="font-bold text-xs uppercase tracking-wider block">{question.subCategory || 'Question'}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 leading-snug">{question.text}</h3>
          {question.hint && (
            <div className="flex items-start gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-md border border-slate-100 dark:border-slate-600 italic">
              <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>{question.hint}</span>
            </div>
          )}
        </div>
      </div>

      <div className="pl-0 md:pl-4 space-y-6 mt-4">
        {/* Input Area based on Type */}
        <div className="min-h-[60px]">
          {question.type === QuestionType.SCALE && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-1 text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                <span>{min}</span>
                <span>{max}</span>
              </div>
              <div className="flex gap-2 w-full">
                {scaleNumbers.map((num) => {
                  const isSelected = answer?.value === num;
                  return (
                    <button
                      key={num}
                      onClick={() => handleValueChange(num)}
                      className={`
                        flex-1 h-12 rounded-lg font-bold text-lg transition-all transform active:scale-95 border
                        ${isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105'
                          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-600'
                        }
                      `}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
              <div className="text-center h-5">
                {answer?.value && typeof answer.value === 'number' && (
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 animate-fade-in">
                    {scaleConfig?.labels[answer.value] || (
                      // Fallback to UI strings if no custom config or label missing
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
                    flex items-center p-3 border rounded-lg cursor-pointer transition-all
                    ${answer?.value === opt.value
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={opt.value}
                    checked={answer?.value === opt.value}
                    onChange={() => handleValueChange(opt.value)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-500"
                  />
                  <span className="ml-3 text-slate-700 dark:text-slate-200 font-medium">{opt.label}</span>
                  {answer?.value === opt.value && <CheckCircle2 className="w-4 h-4 ml-auto text-indigo-600 dark:text-indigo-400" />}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Universal Text Area for elaboration */}
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
            <MessageSquare className="w-4 h-4" />
            {question.type === QuestionType.TEXT ? ui.yourAnswer : ui.optionalComment}
          </label>
          <textarea
            value={answer?.note || ''}
            onChange={handleNoteChange}
            placeholder={question.placeholder || ""}
            className="w-full min-h-[80px] p-3 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-y placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
      </div>
    </div>
  );
};