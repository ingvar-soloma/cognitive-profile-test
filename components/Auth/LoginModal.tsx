import React from 'react';
import { GoogleAuthButton } from '../Header';
import { BrainCircuit, ShieldCheck } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';

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
    return (
        <Dialog 
            open={isOpen} 
            onOpenChange={(open) => {
                if (!open && canClose && onClose) {
                    onClose();
                }
            }}
        >
            <DialogContent 
                className="max-w-md p-0 overflow-hidden sm:rounded-2xl"
                showCloseButton={canClose}
                onPointerDownOutside={(e) => {
                    if (!canClose) e.preventDefault();
                }}
                onEscapeKeyDown={(e) => {
                    if (!canClose) e.preventDefault();
                }}
            >
                <div className="p-8 pb-0 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                        <BrainCircuit className="w-10 h-10" />
                    </div>

                    <DialogHeader className="items-center">
                        <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                            {title || ui.loginModalTitle}
                        </DialogTitle>
                        <DialogDescription className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-center">
                            {description || ui.loginModalDesc}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="w-full flex justify-center mb-8">
                        <GoogleAuthButton />
                    </div>
                </div>

                <DialogFooter className="bg-slate-50 dark:bg-slate-900/50 p-6 flex items-start gap-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight text-left">
                        {ui.gdprText}
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

