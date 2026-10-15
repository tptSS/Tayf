"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  onFiles(files: File[]): void;
  accept?: string[];
  multiple?: boolean;
  className?: string;
  label?: string;
  hint?: string;
}

export function Dropzone({
  onFiles,
  accept,
  multiple = true,
  className,
  label = "Dosyanı buraya bırak ya da seç",
  hint = "Dosyaların cihazından çıkmaz.",
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const handleFiles = useCallback(
    (fileList: FileList | File[] | null) => {
      if (!fileList) return;
      const files = Array.from(fileList);
      if (files.length > 0) onFiles(files);
    },
    [onFiles],
  );

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const files = event.clipboardData?.files;
      if (files && files.length > 0) handleFiles(files);
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFiles]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-describedby={`${inputId}-hint`}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer",
        "border-border bg-card hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        isDragging && "border-primary bg-primary/5",
        className,
      )}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
    >
      <UploadCloud className="h-10 w-10 text-muted-foreground" aria-hidden />
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p id={`${inputId}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        multiple={multiple}
        accept={accept?.join(",")}
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  );
}
