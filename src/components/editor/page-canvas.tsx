"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useEditorStore, makeId } from "@/lib/editor/store";
import { renderPageToCanvas } from "@/lib/editor/pdfjs";
import { screenBoxToPdfBox, type PageMetrics, type Rotation } from "@/lib/editor/coords";
import { loadEmbeddableImage } from "@/lib/editor/image-utils";
import type { EditorPage, ShapeKind } from "@/lib/editor/types";
import { ObjectView } from "./object-view";
import type { PDFDocumentProxy } from "pdfjs-dist";

interface PageCanvasProps {
  pdf: PDFDocumentProxy;
  page: EditorPage;
}

export function PageCanvas({ pdf, page }: PageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingClickRef = useRef<{ x: number; y: number } | null>(null);

  const zoom = useEditorStore((s) => s.zoom);
  const tool = useEditorStore((s) => s.tool);
  // Zustand'ın inline seçicisi her çağrıldığında .filter() yeni bir dizi
  // referansı döndürürse store "değişti" sanıp sonsuz render döngüsüne
  // girer (React hatası #185). Bunun yerine referansı kararlı olan ham
  // diziyi seçip filtrelemeyi useMemo'ya bırakıyoruz.
  const allObjects = useEditorStore((s) => s.objects);
  const objects = useMemo(
    () => allObjects.filter((o) => o.pageId === page.id),
    [allObjects, page.id],
  );
  const addObject = useEditorStore((s) => s.addObject);
  const selectObject = useEditorStore((s) => s.selectObject);

  const metrics: PageMetrics = {
    widthPt: page.widthPt,
    heightPt: page.heightPt,
    scale: zoom,
    rotation: page.rotation as Rotation,
  };

  const [dragBox, setDragBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!canvasRef.current || page.sourceIndex === null) return;
    renderPageToCanvas(
      pdf,
      page.sourceIndex + 1,
      canvasRef.current,
      zoom,
      page.rotation,
    );
  }, [pdf, page.sourceIndex, page.rotation, zoom]);

  function getRelativePoint(e: React.PointerEvent): { x: number; y: number } {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).dataset.pageSurface) {
      return;
    }
    const point = getRelativePoint(e);

    if (tool === "select") {
      selectObject(null);
      return;
    }

    if (tool === "text") {
      addObject({
        id: makeId("obj"),
        pageId: page.id,
        type: "text",
        text: "",
        fontSize: 16,
        color: "#0e1116",
        bold: false,
        ...screenBoxToPdfBox(point, { width: 160, height: 24 }, metrics),
      });
      return;
    }

    if (tool === "image") {
      pendingClickRef.current = point;
      fileInputRef.current?.click();
      return;
    }

    // rectangle / ellipse / line / highlight: sürükle-oluştur
    dragStart.current = point;
    setDragBox({ x: point.x, y: point.y, width: 0, height: 0 });

    function onMove(ev: PointerEvent) {
      if (!dragStart.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const current = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
      setDragBox({
        x: Math.min(dragStart.current.x, current.x),
        y: Math.min(dragStart.current.y, current.y),
        width: Math.abs(current.x - dragStart.current.x),
        height: Math.abs(current.y - dragStart.current.y),
      });
    }

    function onUp(ev: PointerEvent) {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (!dragStart.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const current = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
      const topLeft = {
        x: Math.min(dragStart.current.x, current.x),
        y: Math.min(dragStart.current.y, current.y),
      };
      const size = {
        width: Math.abs(current.x - dragStart.current.x),
        height: Math.abs(current.y - dragStart.current.y),
      };
      dragStart.current = null;
      setDragBox(null);
      if (size.width < 4 || size.height < 4) return;

      const box = screenBoxToPdfBox(topLeft, size, metrics);
      const isHighlight = tool === "highlight";
      const kind: ShapeKind = isHighlight ? "rectangle" : (tool as ShapeKind);
      addObject({
        id: makeId("obj"),
        pageId: page.id,
        type: "shape",
        kind,
        strokeColor: isHighlight ? "#ffb020" : "#0e1116",
        strokeWidth: isHighlight ? 0 : 2,
        fillColor: isHighlight ? "#ffeb3b" : null,
        fillOpacity: isHighlight ? 0.35 : 1,
        ...box,
      });
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  async function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    const point = pendingClickRef.current;
    pendingClickRef.current = null;
    if (!file || !point) return;

    const image = await loadEmbeddableImage(file);
    const displayWidthPx = 160;
    const displayHeightPx = (displayWidthPx * image.naturalHeight) / image.naturalWidth;
    const box = screenBoxToPdfBox(
      point,
      { width: displayWidthPx, height: displayHeightPx },
      metrics,
    );
    addObject({
      id: makeId("obj"),
      pageId: page.id,
      type: "image",
      previewUrl: image.previewUrl,
      bytes: image.bytes,
      mimeType: image.mimeType,
      ...box,
    });
  }

  const renderedWidth = (page.rotation === 90 || page.rotation === 270 ? page.heightPt : page.widthPt) * zoom;
  const renderedHeight = (page.rotation === 90 || page.rotation === 270 ? page.widthPt : page.heightPt) * zoom;

  return (
    <div
      ref={containerRef}
      data-page-surface
      className="relative mx-auto bg-white shadow-md"
      style={{ width: renderedWidth, height: renderedHeight, cursor: tool === "select" ? "default" : "crosshair" }}
      onPointerDown={handlePointerDown}
    >
      <canvas ref={canvasRef} data-page-surface className="pointer-events-none absolute inset-0" />
      {objects.map((object) => (
        <ObjectView key={object.id} object={object} metrics={metrics} />
      ))}
      {dragBox && (
        <div
          className="pointer-events-none absolute border-2 border-dashed border-primary bg-primary/10"
          style={{ left: dragBox.x, top: dragBox.y, width: dragBox.width, height: dragBox.height }}
        />
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleImageSelected}
      />
    </div>
  );
}
