"use client";

import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { Brush, Eraser, Hand, Move, Undo, Redo, Download, Trash2 } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

const cn = (...inputs: Parameters<typeof clsx>) => twMerge(clsx(...inputs));

export default function SideToolbar() {
    const {
        activeTool,
        maskMode,
        setTool,
        setMaskMode,
        canUndo,
        canRedo,
        reviewMode,
        canvasController,
    } = useEditorStore();

    if (reviewMode) return null;

    const setMaskTool = (mode: 'paint' | 'erase') => {
        setTool('brush');
        setMaskMode(mode);
    };

    return (
        <div className="absolute top-4 right-4 z-40 flex flex-col gap-4 pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-1 bg-black/40 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-lg">
                <IconButton icon={<Undo size={20} />} onClick={() => canvasController?.undo()} disabled={!canUndo} />
                <IconButton icon={<Redo size={20} />} onClick={() => canvasController?.redo()} disabled={!canRedo} />
            </div>

            <div className="pointer-events-auto flex flex-col gap-2 bg-black/40 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-lg">
                <ToolButton
                    icon={<Move size={20} />}
                    label="Move"
                    active={activeTool === 'select'}
                    onClick={() => setTool('select')}
                />
                <ToolButton
                    icon={<Hand size={20} />}
                    label="Pan"
                    active={activeTool === 'pan'}
                    onClick={() => setTool('pan')}
                />
                <ToolButton
                    icon={<Brush size={20} />}
                    label="Mask"
                    active={activeTool === 'brush' && maskMode === 'paint'}
                    onClick={() => setMaskTool('paint')}
                    highlight
                />
                <ToolButton
                    icon={<Eraser size={20} />}
                    label="Erase"
                    active={activeTool === 'brush' && maskMode === 'erase'}
                    onClick={() => setMaskTool('erase')}
                />
                <div className="h-px w-full bg-white/10 my-1" />
                <IconButton
                    icon={<Trash2 size={20} />}
                    onClick={() => canvasController?.clearMask()}
                    title="Clear Mask"
                />
            </div>

            <div className="pointer-events-auto mt-2">
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

interface ToolButtonProps extends IconButtonProps {
    active?: boolean;
    highlight?: boolean;
    label: string;
}

function ToolButton({ icon, active, onClick, highlight, label }: ToolButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'relative p-2.5 rounded-xl transition-all duration-200 group active:scale-95 text-neutral-400 hover:text-white hover:bg-white/10',
                active &&
                    (highlight
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40'
                        : 'bg-white text-black shadow-lg'),
            )}
            aria-pressed={active}
            title={label}
        >
            {icon}
            <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {label}
            </span>
        </button>
    );
}
