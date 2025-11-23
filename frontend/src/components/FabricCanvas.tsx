"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useEditorStore } from '../store/useEditorStore';

export interface CanvasController {
    clearMask: () => void;
    getCanvasData: () => Promise<{ image: string; mask: string } | null>;
    setResultImage: (dataUrl: string) => Promise<void>;
    discardResult: () => void;
    commitResult: () => void; // Now handles clearing mask too
    toggleCompare: (showOriginal: boolean) => void;
    downloadCanvas: () => void;
    undo: () => void;
    redo: () => void;
}

interface FabricCanvasProps {
    tool: 'select' | 'brush' | 'pan';
    onLoaded: (controller: CanvasController) => void;
}

export default function FabricCanvas({ tool, onLoaded }: FabricCanvasProps) {
    const canvasEl = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasInstance = useRef<fabric.Canvas | null>(null);
    const baseImageRef = useRef<fabric.FabricImage | null>(null);
    const tempResultRef = useRef<fabric.FabricImage | null>(null);

    const history = useRef<string[]>([]);
    const historyIndex = useRef<number>(-1);
    const isHistoryLocked = useRef(false);

    const setHistoryState = useEditorStore((state) => state.setHistoryState);
    const [status, setStatus] = useState("Init");

    // --- HISTORY ENGINE ---
    const saveState = () => {
        if (isHistoryLocked.current || !canvasInstance.current) return;

        // Serialize
        const jsonObject = canvasInstance.current.toObject(['selectable', 'evented', 'id', 'type']);
        const jsonString = JSON.stringify(jsonObject);

        // Deduplication Check: Don't save if identical to last state
        if (historyIndex.current >= 0 && history.current[historyIndex.current] === jsonString) {
            return;
        }

        if (historyIndex.current < history.current.length - 1) {
            history.current = history.current.slice(0, historyIndex.current + 1);
        }

        history.current.push(jsonString);
        historyIndex.current++;

        if (history.current.length > 10) {
            history.current.shift();
            historyIndex.current--;
        }

        updateHistoryUI();
    };

    const updateHistoryUI = () => {
        const canUndo = historyIndex.current > 0;
        const canRedo = historyIndex.current < history.current.length - 1;
        setHistoryState(canUndo, canRedo);
    };

    const loadHistoryState = async (index: number) => {
        if (!canvasInstance.current) return;
        isHistoryLocked.current = true;

        try {
            const json = history.current[index];
            await canvasInstance.current.loadFromJSON(JSON.parse(json));
            canvasInstance.current.requestRenderAll();

            // Re-apply tool settings logic since JSON load wipes it
            applyToolSettings(tool);

            historyIndex.current = index;
            updateHistoryUI();
        } catch (e) {
            console.error("History Load Error:", e);
        } finally {
            isHistoryLocked.current = false;
        }
    };

    const applyToolSettings = (currentTool: string) => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        if (currentTool === 'brush') {
            canvas.isDrawingMode = true;
            canvas.selection = false;
            canvas.discardActiveObject();
            const brush = new fabric.PencilBrush(canvas);
            brush.color = 'rgba(255, 0, 0, 0.5)';
            brush.width = 30;
            canvas.freeDrawingBrush = brush;
            canvas.defaultCursor = 'crosshair';
            canvas.getObjects().forEach(o => { o.selectable = false; o.evented = false; });
        } else if (currentTool === 'pan') {
            canvas.isDrawingMode = false;
            canvas.selection = false;
            canvas.defaultCursor = 'grab';
            canvas.getObjects().forEach(o => { o.selectable = false; o.evented = false; });
        } else {
            canvas.isDrawingMode = false;
            canvas.selection = true;
            canvas.defaultCursor = 'default';
            canvas.getObjects().forEach(o => {
                if (o.type === 'image') { o.selectable = true; o.evented = true; }
                else { o.selectable = false; o.evented = false; }
            });
        }
        canvas.requestRenderAll();
    };

    // API Definition
    const api: CanvasController = {
        undo: () => {
            if (historyIndex.current > 0) loadHistoryState(historyIndex.current - 1);
        },
        redo: () => {
            if (historyIndex.current < history.current.length - 1) loadHistoryState(historyIndex.current + 1);
        },
        clearMask: () => {
            // This is now mostly for the eraser button
            if (!canvasInstance.current) return;
            const canvas = canvasInstance.current;
            canvas.getObjects().forEach(obj => {
                if (obj.type === 'path') canvas.remove(obj);
            });
            saveState();
            canvas.requestRenderAll();
        },
        getCanvasData: async () => {
            // ... same data extraction logic ...
            if (!canvasInstance.current) return null;
            const canvas = canvasInstance.current;
            const images = canvas.getObjects().filter(o => o.type === 'image');
            if (images.length === 0) return null;

            const strokes = canvas.getObjects().filter(o => o.type === 'path');
            strokes.forEach(s => s.visible = false);
            const imageBase64 = canvas.toDataURL({ format: 'png', multiplier: 1 });

            const allObjects = canvas.getObjects();
            allObjects.forEach(o => o.visible = false);
            strokes.forEach(s => { s.visible = true; s.set({stroke: 'white'}); });
            const originalBg = canvas.backgroundColor;
            canvas.backgroundColor = 'black';
            const maskBase64 = canvas.toDataURL({ format: 'png', multiplier: 1 });

            canvas.backgroundColor = originalBg;
            allObjects.forEach(o => o.visible = true);
            strokes.forEach(s => s.set({stroke: 'rgba(255,0,0,0.5)'}));
            canvas.requestRenderAll();
            return { image: imageBase64, mask: maskBase64 };
        },
        setResultImage: async (dataUrl: string) => {
            // ... same result loading logic ...
            if (!canvasInstance.current) return;
            const canvas = canvasInstance.current;
            try {
                const img = await fabric.FabricImage.fromURL(dataUrl);
                const canvasWidth = canvas.width!;
                img.scaleToWidth(canvasWidth);
                canvas.centerObject(img);
                img.selectable = false;
                img.evented = false;
                canvas.add(img);
                tempResultRef.current = img;
                canvas.requestRenderAll();
            } catch (e) { console.error(e); }
        },
        discardResult: () => {
            if (!canvasInstance.current || !tempResultRef.current) return;
            canvasInstance.current.remove(tempResultRef.current);
            tempResultRef.current = null;
            canvasInstance.current.requestRenderAll()
        },
        commitResult: () => {
            if (!canvasInstance.current || !tempResultRef.current) return;
            const canvas = canvasInstance.current;

            // 1. Lock History temporarily to batch operations
            isHistoryLocked.current = true;

            // 2. Finalize Image
            const img = tempResultRef.current;
            img.selectable = true;
            img.evented = true;
            tempResultRef.current = null;
            canvas.setActiveObject(img);

            // 3. Clear Mask (Paths) automatically
            canvas.getObjects().forEach(obj => {
                if (obj.type === 'path') canvas.remove(obj);
            });

            // 4. Unlock and Save ONCE
            isHistoryLocked.current = false;
            saveState(); // <--- SINGLE SAVE POINT

            canvas.requestRenderAll();
        },
        toggleCompare: (showOriginal: boolean) => {
            if (!canvasInstance.current || !tempResultRef.current) return;
            tempResultRef.current.visible = !showOriginal;
            canvasInstance.current.requestRenderAll();
        },
        downloadCanvas: () => {
            if (!canvasInstance.current) return;
            const link = document.createElement('a');
            link.download = `opendream-${Date.now()}.png`;
            link.href = canvasInstance.current.toDataURL({ format: 'png', multiplier: 2 });
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Init Logic
    useEffect(() => {
        if (!canvasEl.current || !containerRef.current || canvasInstance.current) return;
        const canvas = new fabric.Canvas(canvasEl.current, {
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
            backgroundColor: '#1e1e1e',
        });
        canvasInstance.current = canvas;
        if (onLoaded) onLoaded(api);

        // Events
        canvas.on('object:modified', saveState);
        canvas.on('path:created', saveState);

        const resizeObserver = new ResizeObserver(() => {
            if (!containerRef.current || !canvasInstance.current) return;
            canvasInstance.current.setDimensions({
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight,
            });
        });
        resizeObserver.observe(containerRef.current);

        // Zoom/Pan ... (Standard)
        canvas.on('mouse:wheel', function(opt) {
            const delta = opt.e.deltaY;
            let zoom = canvas.getZoom();
            zoom *= 0.999 ** delta;
            if (zoom > 5) zoom = 5;
            if (zoom < 0.1) zoom = 0.1;
            canvas.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });
        let isDragging = false;
        let lastPosX = 0;
        let lastPosY = 0;
        canvas.on('mouse:down', function(opt) {
            const evt = opt.e as unknown as MouseEvent;
            if (evt.altKey === true) {
                isDragging = true;
                canvas.isDrawingMode = false;
                lastPosX = evt.clientX;
                lastPosY = evt.clientY;
            }
        });
        canvas.on('mouse:move', function(opt) {
            if (isDragging) {
                const evt = opt.e as unknown as MouseEvent;
                const vpt = canvas.viewportTransform!;
                vpt[4] += evt.clientX - lastPosX;
                vpt[5] += evt.clientY - lastPosY;
                canvas.requestRenderAll();
                lastPosX = evt.clientX;
                lastPosY = evt.clientY;
            }
        });
        canvas.on('mouse:up', function() {
            if (isDragging) {
                canvas.setViewportTransform(canvas.viewportTransform!);
                isDragging = false;
            }
        });
        return () => {
            resizeObserver.disconnect();
            canvas.dispose();
            canvasInstance.current = null;
        };
    }, []);

    useEffect(() => { applyToolSettings(tool); }, [tool]);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!canvasInstance.current) return;
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = async (f) => {
                const data = f.target?.result as string;
                try {
                    canvasInstance.current!.clear();
                    canvasInstance.current!.backgroundColor = '#1e1e1e';
                    const img = await fabric.FabricImage.fromURL(data);
                    const canvasWidth = canvasInstance.current!.width!;
                    const canvasHeight = canvasInstance.current!.height!;
                    const scale = Math.min((canvasWidth * 0.8) / img.width!, (canvasHeight * 0.8) / img.height!);
                    img.scale(scale);
                    canvasInstance.current!.centerObject(img);
                    canvasInstance.current!.add(img);
                    history.current = [];
                    historyIndex.current = -1;
                    saveState(); // Initial State
                    canvasInstance.current!.setActiveObject(img);
                } catch (err) { console.error(err); }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative bg-neutral-900 overflow-hidden"
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
            <canvas ref={canvasEl} />
            <div className="absolute top-4 right-4 bg-black/70 text-green-400 font-mono text-xs p-2 rounded pointer-events-none select-none z-50">
                STATUS: {status}
            </div>
        </div>
    );
}