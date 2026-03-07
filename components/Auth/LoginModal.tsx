import React from 'react';
import { GoogleAuthButton } from '../Header';
import { BrainCircuit, X, ShieldCheck } from 'lucide-react';

interface LoginModalProps {
    isOpen: boolean;
    onClose?: () => void;
    ui: any;
    title?: string;
    description?: string;
    canClose?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
    isOpen,
    onClose,
    ui,
    title,
    description,
    canClose = true
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={canClose ? onClose : undefined}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                {canClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                <div className="p-8 pb-0 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                        <BrainCircuit className="w-10 h-10" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                        {title || ui.loginModalTitle}
                    </h2>

                    <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                        {description || ui.loginModalDesc}
                    </p>

                    <div className="w-full flex justify-center mb-8">
                        <GoogleAuthButton />
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 flex items-start gap-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                        {ui.gdprText}
                    </p>
                </div>
            </div>
        </div>
    );
};
