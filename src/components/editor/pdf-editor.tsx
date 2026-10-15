"use client";

import { useEffect, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { toast } from "sonner";
import { useEditorStore } from "@/lib/editor/store";
import { loadPdfDocument } from "@/lib/editor/pdfjs";
import { exportEditedPdf } from "@/lib/editor/export-pdf";
import { triggerDownload } from "@/lib/download";
import { Toolbar } from "./toolbar";
import { PageThumbnails } from "./page-thumbnails";
import { PageCanvas } from "./page-canvas";
import { PropertiesPanel } from "./properties-panel";

export function PdfEditor() {
  const fileName = useEditorStore((s) => s.fileName);
  const originalBytes = useEditorStore((s) => s.originalBytes);
  const pages = useEditorStore((s) => s.pages);
  const currentPageId = useEditorStore((s) => s.currentPageId);
  const objects = useEditorStore((s) => s.objects);
  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const deleteObject = useEditorStore((s) => s.deleteObject);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!originalBytes) return;
    let cancelled = false;
    loadPdfDocument(originalBytes).then((doc) => {
      if (!cancelled) setPdf(doc);
    });
    return () => {
      cancelled = true;
    };
  }, [originalBytes]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedObjectId) {
        e.preventDefault();
        deleteObject(selectedObjectId);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo, deleteObject, selectedObjectId]);

  async function handleSave() {
    if (!originalBytes || !fileName) return;
    setSaving(true);
    try {
      const bytes = await exportEditedPdf(originalBytes, pages, objects);
      const outName = fileName.replace(/\.pdf$/i, "") + "-duzenlendi.pdf";
      triggerDownload(
        new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
        outName,
      );
      toast.success("İndirildi.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Kaydedilemedi. Dosyanı kontrol edip tekrar dene.",
      );
    } finally {
      setSaving(false);
    }
  }

  const currentPage = pages.find((p) => p.id === currentPageId);

  if (!pdf || !currentPage) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground">
        Yükleniyor…
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <Toolbar onSave={handleSave} saving={saving} />
      <div className="flex flex-1 overflow-hidden">
        <PageThumbnails pdf={pdf} />
        <div className="flex-1 overflow-auto bg-muted p-8">
          <PageCanvas pdf={pdf} page={currentPage} />
        </div>
        <PropertiesPanel />
      </div>
    </div>
  );
}
