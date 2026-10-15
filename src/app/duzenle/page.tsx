"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useEditorStore } from "@/lib/editor/store";
import { buildPagesFromPdf } from "@/lib/editor/load-document";
import { takePendingFiles } from "@/lib/pending-file-store";
import { Dropzone } from "@/components/dropzone/dropzone";
import { PdfEditor } from "@/components/editor/pdf-editor";

export default function DuzenlePage() {
  const fileName = useEditorStore((s) => s.fileName);
  const loadDocument = useEditorStore((s) => s.loadDocument);
  const [error, setError] = useState<string | null>(null);

  async function openFile(file: File) {
    setError(null);
    try {
      const bytes = await file.arrayBuffer();
      const pages = await buildPagesFromPdf(bytes.slice(0));
      loadDocument({ fileName: file.name, bytes, pages });
    } catch {
      setError("Bu PDF açılamadı. Dosyanın bozuk ya da şifreli olmadığından emin ol.");
    }
  }

  useEffect(() => {
    // Ana sayfadan taşınan PDF'i (varsa) oturum içi geçici depodan al.
    const pending = takePendingFiles();
    const file = pending?.[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (file) void openFile(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (fileName) {
    return <PdfEditor />;
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">PDF düzenleyici</h1>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-data" aria-hidden />
        Dosyan cihazından çıkmaz.
      </p>
      <div className="w-full">
        <Dropzone
          multiple={false}
          accept={["application/pdf", ".pdf"]}
          onFiles={(files) => void openFile(files[0])}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-pdf">
          {error}
        </p>
      )}
    </div>
  );
}
