"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/dropzone/dropzone";
import { ToolGrid } from "@/components/tools/tool-grid";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";
import { searchConverters, getConvertersForFile } from "@/converters/registry";
import type { Category, ConverterSummary } from "@/converters/types";
import { detectFileType } from "@/lib/detect";
import { setPendingFiles } from "@/lib/pending-file-store";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "tumu">("tumu");
  const [suggestion, setSuggestion] = useState<{
    files: File[];
    matches: ConverterSummary[];
  } | null>(null);

  const results = useMemo(() => {
    const base = searchConverters(query);
    if (category === "tumu") return base;
    return base.filter((c) => c.category === category);
  }, [query, category]);

  async function handleFiles(files: File[]) {
    const first = files[0];
    const { extension, mimeType } = await detectFileType(first);
    const matches = getConvertersForFile(mimeType, extension);
    setSuggestion({ files, matches });
  }

  function openTool(slug: string, files: File[]) {
    setPendingFiles(files);
    router.push(`/araclar/${slug}`);
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10">
      <section className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Dosyan, istediğin biçimde.
        </h1>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-data" aria-hidden />
          Dosyaların cihazından çıkmaz. Her şey tarayıcında işlenir.
        </p>

        <div className="w-full max-w-xl">
          <Dropzone onFiles={handleFiles} />
        </div>

        {suggestion && (
          <div className="w-full max-w-xl rounded-xl border border-border bg-card p-4 text-left">
            <p className="mb-3 text-sm font-medium">
              {suggestion.files.length} dosya için önerilen araçlar:
            </p>
            {suggestion.matches.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Bu dosya türü için henüz uygun bir araç yok.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {suggestion.matches.map((m) => (
                  <li key={m.slug}>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full justify-start"
                      disabled={m.status === "soon"}
                      onClick={() => openTool(m.slug, suggestion.files)}
                    >
                      {m.title}
                      {m.status === "soon" && " (yakında)"}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder="Araç ara… (örn. birleştir, excel, sql)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:max-w-xs"
            aria-label="Araç ara"
          />
          <div className="flex flex-wrap gap-2">
            <CategoryChip
              active={category === "tumu"}
              onClick={() => setCategory("tumu")}
            >
              Tümü
            </CategoryChip>
            {CATEGORIES.map((c) => (
              <CategoryChip
                key={c}
                active={category === c}
                onClick={() => setCategory(c)}
              >
                {CATEGORY_LABELS[c]}
              </CategoryChip>
            ))}
          </div>
        </div>

        <ToolGrid converters={results} />
      </section>
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick(): void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/50",
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
