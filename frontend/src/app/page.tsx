"use client";

import dynamic from 'next/dynamic';
import SideToolbar from '../components/layout/SideToolbar';
import ActionCenter from '../components/layout/ActionCenter';
import { useEditorStore } from '../store/useEditorStore';
import { CanvasController } from '../components/FabricCanvas';

const FabricCanvas = dynamic(() => import('../components/FabricCanvas'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-screen text-neutral-500 bg-black">Loading Engine...</div>,
});

export default function Home() {
    const { activeTool, setCanvasController } = useEditorStore();

    const handleCanvasLoaded = (controller: CanvasController) => {
        setCanvasController(controller);
    };

    return (
        <main className="flex h-[100dvh] w-screen flex-col bg-black text-white font-sans overflow-hidden relative selection:bg-indigo-500/30">
            <div className="absolute top-6 left-6 z-30 pointer-events-none mix-blend-difference">
                <h1 className="font-bold text-xl tracking-tight text-white opacity-50">OpenDream</h1>
            </div>

            <SideToolbar />
            <ActionCenter />

            <div className="absolute inset-0 z-0">
                <FabricCanvas tool={activeTool} onLoaded={handleCanvasLoaded} />
            </div>
        </main>
    );
}
