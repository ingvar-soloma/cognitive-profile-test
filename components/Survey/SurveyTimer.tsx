import React, { useState, useEffect } from 'react';
import { Timer, Clock } from 'lucide-react';

interface SurveyTimerProps {
    totalQuestions: number;
    answeredCount: number;
    ui: any;
}

export const SurveyTimer: React.FC<SurveyTimerProps> = ({ totalQuestions, answeredCount, ui }) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [smoothedRemaining, setSmoothedRemaining] = useState<number | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

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
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white/70 dark:bg-brand-graphite/40 backdrop-blur-md rounded-2xl border border-stone-line dark:border-white/10 shadow-sm transition-all duration-500">
            <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-ink/10 dark:bg-brand-ink/30 rounded-lg">
                    <Timer className="w-4 h-4 text-brand-ink dark:text-brand-clay" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-[0.1em]">{ui.timeSpent}</span>
                    <span className="text-sm font-bold text-brand-graphite dark:text-white tabular-nums">
                        {formatTime(elapsedSeconds)}
                    </span>
                </div>
            </div>

            <div className="w-px h-10 bg-stone-line dark:bg-white/10 hidden sm:block mx-2" />

            <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-clay/10 dark:bg-brand-clay/30 rounded-lg">
                    <Clock className="w-4 h-4 text-brand-clay dark:text-brand-ink/90" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-[0.1em]">{ui.predictedTime}</span>
                    <span className="text-sm font-bold text-brand-graphite dark:text-white tabular-nums transition-all duration-1000">
                        {smoothedRemaining !== null ? formatTime(Math.round(smoothedRemaining)) : '...'}
                    </span>
                </div>
            </div>
        </div>
    );
};
