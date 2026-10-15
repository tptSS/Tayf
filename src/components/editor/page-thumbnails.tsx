"use client";

import { useEffect, useRef, useState } from "react";
import { FilePlus, RotateCw, Trash2 } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useEditorStore } from "@/lib/editor/store";
import { renderPageToCanvas } from "@/lib/editor/pdfjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EditorPage } from "@/lib/editor/types";

export function PageThumbnails({ pdf }: { pdf: PDFDocumentProxy }) {
  const pages = useEditorStore((s) => s.pages);
  const currentPageId = useEditorStore((s) => s.currentPageId);
  const setCurrentPage = useEditorStore((s) => s.setCurrentPage);
  const movePage = useEditorStore((s) => s.movePage);
  const addBlankPage = useEditorStore((s) => s.addBlankPage);

  const [dragIndex, setDragIndex] = useState<number | null>(null);

  return (
    <div className="flex w-40 shrink-0 flex-col gap-2 overflow-y-auto border-r border-border p-2">
      {pages.map((page, index) => (
        <div
          key={page.id}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragIndex !== null && dragIndex !== index) {
              movePage(pages[dragIndex].id, index);
            }
            setDragIndex(null);
          }}
        >
          <ThumbnailCard
            pdf={pdf}
            page={page}
            index={index}
            isActive={page.id === currentPageId}
            onClick={() => setCurrentPage(page.id)}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => addBlankPage(currentPageId)}
      >
        <FilePlus className="h-4 w-4" />
        Sayfa ekle
      </Button>
    </div>
  );
}

function ThumbnailCard({
  pdf,
  page,
  index,
  isActive,
  onClick,
}: {
  pdf: PDFDocumentProxy;
  page: EditorPage;
  index: number;
  isActive: boolean;
  onClick(): void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotatePage = useEditorStore((s) => s.rotatePage);
  const deletePage = useEditorStore((s) => s.deletePage);
  const pageCount = useEditorStore((s) => s.pages.length);

  useEffect(() => {
    if (!canvasRef.current || page.sourceIndex === null) return;
    const targetWidth = 128;
    const naturalWidth =
      page.rotation === 90 || page.rotation === 270 ? page.heightPt : page.widthPt;
    const scale = targetWidth / naturalWidth;
    renderPageToCanvas(pdf, page.sourceIndex + 1, canvasRef.current, scale, page.rotation);
  }, [pdf, page.sourceIndex, page.rotation, page.widthPt, page.heightPt]);

  return (
    <div
      className={cn(
        "group flex cursor-pointer flex-col gap-1 rounded-lg border p-1.5",
        isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-center overflow-hidden rounded bg-muted">
        {page.sourceIndex === null ? (
          <div className="flex h-32 w-full items-center justify-center text-xs text-muted-foreground">
            Boş sayfa
          </div>
        ) : (
          <canvas ref={canvasRef} className="max-h-32 w-full object-contain" />
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{index + 1}</span>
        <div className="flex opacity-0 group-hover:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label="Sayfayı döndür"
            onClick={(e) => {
              e.stopPropagation();
              rotatePage(page.id, 90);
            }}
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label="Sayfayı sil"
            disabled={pageCount <= 1}
            onClick={(e) => {
              e.stopPropagation();
              deletePage(page.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
