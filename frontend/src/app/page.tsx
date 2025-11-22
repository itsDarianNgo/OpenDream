"use client";

import dynamic from 'next/dynamic';
import { useState, useRef, useEffect } from 'react';
import { Brush, Eraser, Hand, Move, Send, Sparkles } from 'lucide-react';
import { CanvasController } from '../components/FabricCanvas'; // Import type

const FabricCanvas = dynamic(() => import('../components/FabricCanvas'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-screen text-neutral-500">Loading Studio...</div>
});

export default function Home() {
    // We store the controller in a ref manually
    const controllerRef = useRef<CanvasController | null>(null);

    const [activeTool, setActiveTool] = useState<'select' | 'brush' | 'pan'>('select');
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleCanvasLoaded = (controller: CanvasController) => {
        console.log("✅ Parent received Canvas Controller!");
        controllerRef.current = controller;
    };

    const handleGenerate = async () => {
        console.log("🖱️ Generate Clicked");

        if (!prompt.trim()) {
            alert("Error: Prompt is empty.");
            return;
        }

        if (!controllerRef.current) {
            alert("CRITICAL ERROR: Canvas Controller not ready. Try adding an image first.");
            return;
        }

        setIsGenerating(true);

        try {
            console.log("📸 Snapshotting...");
            const data = await controllerRef.current.getCanvasData();

            if (!data) {
                alert("Error: No image detected.");
                setIsGenerating(false);
                return;
            }

            console.log(`📦 Payload: ${data.image.length} bytes`);

            const API_URL = 'http://localhost:8000';
            console.log(`🚀 Sending to ${API_URL}...`);

            const response = await fetch(`${API_URL}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: data.image,
                    mask: data.mask,
                    prompt: prompt
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Server Error: ${errText}`);
            }

            const result = await response.json();

            if (result.status === "success") {
                console.log("✨ Success!");
                await controllerRef.current.setResultImage(result.image);
                controllerRef.current.clearMask();
                setActiveTool('select');
            } else {
                throw new Error("AI Error: " + JSON.stringify(result));
            }

        } catch (e: any) {
            console.error(e);
            alert(`❌ FAILED:\n${e.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <main className="flex h-screen w-screen flex-col bg-black overflow-hidden text-white">

            {/* Header */}
            <div className="h-16 border-b border-neutral-800 bg-neutral-900 flex items-center px-6 justify-between z-20 shadow-lg">
                <div className="flex items-center gap-6">
                    <h1 className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                        OpenDream
                    </h1>

                    {/* Tools */}
                    <div className="flex bg-black/40 p-1 rounded-lg border border-neutral-800">
                        <ToolButton
                            icon={<Move size={18} />}
                            active={activeTool === 'select'}
                            onClick={() => setActiveTool('select')}
                            tooltip="Select / Move"
                        />
                        <ToolButton
                            icon={<Hand size={18} />}
                            active={activeTool === 'pan'}
                            onClick={() => setActiveTool('pan')}
                            tooltip="Pan Canvas"
                        />
                        <div className="w-px bg-neutral-700 mx-1 h-6 self-center"></div>
                        <ToolButton
                            icon={<Brush size={18} />}
                            active={activeTool === 'brush'}
                            onClick={() => setActiveTool('brush')}
                            tooltip="Paint Mask"
                        />
                        <button
                            onClick={() => controllerRef.current?.clearMask()}
                            className="p-2 text-neutral-400 hover:text-red-400 transition-colors"
                            title="Clear Mask"
                        >
                            <Eraser size={18} />
                        </button>
                    </div>
                </div>

                {/* Prompt */}
                <div className="flex-1 max-w-2xl mx-8 relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Sparkles size={16} className="text-indigo-400" />
                    </div>
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the edit..."
                        className="w-full bg-black/40 border border-neutral-700 rounded-full py-2.5 pl-10 pr-32 focus:outline-none focus:border-indigo-500 text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className={`absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-full text-xs font-bold flex items-center gap-2 transition-all
                    ${isGenerating ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/25'}`}
                    >
                        {isGenerating ? 'DREAMING...' : <>GENERATE <Send size={12} /></>}
                    </button>
                </div>

                <div className="text-xs text-neutral-600 font-mono">v1.1.0 (Callback)</div>
            </div>

            {/* Workspace */}
            <div className="flex-1 relative">
                {/* HANDSHAKE HAPPENS HERE */}
                <FabricCanvas tool={activeTool} onLoaded={handleCanvasLoaded} />
            </div>
        </main>
    );
}

function ToolButton({ icon, active, onClick, tooltip }: any) {
    return (
        <button
            onClick={onClick}
            title={tooltip}
            className={`p-2 rounded-md transition-all ${active ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
        >
            {icon}
        </button>
    );
}