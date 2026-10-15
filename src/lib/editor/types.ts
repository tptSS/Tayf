export interface EditorPage {
  id: string;
  /** Orijinal belgedeki sayfa indeksi; yeni (boş) sayfalarda null. */
  sourceIndex: number | null;
  /** Döndürülmemiş (rotation=0) genişlik/yükseklik, pt cinsinden. */
  widthPt: number;
  heightPt: number;
  /** Nihai görüntüleme rotasyonu: 0 | 90 | 180 | 270. */
  rotation: number;
}

interface EditorObjectBase {
  id: string;
  pageId: string;
  /** Sol-alt köşe, PDF pt cinsinden (metin nesnelerinde taban çizgisi). */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextObject extends EditorObjectBase {
  type: "text";
  text: string;
  fontSize: number;
  color: string;
  bold: boolean;
}

export interface ImageObject extends EditorObjectBase {
  type: "image";
  previewUrl: string;
  bytes: ArrayBuffer;
  mimeType: "image/png" | "image/jpeg";
}

export type ShapeKind = "rectangle" | "ellipse" | "line";

export interface ShapeObject extends EditorObjectBase {
  type: "shape";
  kind: ShapeKind;
  strokeColor: string;
  fillColor: string | null;
  fillOpacity: number;
  strokeWidth: number;
}

export type EditorObject = TextObject | ImageObject | ShapeObject;

export type EditorTool =
  | "select"
  | "text"
  | "image"
  | "rectangle"
  | "ellipse"
  | "line"
  | "highlight";
