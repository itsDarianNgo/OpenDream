import { create } from 'zustand';
import { CanvasController } from '../components/FabricCanvas';

interface EditorState {
    isEditing: boolean;
    maskMode: 'paint' | 'erase';
    prompt: string;
    isGenerating: boolean;
    reviewMode: boolean;

    // History State
    canUndo: boolean;
    canRedo: boolean;

    canvasController: CanvasController | null;

    setIsEditing: (isEditing: boolean) => void;
    setMaskMode: (mode: 'paint' | 'erase') => void;
    setPrompt: (prompt: string) => void;
    setIsGenerating: (isGenerating: boolean) => void;
    setReviewMode: (reviewMode: boolean) => void;
    setHistoryState: (canUndo: boolean, canRedo: boolean) => void; // <--- NEW
    setCanvasController: (controller: CanvasController | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    isEditing: false,
    maskMode: 'paint',
    prompt: '',
    isGenerating: false,
    reviewMode: false,
    canUndo: false,
    canRedo: false,
    canvasController: null,

    setIsEditing: (isEditing) => set({ isEditing }),
    setMaskMode: (maskMode) => set({ maskMode }),
    setPrompt: (prompt) => set({ prompt }),
    setIsGenerating: (isGenerating) => set({ isGenerating }),
    setReviewMode: (reviewMode) => set({ reviewMode }),
    setHistoryState: (canUndo, canRedo) => set({ canUndo, canRedo }),
    setCanvasController: (canvasController) => set({ canvasController }),
}));