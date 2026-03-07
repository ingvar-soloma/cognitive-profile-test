import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RotateCcw, Undo2, Redo2, PenTool } from 'lucide-react';

interface DrawingCanvasProps {
    value: string | null;
    onChange: (base64: string) => void;
    ui: any;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ value, onChange, ui }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasContent, setHasContent] = useState(!!value);

    const history = useRef<ImageData[]>([]);
    const historyIndex = useRef<number>(-1);
    const [, setUpdateTrigger] = useState(0);

    const forceUpdate = () => setUpdateTrigger(v => v + 1);

    const setupCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return null;

        const rect = canvas.getBoundingClientRect();
        // Only set resolution if it hasn't been set or changed
        if (canvas.width !== rect.width * window.devicePixelRatio) {
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
        }

        ctx.resetTransform();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#312e81';
        ctx.lineWidth = 2.5;

        return { canvas, ctx, rect };
    }, []);

    const isCanvasBlank = (canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return true;
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] !== 0) return false;
        }
        return true;
    };

    // Initial setup
    useEffect(() => {
        const result = setupCanvas();
        if (!result) return;
        const { canvas, ctx, rect } = result;

        if (value && value.startsWith('data:image/')) {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, rect.width, rect.height);
                const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
                history.current = [state];
                historyIndex.current = 0;
                setHasContent(true);
                forceUpdate();
            };
            img.src = value;
        } else {
            const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
            history.current = [state];
            historyIndex.current = 0;
            setHasContent(false);
            forceUpdate();
        }
    }, []);

    const saveToHistory = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const state = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (historyIndex.current < history.current.length - 1) {
            history.current = history.current.slice(0, historyIndex.current + 1);
        }

        history.current.push(state);
        historyIndex.current++;

        const blank = isCanvasBlank(canvas);
        setHasContent(!blank);
        onChange(blank ? '' : canvas.toDataURL('image/png'));
        forceUpdate();
    }, [onChange]);

    const undo = () => {
        if (historyIndex.current <= 0) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        historyIndex.current--;
        ctx.putImageData(history.current[historyIndex.current], 0, 0);

        const blank = isCanvasBlank(canvas);
        setHasContent(!blank);
        onChange(blank ? '' : canvas.toDataURL('image/png'));
        forceUpdate();
    };

    const redo = () => {
        if (historyIndex.current >= history.current.length - 1) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        historyIndex.current++;
        ctx.putImageData(history.current[historyIndex.current], 0, 0);

        setHasContent(true);
        onChange(canvas.toDataURL('image/png'));
        forceUpdate();
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        setIsDrawing(true);
        ctx.beginPath(); // CRITICAL: Reset the path on every new stroke
        ctx.moveTo(x, y);

        if (e.cancelable) e.preventDefault();
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();

        if (e.cancelable) e.preventDefault();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            saveToHistory();
        }
    };

    const clearCanvas = () => {
        const result = setupCanvas();
        if (!result) return;
        const { canvas, ctx } = result;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath(); // CRITICAL: Also clear path on manual reset

        setHasContent(false);
        saveToHistory();
        onChange('');
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="relative border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-inner group">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[300px] cursor-crosshair touch-none"
                />

                {!hasContent && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 dark:text-slate-700 select-none">
                        <div className="text-center">
                            <PenTool className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm font-medium opacity-50">{ui.drawHint || "Draw here..."}</p>
                        </div>
                    </div>
                )}

                {isDrawing && (
                    <div className="absolute top-3 right-3 p-1.5 bg-indigo-600 rounded-full animate-pulse shadow-lg">
                        <PenTool className="w-4 h-4 text-white" />
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center px-1">
                <div className="flex gap-2">
                    <button
                        onClick={undo}
                        disabled={historyIndex.current <= 0}
                        className={`p-2 rounded-lg transition-all active:scale-90 ${historyIndex.current <= 0 ? 'opacity-20 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                    >
                        <Undo2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={redo}
                        disabled={historyIndex.current >= history.current.length - 1}
                        className={`p-2 rounded-lg transition-all active:scale-90 ${historyIndex.current >= history.current.length - 1 ? 'opacity-20 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                    >
                        <Redo2 className="w-5 h-5" />
                    </button>
                </div>

                <button
                    onClick={clearCanvas}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors uppercase tracking-wider"
                >
                    <RotateCcw className="w-4 h-4" />
                    {ui.clear || "Clear"}
                </button>
            </div>
        </div>
    );
};
