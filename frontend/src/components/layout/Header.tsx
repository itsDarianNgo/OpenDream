"use client";

import { Download } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

export default function Header() {
    const { canvasController } = useEditorStore();

    return (
        <header className="absolute top-0 left-0 right-0 h-16 z-30 flex items-center justify-between px-4 pointer-events-none">
            {/* Logo */}
            <div className="pointer-events-auto bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/5">
                <h1 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 select-none">
                    OpenDream
                </h1>
            </div>

            {/* Export Button */}
            <button
                onClick={() => canvasController?.downloadCanvas()}
                className="pointer-events-auto p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
                title="Export"
            >
                <Download size={20}/>
            </button>
        </header>
    );
}