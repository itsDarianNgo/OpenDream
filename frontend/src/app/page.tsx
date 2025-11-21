"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { MousePointer2, Hand, Wand2 } from 'lucide-react';

const FabricCanvas = dynamic(() => import('../components/FabricCanvas'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-neutral-500">Loading Engine...</div>
});

export default function Home() {
    const [tool, setTool] = useState<string>('select');

    const handleCanvasReady = (canvas: any) => {
        console.log("Canvas Ready");
    };

    return (
        // 1. FORCE SCREEN HEIGHT: h-screen ensures it takes 100% of the window.
        <main className="flex h-screen w-screen flex-col bg-black overflow-hidden">

            {/* Header: Fixed height (h-14) and non-shrinking (shrink-0) */}
            <div className="h-14 w-full shrink-0 border-b border-neutral-800 bg-neutral-900 flex items-center justify-between px-4 z-10">
                <div className="flex items-center gap-4">
                    <h1 className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                        OpenDream
                    </h1>

                    {/* Toolbar */}
                    <div className="flex bg-black/50 p-1 rounded-md gap-1 border border-neutral-700">
                        <button
                            onClick={() => setTool('select')}
                            className={`p-1.5 rounded ${tool === 'select' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}
                        >
                            <MousePointer2 size={16} />
                        </button>
                        <button
                            onClick={() => setTool('pan')}
                            className={`p-1.5 rounded ${tool === 'pan' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}
                        >
                            <Hand size={16} />
                        </button>
                        <div className="w-px bg-neutral-700 mx-0.5"></div>
                        <button
                            onClick={() => setTool('magic')}
                            className={`p-1.5 rounded ${tool === 'magic' ? 'bg-neutral-700 text-purple-400' : 'text-neutral-400 hover:text-white'}`}
                        >
                            <Wand2 size={16} />
                        </button>
                    </div>
                </div>

                <div className="text-xs text-neutral-600 font-mono">
                    v0.1.0
                </div>
            </div>

            {/* Workspace: flex-1 takes ALL remaining space. min-h-0 prevents flex bugs. */}
            <div className="flex-1 relative w-full min-h-0 bg-neutral-800">
                <FabricCanvas onCanvasReady={handleCanvasReady} />
            </div>
        </main>
    );
}