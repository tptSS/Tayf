"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { OptionField } from "@/converters/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OptionFieldControlProps {
  field: OptionField;
  value: unknown;
  onChange(value: unknown): void;
}

export function OptionFieldControl({
  field,
  value,
  onChange,
}: OptionFieldControlProps) {
  const id = `opt-${field.key}`;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      {field.type === "toggle" ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
          <Label htmlFor={id} className="cursor-pointer">
            {field.label}
          </Label>
          <Switch
            id={id}
            checked={Boolean(value)}
            onCheckedChange={onChange}
          />
        </div>
      ) : (
        <Label htmlFor={id}>{field.label}</Label>
      )}

      {field.type === "select" && (
        <Select value={String(value)} onValueChange={onChange}>
          <SelectTrigger id={id} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.type === "text" && (
        <Input
          id={id}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "password" && (
        <div className="relative">
          <Input
            id={id}
            type={showPassword ? "text" : "password"}
            value={String(value)}
            autoComplete="new-password"
            className="pr-10"
            onChange={(e) => onChange(e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3"
            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {field.type === "number" && (
        <Input
          id={id}
          type="number"
          value={Number(value)}
          min={field.min}
          max={field.max}
          step={field.step}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      )}

      {field.type === "range" && (
        <Input
          id={id}
          type="range"
          value={Number(value)}
          min={field.min}
          max={field.max}
          step={field.step}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      )}

      {field.help && (
        <p className="text-xs text-muted-foreground">{field.help}</p>
      )}
    </div>
  );
}

export function defaultOptionValues(
  fields: OptionField[] | undefined,
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of fields ?? []) {
    values[field.key] = field.defaultValue;
  }
  return values;
}
