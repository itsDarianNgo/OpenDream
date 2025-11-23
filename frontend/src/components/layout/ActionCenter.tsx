"use client";

import { useCallback } from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { Send, Check, X, Eye, Sparkles } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

const cn = (...inputs: Parameters<typeof clsx>) => twMerge(clsx(...inputs));

export default function ActionCenter() {
    const {
        prompt,
        setPrompt,
        isGenerating,
        setIsGenerating,
        reviewMode,
        setReviewMode,
        canvasController,
    } = useEditorStore();

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim() || !canvasController) return;
        setIsGenerating(true);
        try {
            const data = await canvasController.getCanvasData();
            if (!data) {
                alert("Add an image first!");
                return;
            }

            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: data.image, mask: data.mask, prompt }),
            });
            const result = await response.json();
            if (result.status === "success") {
                await canvasController.setResultImage(result.image);
                setReviewMode(true);
            } else {
                throw new Error(result.detail || 'Generation failed');
            }
        } catch (e: any) {
            alert(e.message || 'Unable to generate');
        } finally {
            setIsGenerating(false);
        }
    }, [prompt, canvasController, setIsGenerating, setReviewMode]);

    const handleAccept = () => {
        canvasController?.commitResult();
        canvasController?.clearMask();
        setReviewMode(false);
        setPrompt('');
    };

    const handleDiscard = () => {
        canvasController?.discardResult();
        setReviewMode(false);
    };

    return (
        <div className="absolute left-0 right-0 bottom-24 sm:bottom-16 z-50 px-6 pointer-events-none flex justify-center">
            {!reviewMode ? (
                <div className="pointer-events-auto w-full max-w-md flex flex-col gap-2">
                    <div className="relative group transition-all duration-300 focus-within:-translate-y-40">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Sparkles size={18} className="text-indigo-400" />
                        </div>
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe your edit..."
                            className="w-full bg-black/60 backdrop-blur-xl border border-white/20 rounded-3xl py-4 pl-12 pr-16 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-base text-white placeholder:text-neutral-500 shadow-2xl transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className={cn(
                                'absolute right-1.5 top-1.5 bottom-1.5 aspect-square rounded-2xl flex items-center justify-center transition-all duration-300',
                                isGenerating
                                    ? 'bg-neutral-800 text-neutral-400'
                                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/40 active:scale-90 text-white'
                            )}
                            aria-busy={isGenerating}
                            aria-label="Generate"
                        >
                            {isGenerating ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Send size={20} className="ml-0.5" />
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="pointer-events-auto w-full max-w-md bg-neutral-900/90 backdrop-blur-xl border-t border-x border-white/10 rounded-t-3xl p-6 shadow-2xl flex flex-col gap-4">
                    <div className="flex justify-center -mt-2 mb-2">
                        <div className="w-12 h-1 bg-white/20 rounded-full" />
                    </div>

                    <div className="flex gap-4">
                        <button
                            onMouseDown={() => canvasController?.toggleCompare(true)}
                            onMouseUp={() => canvasController?.toggleCompare(false)}
                            onTouchStart={() => canvasController?.toggleCompare(true)}
                            onTouchEnd={() => canvasController?.toggleCompare(false)}
                            className="flex-1 py-4 rounded-2xl bg-neutral-800 text-white font-medium active:scale-95 transition-transform flex flex-col items-center gap-1"
                        >
                            <Eye size={24} />
                            <span className="text-xs opacity-50">HOLD</span>
                        </button>
                        <button
                            onClick={handleDiscard}
                            className="flex-1 py-4 rounded-2xl bg-red-500/10 text-red-400 font-bold active:scale-95 transition-transform flex flex-col items-center gap-1"
                        >
                            <X size={24} />
                            <span className="text-xs opacity-50">DISCARD</span>
                        </button>
                    </div>
                    <button
                        onClick={handleAccept}
                        className="w-full py-4 rounded-2xl bg-white text-black font-black text-lg shadow-xl shadow-white/10 active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        <Check size={24} /> ACCEPT
                    </button>
                </div>
            )}
        </div>
    );
}
