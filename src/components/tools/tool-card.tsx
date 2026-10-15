import Link from "next/link";
import type { ConverterSummary } from "@/converters/types";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_COLOR_CLASS, CATEGORY_LABELS } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function ToolCard({ converter }: { converter: ConverterSummary }) {
  return (
    <Link
      href={
        converter.slug === "pdf-duzenle" || converter.slug === "pdf-sayfa-duzenle"
          ? "/duzenle"
          : `/araclar/${converter.slug}`
      }
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold",
            CATEGORY_COLOR_CLASS[converter.category],
          )}
        >
          {CATEGORY_LABELS[converter.category].slice(0, 1)}
        </span>
        {converter.status === "soon" && <Badge variant="secondary">Yakında</Badge>}
      </div>
      <div>
        <h3 className="font-medium tracking-tight">{converter.title}</h3>
        <p className="text-sm text-muted-foreground">{converter.description}</p>
      </div>
    </Link>
  );
}
