"use client";

import { Brush, Eraser, Hand, Move, Send, Sparkles, Check, X, Eye, Undo, Redo } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

export default function BottomControls() {
    const {
        activeTool, setTool,
        prompt, setPrompt,
        isGenerating, setIsGenerating,
        reviewMode, setReviewMode,
        canUndo, canRedo, // <--- FROM STORE
        canvasController
    } = useEditorStore();

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        if (!canvasController) return;

        setIsGenerating(true);
        try {
            const data = await canvasController.getCanvasData();
            if (!data) {
                alert("Upload an image first!");
                setIsGenerating(false);
                return;
            }

            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

            const response = await fetch(`${API_URL}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: data.image, mask: data.mask, prompt: prompt })
            });

            if (!response.ok) throw new Error(await response.text());

            const result = await response.json();
            if (result.status === "success") {
                await canvasController.setResultImage(result.image);
                setReviewMode(true);
            } else {
                throw new Error(result.detail || "Unknown Error");
            }
        } catch (e: any) {
            console.error(e);
            alert(`Error: ${e.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAccept = () => {
        canvasController?.commitResult();
        setReviewMode(false);
        setPrompt("");
    };

    const handleDiscard = () => {
        canvasController?.discardResult();
        setReviewMode(false);
    };

    return (
        <div className="absolute bottom-0 left-0 right-0 z-40 flex flex-col gap-3 p-4 pointer-events-none">

            {/* History & Tools Row */}
            <div className={`flex justify-center gap-4 transition-all duration-300 ${reviewMode ? 'opacity-0 translate-y-4' : 'opacity-100'}`}>

                {/* History Pill */}
                <div className="pointer-events-auto flex items-center gap-1 bg-black/60 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-2xl h-full">
                    <button
                        onClick={() => canvasController?.undo()}
                        disabled={!canUndo}
                        className={`p-3 rounded-xl transition-colors ${canUndo ? 'text-white hover:bg-white/10' : 'text-neutral-600'}`}
                    >
                        <Undo size={20} />
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-1"></div>
                    <button
                        onClick={() => canvasController?.redo()}
                        disabled={!canRedo}
                        className={`p-3 rounded-xl transition-colors ${canRedo ? 'text-white hover:bg-white/10' : 'text-neutral-600'}`}
                    >
                        <Redo size={20} />
                    </button>
                </div>

                {/* Tools Dock */}
                <div className="pointer-events-auto flex items-center gap-1 bg-black/60 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-2xl">
                    <ToolButton icon={<Move size={20} />} active={activeTool === 'select'} onClick={() => setTool('select')} />
                    <ToolButton icon={<Hand size={20} />} active={activeTool === 'pan'} onClick={() => setTool('pan')} />
                    <div className="w-px h-6 bg-white/10 mx-1"></div>
                    <ToolButton icon={<Brush size={20} />} active={activeTool === 'brush'} onClick={() => setTool('brush')} highlight />
                    <button onClick={() => canvasController?.clearMask()} className="p-3 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors">
                        <Eraser size={20} />
                    </button>
                </div>
            </div>

            {/* Action Bar (Prompt) */}
            <div className="pointer-events-auto">
                {!reviewMode ? (
                    <div className="relative w-full max-w-lg mx-auto group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Sparkles size={18} className="text-indigo-400" />
                        </div>
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="What do you want to change?"
                            className="w-full bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-12 pr-14 focus:outline-none focus:border-indigo-500 text-base shadow-2xl transition-all placeholder:text-neutral-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className={`absolute right-2 top-2 bottom-2 aspect-square rounded-xl flex items-center justify-center transition-all
                            ${isGenerating ? 'bg-neutral-800 text-neutral-500' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 active:scale-95'}`}
                        >
                            {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
                        </button>
                    </div>
                ) : (
                    <div className="w-full max-w-lg mx-auto bg-neutral-900/90 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl flex items-center justify-between gap-2">
                        <button
                            onMouseDown={() => canvasController?.toggleCompare(true)}
                            onMouseUp={() => canvasController?.toggleCompare(false)}
                            onTouchStart={() => canvasController?.toggleCompare(true)}
                            onTouchEnd={() => canvasController?.toggleCompare(false)}
                            className="flex-1 py-3 rounded-xl text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex flex-col items-center gap-1 active:scale-95 transition-transform"
                        >
                            <Eye size={20}/> <span className="text-[10px] opacity-60">Compare</span>
                        </button>
                        <button onClick={handleDiscard} className="flex-1 py-3 rounded-xl text-sm font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 flex flex-col items-center gap-1 active:scale-95 transition-transform">
                            <X size={20}/> <span className="text-[10px] opacity-60">Discard</span>
                        </button>
                        <button onClick={handleAccept} className="flex-[1.5] py-3 rounded-xl text-sm font-bold bg-green-600 text-white shadow-lg shadow-green-500/20 flex flex-col items-center gap-1 active:scale-95 transition-transform">
                            <Check size={20}/> <span className="text-[10px] opacity-80">Keep It</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function ToolButton({ icon, active, onClick, highlight }: any) {
    return (
        <button
            onClick={onClick}
            className={`p-3 rounded-xl transition-all duration-200 ${
                active
                    ? (highlight ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 scale-105' : 'bg-white text-black shadow-lg scale-105')
                    : 'text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
        >
            {icon}
        </button>
    );
}