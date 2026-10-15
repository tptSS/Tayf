import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ConverterSummary } from "@/converters/types";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_COLOR_CLASS, CATEGORY_ICON } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function ToolCard({ converter }: { converter: ConverterSummary }) {
  const Icon = CATEGORY_ICON[converter.category];

  return (
    <Link
      href={
        converter.slug === "pdf-duzenle" || converter.slug === "pdf-sayfa-duzenle"
          ? "/duzenle"
          : `/araclar/${converter.slug}`
      }
      className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-lg",
            CATEGORY_COLOR_CLASS[converter.category],
          )}
          aria-hidden
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
        {converter.status === "soon" && <Badge variant="secondary">Yakında</Badge>}
      </div>
      <div className="flex-1">
        <h3 className="font-medium tracking-tight">{converter.title}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{converter.description}</p>
      </div>
      <ArrowRight
        className="absolute bottom-4 right-4 h-4 w-4 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100 motion-reduce:transition-none"
        aria-hidden
      />
    </Link>
  );
}
