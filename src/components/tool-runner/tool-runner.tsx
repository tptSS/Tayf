"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Download, X } from "lucide-react";
import { toast } from "sonner";
import type { ConverterSummary, ConvertOutput } from "@/converters/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useConvertWorker } from "@/lib/use-convert-worker";
import { downloadConvertOutputs, formatBytes } from "@/lib/download";
import { Dropzone } from "@/components/dropzone/dropzone";
import { takePendingFiles } from "@/lib/pending-file-store";
import {
  OptionFieldControl,
  defaultOptionValues,
} from "./option-field";

interface ToolRunnerProps {
  converter: ConverterSummary;
}

type Status = "idle" | "running" | "done" | "error";

export function ToolRunner({ converter }: ToolRunnerProps) {
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    // Ana sayfadan taşınan dosyayı (varsa) oturum içi geçici depodan al.
    const pending = takePendingFiles();
    if (pending && pending.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFiles(pending);
    }
  }, []);
  const [opts, setOpts] = useState<Record<string, unknown>>(() =>
    defaultOptionValues(converter.options),
  );
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState<string>();
  const [outputs, setOutputs] = useState<ConvertOutput[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { run, cancel, terminate } = useConvertWorker();

  useEffect(() => terminate, [terminate]);

  const totalInputBytes = useMemo(
    () => files.reduce((sum, f) => sum + f.size, 0),
    [files],
  );
  const totalOutputBytes = useMemo(() => {
    if (!outputs) return 0;
    return outputs.reduce((sum, o) => {
      const size = typeof o.data === "string" ? o.data.length : o.data.byteLength;
      return sum + size;
    }, 0);
  }, [outputs]);

  function addFiles(newFiles: File[]) {
    setOutputs(null);
    setStatus("idle");
    setFiles((prev) =>
      converter.multiple === "none" ? [newFiles[0]] : [...prev, ...newFiles],
    );
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function moveFile(index: number, direction: -1 | 1) {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleRun() {
    setStatus("running");
    setProgress(0);
    setErrorMessage(null);

    try {
      const inputFiles = await Promise.all(
        files.map(async (f) => ({ name: f.name, data: await f.arrayBuffer() })),
      );

      const result = await run(converter.slug, inputFiles, opts, (ratio, label) => {
        setProgress(ratio);
        setProgressLabel(label);
      });

      setOutputs(result);
      setStatus("done");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setStatus("idle");
        return;
      }
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Beklenmeyen bir hata oluştu. Dosyanı kontrol edip tekrar dene.",
      );
    }
  }

  function handleCancel() {
    cancel();
  }

  async function handleDownload() {
    if (!outputs) return;
    const zipName = `${converter.slug}-sonuc.zip`;
    await downloadConvertOutputs(outputs, zipName);
    toast.success("İndirildi.");
  }

  return (
    <div className="flex flex-col gap-6">
      <Dropzone
        onFiles={addFiles}
        accept={converter.accepts}
        multiple={converter.multiple !== "none"}
      />

      {files.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="Seçilen dosyalar">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {files.length > 1 && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Yukarı taşı"
                      disabled={index === 0}
                      onClick={() => moveFile(index, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Aşağı taşı"
                      disabled={index === files.length - 1}
                      onClick={() => moveFile(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Kaldır"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {converter.options && converter.options.length > 0 && (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
          {converter.options.map((field) => (
            <OptionFieldControl
              key={field.key}
              field={field}
              value={opts[field.key]}
              onChange={(value) =>
                setOpts((prev) => ({ ...prev, [field.key]: value }))
              }
            />
          ))}
        </div>
      )}

      {status === "running" ? (
        <div className="flex flex-col gap-3">
          <Progress value={progress * 100} aria-label="İşlem ilerliyor" />
          <p
            className="text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {progressLabel ?? "İşleniyor…"}
          </p>
          <Button type="button" variant="outline" onClick={handleCancel}>
            İptal et
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          disabled={files.length === 0}
          onClick={handleRun}
          className="self-start"
        >
          {converter.title}
        </Button>
      )}

      {status === "error" && errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-pdf/40 bg-pdf/10 px-4 py-3 text-sm text-foreground"
        >
          {errorMessage}
        </div>
      )}

      {status === "done" && outputs && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <p className="font-medium">Hazır.</p>
          <p className="text-sm text-muted-foreground">
            {formatBytes(totalInputBytes)} → {formatBytes(totalOutputBytes)}
          </p>
          <ul className="text-sm text-muted-foreground">
            {outputs.map((o) => (
              <li key={o.name}>{o.name}</li>
            ))}
          </ul>
          <Button type="button" onClick={handleDownload} className="self-start">
            <Download className="h-4 w-4" />
            İndir
          </Button>
        </div>
      )}
    </div>
  );
}
