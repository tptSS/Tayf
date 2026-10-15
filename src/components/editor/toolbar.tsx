"use client";

import {
  Circle,
  Download,
  Highlighter,
  ImagePlus,
  Minus,
  MousePointer2,
  Plus,
  Redo2,
  Square,
  Type,
  Undo2,
} from "lucide-react";
import { useEditorStore } from "@/lib/editor/store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { EditorTool } from "@/lib/editor/types";

const TOOLS: { tool: EditorTool; label: string; icon: typeof MousePointer2 }[] = [
  { tool: "select", label: "Seç", icon: MousePointer2 },
  { tool: "text", label: "Metin ekle", icon: Type },
  { tool: "image", label: "Görsel ekle", icon: ImagePlus },
  { tool: "rectangle", label: "Dikdörtgen", icon: Square },
  { tool: "ellipse", label: "Elips", icon: Circle },
  { tool: "line", label: "Çizgi", icon: Minus },
  { tool: "highlight", label: "Vurgula", icon: Highlighter },
];

interface ToolbarProps {
  onSave(): void;
  saving: boolean;
}

export function Toolbar({ onSave, saving }: ToolbarProps) {
  const tool = useEditorStore((s) => s.tool);
  const setTool = useEditorStore((s) => s.setTool);
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-card px-3 py-2">
      {TOOLS.map(({ tool: t, label, icon: Icon }) => (
        <Button
          key={t}
          type="button"
          size="icon"
          variant="ghost"
          aria-label={label}
          aria-pressed={tool === t}
          title={label}
          className={cn(tool === t && "bg-accent text-primary")}
          onClick={() => setTool(t)}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button type="button" size="icon" variant="ghost" aria-label="Geri al" title="Geri al (Ctrl+Z)" disabled={!canUndo} onClick={undo}>
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button type="button" size="icon" variant="ghost" aria-label="İleri al" title="İleri al (Ctrl+Shift+Z)" disabled={!canRedo} onClick={redo}>
        <Redo2 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button type="button" size="icon" variant="ghost" aria-label="Uzaklaştır" onClick={() => setZoom(zoom - 0.1)}>
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-12 text-center text-sm text-muted-foreground">
        {Math.round((zoom / 1.3) * 100)}%
      </span>
      <Button type="button" size="icon" variant="ghost" aria-label="Yakınlaştır" onClick={() => setZoom(zoom + 0.1)}>
        <Plus className="h-4 w-4" />
      </Button>

      <div className="ml-auto flex items-center gap-2">
        <p className="hidden text-xs text-muted-foreground sm:block">
          Metni düzenlemek için çift tıkla.
        </p>
        <Button type="button" onClick={onSave} disabled={saving}>
          <Download className="h-4 w-4" />
          {saving ? "Hazırlanıyor…" : "Kaydet ve indir"}
        </Button>
      </div>
    </div>
  );
}
