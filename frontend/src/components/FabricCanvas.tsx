"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

export interface CanvasController {
    clearMask: () => void;
    getCanvasData: () => Promise<{ image: string; mask: string } | null>;
    setResultImage: (dataUrl: string) => Promise<void>;
    discardResult: () => void;
    commitResult: () => void;
    toggleCompare: (showOriginal: boolean) => void;
    downloadCanvas: () => void;
}

interface FabricCanvasProps {
    tool: 'select' | 'brush' | 'pan';
    onLoaded: (controller: CanvasController) => void;
}

export default function FabricCanvas({ tool, onLoaded }: FabricCanvasProps) {
    const canvasEl = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasInstance = useRef<fabric.Canvas | null>(null);

    // References to key objects
    const baseImageRef = useRef<fabric.FabricImage | null>(null);
    const tempResultRef = useRef<fabric.FabricImage | null>(null);

    const [status, setStatus] = useState("Init");

    // API Definition
    const api: CanvasController = {
        clearMask: () => {
            if (!canvasInstance.current) return;
            const canvas = canvasInstance.current;
            canvas.getObjects().forEach(obj => {
                if (obj.type === 'path') canvas.remove(obj);
            });
            canvas.requestRenderAll();
        },
        getCanvasData: async () => {
            if (!canvasInstance.current || !baseImageRef.current) return null;
            const canvas = canvasInstance.current;

            const strokes = canvas.getObjects().filter(o => o.type === 'path');
            strokes.forEach(s => s.visible = false);
            const imageBase64 = canvas.toDataURL({ format: 'png', multiplier: 1 });

            baseImageRef.current.visible = false;
            strokes.forEach(s => { s.visible = true; s.set({stroke: 'white'}); });
            const originalBg = canvas.backgroundColor;
            canvas.backgroundColor = 'black';
            const maskBase64 = canvas.toDataURL({ format: 'png', multiplier: 1 });

            canvas.backgroundColor = originalBg;
            baseImageRef.current.visible = true;
            strokes.forEach(s => s.set({stroke: 'rgba(255,0,0,0.5)'}));
            canvas.requestRenderAll();

            return { image: imageBase64, mask: maskBase64 };
        },
        setResultImage: async (dataUrl: string) => {
            if (!canvasInstance.current) return;
            const canvas = canvasInstance.current;
            try {
                const img = await fabric.FabricImage.fromURL(dataUrl);
                const canvasWidth = canvas.width!;

                // Scale and position
                img.scaleToWidth(canvasWidth);
                canvas.centerObject(img);

                // Lock it for Review Mode
                img.selectable = false;
                img.evented = false;

                canvas.add(img);
                tempResultRef.current = img; // Track it
                canvas.requestRenderAll();
            } catch (e) { console.error(e); }
        },
        discardResult: () => {
            if (!canvasInstance.current || !tempResultRef.current) return;
            canvasInstance.current.remove(tempResultRef.current);
            tempResultRef.current = null;
            canvasInstance.current.requestRenderAll();
        },
        commitResult: () => {
            if (!canvasInstance.current || !tempResultRef.current) return;
            // Make it permanent and movable
            const img = tempResultRef.current;
            img.selectable = true;
            img.evented = true;

            // If we want to replace the base image, we could do:
            // baseImageRef.current = img;
            // But for layers, let's just leave it on top.

            tempResultRef.current = null; // No longer temporary
            canvasInstance.current.setActiveObject(img);
            canvasInstance.current.requestRenderAll();
        },
        toggleCompare: (showOriginal: boolean) => {
            if (!canvasInstance.current || !tempResultRef.current) return;
            // If showOriginal is true, we HIDE the result
            tempResultRef.current.visible = !showOriginal;
            canvasInstance.current.requestRenderAll();
        },
        downloadCanvas: () => {
            if (!canvasInstance.current) return;
            const link = document.createElement('a');
            link.download = `opendream-${Date.now()}.png`;
            link.href = canvasInstance.current.toDataURL({ format: 'png', multiplier: 2 }); // High Quality
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Init Logic (Standard)
    useEffect(() => {
        if (!canvasEl.current || !containerRef.current || canvasInstance.current) return;

        const canvas = new fabric.Canvas(canvasEl.current, {
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
            backgroundColor: '#1e1e1e',
        });
        canvasInstance.current = canvas;
        if (onLoaded) onLoaded(api);

        // Resize
        const resizeObserver = new ResizeObserver(() => {
            if (!containerRef.current || !canvasInstance.current) return;
            canvasInstance.current.setDimensions({
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight,
            });
        });
        resizeObserver.observe(containerRef.current);

        // Zoom
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

        // Pan
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

    // Tool Logic (Standard)
    useEffect(() => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        setStatus(tool.toUpperCase());

        if (tool === 'brush') {
            canvas.isDrawingMode = true;
            canvas.selection = false;
            canvas.discardActiveObject();
            const brush = new fabric.PencilBrush(canvas);
            brush.color = 'rgba(255, 0, 0, 0.5)';
            brush.width = 30;
            canvas.freeDrawingBrush = brush;
            canvas.defaultCursor = 'crosshair';
            canvas.getObjects().forEach(obj => { obj.selectable = false; obj.evented = false; });
        }
        else if (tool === 'pan') {
            canvas.isDrawingMode = false;
            canvas.selection = false;
            canvas.defaultCursor = 'grab';
            canvas.getObjects().forEach(obj => { obj.selectable = false; obj.evented = false; });
        }
        else {
            canvas.isDrawingMode = false;
            canvas.selection = true;
            canvas.defaultCursor = 'default';
            canvas.getObjects().forEach(obj => {
                if (obj.type === 'image') {
                    // If we are in review mode (tempResult exists), we might want to keep things locked?
                    // But the parent controls the 'tool', so we assume if tool=select, we want interaction.
                    // The tempResult logic in setSelectable handles its own locking.
                    obj.selectable = true;
                    obj.evented = true;
                } else {
                    obj.selectable = false; obj.evented = false;
                }
            });
        }
        canvas.requestRenderAll();
    }, [tool]);

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
                    baseImageRef.current = img;
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