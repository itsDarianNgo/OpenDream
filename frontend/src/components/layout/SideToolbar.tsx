"use client";

import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { Undo, Redo, Download, Trash2, Image } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

const cn = (...inputs: Parameters<typeof clsx>) => twMerge(clsx(...inputs));

export default function SideToolbar() {
    const {
        isEditing,
        canUndo,
        canRedo,
        reviewMode,
        canvasController,
    } = useEditorStore();

    if (reviewMode) return null;

    const triggerPhotoPicker = () => {
        const input = document.getElementById('canvas-photo-input') as HTMLInputElement | null;
        if (!input) return;
        input.click();
    };

    return (
        <div className="absolute top-4 right-4 z-40 flex flex-col gap-4 pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-1 bg-black/40 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-lg">
                <IconButton icon={<Undo size={20} />} onClick={() => canvasController?.undo()} disabled={!canUndo} />
                <IconButton icon={<Redo size={20} />} onClick={() => canvasController?.redo()} disabled={!canRedo} />
            </div>

            <div className="pointer-events-auto flex flex-col gap-2 bg-black/40 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-lg">
                <IconButton
                    icon={<Trash2 size={20} />}
                    onClick={() => canvasController?.clearMask()}
                    title="Clear Mask"
                    disabled={!isEditing}
                />
            </div>

            <div className="pointer-events-auto mt-2 flex gap-2">
                <button
                    onClick={triggerPhotoPicker}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg border border-white/10 hover:bg-indigo-400 transition-colors"
                    title="Add Photo"
                >
                    <Image size={18} />
                </button>
                <button
                    onClick={() => canvasController?.downloadCanvas()}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-800 text-white shadow-lg border border-white/10 hover:bg-white/10 transition-colors"
                    title="Download"
                >
                    <Download size={18} />
                </button>
            </div>
        </div>
    );
}

interface IconButtonProps {
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    title?: string;
}

function IconButton({ icon, onClick, disabled, title }: IconButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                'p-2.5 rounded-xl transition-all active:scale-90 text-white hover:bg-white/10',
                disabled && 'text-white/20 hover:bg-transparent cursor-not-allowed'
            )}
        >
            {icon}
        </button>
    );
}
