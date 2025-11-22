import { create } from 'zustand';
import { CanvasController } from '../components/FabricCanvas';

interface EditorState {
    // UI State
    activeTool: 'select' | 'brush' | 'pan';
    prompt: string;
    isGenerating: boolean;
    reviewMode: boolean;

    // The connection to the Engine
    canvasController: CanvasController | null;

    // Actions
    setTool: (tool: 'select' | 'brush' | 'pan') => void;
    setPrompt: (prompt: string) => void;
    setIsGenerating: (isGenerating: boolean) => void;
    setReviewMode: (reviewMode: boolean) => void;
    setCanvasController: (controller: CanvasController | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    activeTool: 'select',
    prompt: '',
    isGenerating: false,
    reviewMode: false,
    canvasController: null,

    setTool: (tool) => set({ activeTool: tool }),
    setPrompt: (prompt) => set({ prompt }),
    setIsGenerating: (isGenerating) => set({ isGenerating }),
    setReviewMode: (reviewMode) => set({ reviewMode }),
    setCanvasController: (canvasController) => set({ canvasController }),
}));