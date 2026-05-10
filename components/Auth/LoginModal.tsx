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
                className="max-w-md p-0 overflow-hidden sm:rounded-2xl border-none bg-brand-bgCard text-brand-textPrimary shadow-2xl"
                showCloseButton={canClose}
                onPointerDownOutside={(e) => {
                    if (!canClose) e.preventDefault();
                }}
                onEscapeKeyDown={(e) => {
                    if (!canClose) e.preventDefault();
                }}
            >
                <div className="p-8 pb-0 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-brand-ink/10 rounded-2xl flex items-center justify-center text-brand-ink mb-6">
                        <BrainCircuit className="w-10 h-10" />
                    </div>

                    <DialogHeader className="items-center">
                        <DialogTitle className="text-2xl font-bold text-brand-textPrimary mb-3">
                            {title || ui.loginModalTitle}
                        </DialogTitle>
                        <DialogDescription className="text-stone-500 mb-8 leading-relaxed text-center">
                            {description || ui.loginModalDesc}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="w-full flex justify-center mb-10">
                        <div className="scale-110">
                            <GoogleAuthButton />
                        </div>
                    </div>
                </div>

                <DialogFooter className="bg-stone-50 dark:bg-white/5 p-6 flex flex-row items-start gap-4 border-t border-stone-line/50">
                    <div className="bg-brand-ink/10 p-2 rounded-lg text-brand-ink shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <p className="text-[11px] text-stone-500 leading-snug text-left">
                        {ui.gdprText}
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

