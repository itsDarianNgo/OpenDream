"use client";

import { useRef, ChangeEvent } from 'react';
import dynamic from 'next/dynamic';
import SideToolbar from '../components/layout/SideToolbar';
import ActionCenter from '../components/layout/ActionCenter';
import { TopChrome, BottomNav } from '../components/layout/TopChrome';
import { useEditorStore } from '../store/useEditorStore';
import { CanvasController } from '../components/FabricCanvas';

const FabricCanvas = dynamic(() => import('../components/FabricCanvas'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-screen text-neutral-500 bg-black">Loading Engine...</div>,
});

export default function Home() {
    const { activeTool, setCanvasController, canvasController } = useEditorStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCanvasLoaded = (controller: CanvasController) => {
        setCanvasController(controller);
    };

    const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const input = event.target;
        const file = input.files?.[0];

        if (!file || !file.type.startsWith('image/')) {
            input.value = '';
            return;
        }

        if (!canvasController) {
            input.value = '';
            return;
        }

        try {
            await canvasController.loadImageFromFile(file);
        } finally {
            input.value = '';
        }
    };

    const openPhotoPicker = () => {
        fileInputRef.current?.click();
    };

    return (
        <main className="relative min-h-screen w-screen overflow-hidden bg-[#050507] text-white font-sans selection:bg-indigo-500/30">
            <input
                ref={fileInputRef}
                id="canvas-photo-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
            />
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-10 -top-24 h-72 w-72 rounded-full bg-purple-600/25 blur-[120px]" />
                <div className="absolute right-[-120px] top-10 h-80 w-80 rounded-full bg-indigo-500/20 blur-[140px]" />
                <div className="absolute inset-x-0 bottom-16 h-32 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            <div className="relative z-10 flex h-[100dvh] flex-col">
                <TopChrome />

                <div className="flex-1 px-4 sm:px-8 pb-32 sm:pb-28 pt-4 flex flex-col gap-4">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-sm text-white/60">
                                    <span className="text-xs uppercase tracking-[0.08em] bg-white/10 border border-white/10 rounded-full px-3 py-1">Beta</span>
                                    <span className="text-sm">Creative canvas</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Bring any design to life</h1>
                            </div>
                            <button
                                onClick={openPhotoPicker}
                                className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold shadow-lg shadow-indigo-500/40 hover:bg-indigo-400 active:scale-[0.98] transition-all"
                            >
                                Start with a photo
                            </button>
                        </div>
                    </div>

                    <div className="relative flex-1 w-full max-w-6xl mx-auto">
                        <div className="relative h-full min-h-[420px] rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden">
                            <FabricCanvas tool={activeTool} onLoaded={handleCanvasLoaded} />
                            <SideToolbar />
                            <ActionCenter />
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav />
        </main>
    );
}
