"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import type { PageMetrics } from "@/lib/editor/coords";
import { pdfBoxToScreenBox, screenBoxToPdfBox } from "@/lib/editor/coords";
import type { EditorObject } from "@/lib/editor/types";
import { useEditorStore } from "@/lib/editor/store";
import { cn } from "@/lib/utils";

interface ObjectViewProps {
  object: EditorObject;
  metrics: PageMetrics;
}

export function ObjectView({ object, metrics }: ObjectViewProps) {
  const selectedId = useEditorStore((s) => s.selectedObjectId);
  const selectObject = useEditorStore((s) => s.selectObject);
  const updateObject = useEditorStore((s) => s.updateObject);
  const deleteObject = useEditorStore((s) => s.deleteObject);
  const tool = useEditorStore((s) => s.tool);

  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number } | null>(null);
  const [resizeOffset, setResizeOffset] = useState<{ dw: number; dh: number } | null>(null);
  const gestureStart = useRef<{ x: number; y: number } | null>(null);

  const isSelected = selectedId === object.id;

  const screenBox = pdfBoxToScreenBox(object, metrics);

  const left = screenBox.left + (dragOffset?.dx ?? 0);
  const top = screenBox.top + (dragOffset?.dy ?? 0);
  const width = Math.max(4, screenBox.width + (resizeOffset?.dw ?? 0));
  const height = Math.max(4, screenBox.height + (resizeOffset?.dh ?? 0));

  function commitBox(finalLeft: number, finalTop: number, finalWidth: number, finalHeight: number) {
    const box = screenBoxToPdfBox(
      { x: finalLeft, y: finalTop },
      { width: finalWidth, height: finalHeight },
      metrics,
    );
    updateObject(object.id, box);
  }

  function handleMoveStart(e: React.PointerEvent) {
    if (tool !== "select") return;
    e.stopPropagation();
    selectObject(object.id);
    gestureStart.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    function onMove(ev: PointerEvent) {
      if (!gestureStart.current) return;
      setDragOffset({
        dx: ev.clientX - gestureStart.current.x,
        dy: ev.clientY - gestureStart.current.y,
      });
    }
    function onUp(ev: PointerEvent) {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (gestureStart.current) {
        const dx = ev.clientX - gestureStart.current.x;
        const dy = ev.clientY - gestureStart.current.y;
        commitBox(screenBox.left + dx, screenBox.top + dy, screenBox.width, screenBox.height);
      }
      gestureStart.current = null;
      setDragOffset(null);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function handleResizeStart(e: React.PointerEvent) {
    e.stopPropagation();
    gestureStart.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    function onMove(ev: PointerEvent) {
      if (!gestureStart.current) return;
      setResizeOffset({
        dw: ev.clientX - gestureStart.current.x,
        dh: ev.clientY - gestureStart.current.y,
      });
    }
    function onUp(ev: PointerEvent) {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (gestureStart.current) {
        const dw = ev.clientX - gestureStart.current.x;
        const dh = ev.clientY - gestureStart.current.y;
        commitBox(
          screenBox.left,
          screenBox.top,
          Math.max(4, screenBox.width + dw),
          Math.max(4, screenBox.height + dh),
        );
      }
      gestureStart.current = null;
      setResizeOffset(null);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div
      className={cn(
        "absolute",
        tool === "select" && "cursor-move",
        isSelected && "outline outline-2 outline-primary",
      )}
      style={{ left, top, width, height }}
      onPointerDown={handleMoveStart}
      role="button"
      tabIndex={0}
      aria-label="Düzenleyici nesnesi"
    >
      {object.type === "text" && (
        <TextObjectBody object={object} isSelected={isSelected} />
      )}
      {object.type === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={object.previewUrl}
          alt=""
          className="h-full w-full select-none object-contain"
          draggable={false}
        />
      )}
      {object.type === "shape" && (
        <svg className="h-full w-full overflow-visible" preserveAspectRatio="none">
          {object.kind === "rectangle" && (
            <rect
              x={0}
              y={0}
              width="100%"
              height="100%"
              stroke={object.strokeColor}
              strokeWidth={object.strokeWidth}
              fill={object.fillColor ?? "none"}
              fillOpacity={object.fillOpacity}
            />
          )}
          {object.kind === "ellipse" && (
            <ellipse
              cx="50%"
              cy="50%"
              rx="50%"
              ry="50%"
              stroke={object.strokeColor}
              strokeWidth={object.strokeWidth}
              fill={object.fillColor ?? "none"}
              fillOpacity={object.fillOpacity}
            />
          )}
          {object.kind === "line" && (
            <line
              x1={0}
              y1={0}
              x2="100%"
              y2="100%"
              stroke={object.strokeColor}
              strokeWidth={object.strokeWidth}
            />
          )}
        </svg>
      )}

      {isSelected && tool === "select" && (
        <>
          <button
            type="button"
            aria-label="Nesneyi sil"
            className="absolute -right-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full bg-pdf text-ink shadow"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => deleteObject(object.id)}
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div
            role="presentation"
            className="absolute -bottom-1.5 -right-1.5 h-3 w-3 cursor-se-resize rounded-full border border-primary bg-background"
            onPointerDown={handleResizeStart}
          />
        </>
      )}
    </div>
  );
}

function TextObjectBody({
  object,
  isSelected,
}: {
  object: Extract<EditorObject, { type: "text" }>;
  isSelected: boolean;
}) {
  const updateObject = useEditorStore((s) => s.updateObject);
  const [editing, setEditing] = useState(false);

  if (isSelected && editing) {
    return (
      <textarea
        autoFocus
        className="h-full w-full resize-none bg-transparent outline-none"
        style={{
          fontSize: object.fontSize,
          color: object.color,
          fontWeight: object.bold ? 700 : 400,
          fontFamily: "var(--font-geist-sans), sans-serif",
        }}
        value={object.text}
        onChange={(e) => updateObject(object.id, { text: e.target.value })}
        onBlur={() => setEditing(false)}
        onPointerDown={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div
      className="h-full w-full whitespace-pre-wrap break-words"
      style={{
        fontSize: object.fontSize,
        color: object.color,
        fontWeight: object.bold ? 700 : 400,
        fontFamily: "var(--font-geist-sans), sans-serif",
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
    >
      {object.text || "Metin"}
    </div>
  );
}
