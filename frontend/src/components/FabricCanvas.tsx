"use client";

import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric'; // <--- FIXED IMPORT

interface FabricCanvasProps {
    onCanvasReady: (canvas: fabric.Canvas) => void;
}

export default function FabricCanvas({ onCanvasReady }: FabricCanvasProps) {
    const canvasEl = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasInstance = useRef<fabric.Canvas | null>(null);

    useEffect(() => {
        if (!canvasEl.current || !containerRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const canvas = new fabric.Canvas(canvasEl.current, {
            width: width,
            height: height,
            backgroundColor: '#262626',
            selection: true,
        });

        canvasInstance.current = canvas;
        onCanvasReady(canvas);

        // ... rest of the file remains the same ...

        // (ResizeObserver, Zoom, Pan logic, Drop logic...)
        // I will not reprint the whole logic block to save space,
        // but ensure you keep the logic from Response #8!

        const resizeObserver = new ResizeObserver(() => {
            if (!containerRef.current || !canvasInstance.current) return;
            const newWidth = containerRef.current.clientWidth;
            const newHeight = containerRef.current.clientHeight;

            canvasInstance.current.setDimensions({
                width: newWidth,
                height: newHeight,
            });
            canvasInstance.current.renderAll();
        });
        resizeObserver.observe(containerRef.current);

        // Copy the Zoom/Pan/Drop logic from the previous response here.

        // ...

        canvas.on('mouse:wheel', function(opt) {
            const delta = opt.e.deltaY;
            let zoom = canvas.getZoom();
            zoom *= 0.999 ** delta;
            if (zoom > 5) zoom = 5;
            if (zoom < 0.1) zoom = 0.1;
            canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });

        // ...

        return () => {
            resizeObserver.disconnect();
            canvas.dispose();
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full relative bg-neutral-800 overflow-hidden">
            <canvas ref={canvasEl} />
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur text-white/70 text-xs px-3 py-1.5 rounded-full pointer-events-none select-none">
                Alt + Drag to Pan • Scroll to Zoom
            </div>
        </div>
    );
}