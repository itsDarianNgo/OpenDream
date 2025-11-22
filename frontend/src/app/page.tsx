"use client";

import dynamic from 'next/dynamic';
import Header from '../components/layout/Header';
import BottomControls from '../components/layout/BottomControls';
import { useEditorStore } from '../store/useEditorStore';
import { CanvasController } from '../components/FabricCanvas';

// Dynamic Canvas Import
const FabricCanvas = dynamic(() => import('../components/FabricCanvas'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-screen text-neutral-500 bg-black">Loading Engine...</div>
});

export default function Home() {
    const { activeTool, setCanvasController } = useEditorStore();

    const handleCanvasLoaded = (controller: CanvasController) => {
        console.log("✅ Canvas Engine Connected to Store");
        setCanvasController(controller);
    };

    return (
        <main className="flex h-[100dvh] w-screen flex-col bg-black text-white font-sans overflow-hidden relative">
            <Header />

            <div className="absolute inset-0 z-0">
                <FabricCanvas tool={activeTool} onLoaded={handleCanvasLoaded} />
            </div>

            <BottomControls />
        </main>
    );
}