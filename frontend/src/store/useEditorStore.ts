import { create } from 'zustand';
import { CanvasController } from '../components/FabricCanvas';

interface EditorState {
    activeTool: 'select' | 'brush' | 'pan';
    prompt: string;
    isGenerating: boolean;
    reviewMode: boolean;

    // History State
    canUndo: boolean;
    canRedo: boolean;

    canvasController: CanvasController | null;

    setTool: (tool: 'select' | 'brush' | 'pan') => void;
    setPrompt: (prompt: string) => void;
    setIsGenerating: (isGenerating: boolean) => void;
    setReviewMode: (reviewMode: boolean) => void;
    setHistoryState: (canUndo: boolean, canRedo: boolean) => void; // <--- NEW
    setCanvasController: (controller: CanvasController | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    activeTool: 'select',
    prompt: '',
    isGenerating: false,
    reviewMode: false,
    canUndo: false,
    canRedo: false,
    canvasController: null,

    setTool: (tool) => set({ activeTool: tool }),
    setPrompt: (prompt) => set({ prompt }),
    setIsGenerating: (isGenerating) => set({ isGenerating }),
    setReviewMode: (reviewMode) => set({ reviewMode }),
    setHistoryState: (canUndo, canRedo) => set({ canUndo, canRedo }),
    setCanvasController: (canvasController) => set({ canvasController }),
}));