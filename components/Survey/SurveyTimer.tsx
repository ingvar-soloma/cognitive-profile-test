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
        if (answeredCount > 0) {
            const avgTimePerQuestion = elapsedSeconds / answeredCount;
            const remainingQuestions = totalQuestions - answeredCount;
            const rawRemaining = avgTimePerQuestion * remainingQuestions;

            if (smoothedRemaining === null) {
                setSmoothedRemaining(rawRemaining);
            } else {
                // Smoothly adjust the prediction (Dampened EMA for stability)
                // We use a very high smoothing factor to make it change SLOWLY as requested
                setSmoothedRemaining(prev => prev! * 0.995 + rawRemaining * 0.005);
            }
        } else if (totalQuestions > 0) {
            // Hard estimate if no questions answered yet (e.g. 15 seconds per question)
            const rawRemaining = 15 * totalQuestions;
            if (smoothedRemaining === null) {
                setSmoothedRemaining(rawRemaining);
            } else {
                setSmoothedRemaining(prev => prev! * 0.998 + rawRemaining * 0.002);
            }
        }
    }, [elapsedSeconds, answeredCount, totalQuestions, smoothedRemaining]);

    return (
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-stone-line shadow-sm transition-all duration-500">
            <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-blue/10 rounded-lg">
                    <Timer className="w-4 h-4 text-brand-blue" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.1em]">{ui.timeSpent}</span>
                    <span className="text-sm font-bold text-brand-graphite dark:text-brand-paper tabular-nums">
                        {formatTime(elapsedSeconds)}
                    </span>
                </div>
            </div>

            <div className="w-px h-10 bg-stone-line hidden sm:block mx-2" />

            <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-green/10 rounded-lg">
                    <Clock className="w-4 h-4 text-brand-green" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.1em]">{ui.predictedTime}</span>
                    <span className="text-sm font-bold text-brand-graphite dark:text-brand-paper tabular-nums transition-all duration-1000">
                        {smoothedRemaining !== null ? formatTime(Math.round(smoothedRemaining)) : '...'}
                    </span>
                </div>
            </div>
        </div>
    );
};
