"use client";

import { useEditorStore } from "@/lib/editor/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export function PropertiesPanel() {
  const selectedId = useEditorStore((s) => s.selectedObjectId);
  const object = useEditorStore((s) => s.objects.find((o) => o.id === s.selectedObjectId));
  const updateObject = useEditorStore((s) => s.updateObject);

  if (!selectedId || !object) {
    return (
      <div className="w-56 shrink-0 border-l border-border p-4 text-sm text-muted-foreground">
        Bir nesne seç.
      </div>
    );
  }

  return (
    <div className="flex w-56 shrink-0 flex-col gap-4 border-l border-border p-4">
      {object.type === "text" && (
        <>
          <Field label="Yazı boyutu">
            <Input
              type="number"
              min={6}
              max={200}
              value={object.fontSize}
              onChange={(e) => updateObject(object.id, { fontSize: Number(e.target.value) })}
            />
          </Field>
          <Field label="Renk">
            <Input
              type="color"
              value={object.color}
              onChange={(e) => updateObject(object.id, { color: e.target.value })}
              className="h-9 p-1"
            />
          </Field>
          <div className="flex items-center justify-between">
            <Label htmlFor="bold-toggle">Kalın</Label>
            <Switch
              id="bold-toggle"
              checked={object.bold}
              onCheckedChange={(bold) => updateObject(object.id, { bold })}
            />
          </div>
        </>
      )}

      {object.type === "shape" && (
        <>
          <Field label="Çizgi rengi">
            <Input
              type="color"
              value={object.strokeColor}
              onChange={(e) => updateObject(object.id, { strokeColor: e.target.value })}
              className="h-9 p-1"
            />
          </Field>
          <Field label="Çizgi kalınlığı">
            <Input
              type="number"
              min={0}
              max={20}
              value={object.strokeWidth}
              onChange={(e) => updateObject(object.id, { strokeWidth: Number(e.target.value) })}
            />
          </Field>
          {object.kind !== "line" && (
            <>
              <div className="flex items-center justify-between">
                <Label htmlFor="fill-toggle">Dolgu</Label>
                <Switch
                  id="fill-toggle"
                  checked={object.fillColor !== null}
                  onCheckedChange={(checked) =>
                    updateObject(object.id, { fillColor: checked ? "#3d7bff" : null })
                  }
                />
              </div>
              {object.fillColor && (
                <Field label="Dolgu rengi">
                  <Input
                    type="color"
                    value={object.fillColor}
                    onChange={(e) => updateObject(object.id, { fillColor: e.target.value })}
                    className="h-9 p-1"
                  />
                </Field>
              )}
            </>
          )}
        </>
      )}

      {object.type === "image" && (
        <p className="text-sm text-muted-foreground">
          Taşımak için sürükle, boyutlandırmak için sağ-alt köşeyi kullan.
        </p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
