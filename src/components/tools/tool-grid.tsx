import type { ConverterSummary } from "@/converters/types";
import { ToolCard } from "./tool-card";

export function ToolGrid({ converters }: { converters: ConverterSummary[] }) {
  if (converters.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        Aramanla eşleşen bir araç bulamadım.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {converters.map((converter) => (
        <ToolCard key={converter.slug} converter={converter} />
      ))}
    </div>
  );
}
