import { Database, FileStack, FileText, ImageIcon, type LucideIcon } from "lucide-react";
import type { Category } from "@/converters/types";

export const CATEGORY_LABELS: Record<Category, string> = {
  pdf: "PDF",
  image: "Görsel",
  data: "Veri",
  document: "Belge",
};

export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  pdf: FileText,
  image: ImageIcon,
  data: Database,
  document: FileStack,
};

// Kategori zemin rengi + üzerinde her zaman koyu "ink" metin (WCAG AA).
export const CATEGORY_COLOR_CLASS: Record<Category, string> = {
  pdf: "bg-pdf text-ink",
  image: "bg-image text-ink",
  data: "bg-data text-ink",
  document: "bg-document text-ink",
};

export const CATEGORIES: Category[] = ["pdf", "image", "data", "document"];
