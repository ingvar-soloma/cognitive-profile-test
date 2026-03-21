import React, { useState, useEffect } from 'react';
import { Timer, Clock } from 'lucide-react';

interface SurveyTimerProps {
    totalQuestions: number;
    answeredCount: number;
    ui: any;
    externalElapsedSeconds?: number;
}

export const SurveyTimer: React.FC<SurveyTimerProps> = ({ totalQuestions, answeredCount, ui, externalElapsedSeconds = 0 }) => {
    const [smoothedRemaining, setSmoothedRemaining] = useState<number | null>(null);

    const elapsedSeconds = externalElapsedSeconds;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        if (mins > 0) {
            return `${mins} ${ui.minutesShort} ${secs} ${ui.secondsShort}`;
        }
        return `${secs} ${ui.secondsShort}`;
    };

    useEffect(() => {
        let rawRemaining = 0;
        let factor = 0.005;

        if (answeredCount > 0) {
            const avgTimePerQuestion = elapsedSeconds / answeredCount;
            const remainingQuestions = totalQuestions - answeredCount;
            rawRemaining = avgTimePerQuestion * remainingQuestions;
            factor = 0.005; // EMA factor for answered
        } else if (totalQuestions > 0) {
            rawRemaining = 15 * totalQuestions;
            factor = 0.002; // Slower EMA factor for initial estimate
        } else {
            return;
        }

        setSmoothedRemaining(prev => {
            if (prev === null) return rawRemaining;
            return prev * (1 - factor) + rawRemaining * factor;
        });
    }, [elapsedSeconds, answeredCount, totalQuestions]);

    return (
        <div className="flex flex-wrap items-center gap-6 mb-12 p-5 bg-brand-paper-accent/40 dark:bg-stone-bg/30 backdrop-blur-xl rounded-2xl border border-stone-line dark:border-white/5 shadow-sm transition-all duration-500">
            <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 flex items-center justify-center bg-brand-ink/5 dark:bg-brand-ink/10 rounded-xl border border-brand-ink/10">
                    <Timer className="w-5 h-5 text-brand-ink" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">{ui.timeSpent}</span>
                    <span className="text-base font-bold text-brand-graphite dark:text-white tabular-nums leading-tight">
                        {formatTime(elapsedSeconds)}
                    </span>
                </div>
            </div>

            <div className="w-px h-10 bg-gradient-to-b from-transparent via-stone-line dark:via-white/10 to-transparent hidden sm:block" />

            <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 flex items-center justify-center bg-brand-clay/5 dark:bg-brand-clay/10 rounded-xl border border-brand-clay/10">
                    <Clock className="w-5 h-5 text-brand-clay" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">{ui.predictedTime}</span>
                    <span className="text-base font-bold text-brand-graphite dark:text-white tabular-nums transition-all duration-1000 leading-tight">
                        {smoothedRemaining !== null ? formatTime(Math.round(smoothedRemaining)) : '...'}
                    </span>
                </div>
            </div>
        </div>
    );
};
