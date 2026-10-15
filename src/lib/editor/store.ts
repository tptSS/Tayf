import { create } from "zustand";
import type { EditorObject, EditorPage, EditorTool } from "./types";

interface Snapshot {
  pages: EditorPage[];
  objects: EditorObject[];
}

interface EditorState extends Snapshot {
  fileName: string | null;
  originalBytes: ArrayBuffer | null;
  currentPageId: string | null;
  selectedObjectId: string | null;
  tool: EditorTool;
  zoom: number;
  past: Snapshot[];
  future: Snapshot[];

  loadDocument(args: {
    fileName: string;
    bytes: ArrayBuffer;
    pages: EditorPage[];
  }): void;
  reset(): void;

  setTool(tool: EditorTool): void;
  setZoom(zoom: number): void;
  setCurrentPage(pageId: string): void;
  selectObject(id: string | null): void;

  addObject(object: EditorObject): void;
  updateObject(id: string, patch: Partial<EditorObject>): void;
  deleteObject(id: string): void;

  movePage(pageId: string, toIndex: number): void;
  rotatePage(pageId: string, deltaDegrees: number): void;
  deletePage(pageId: string): void;
  addBlankPage(afterPageId: string | null): void;

  undo(): void;
  redo(): void;
}

function snapshot(state: EditorState): Snapshot {
  return { pages: state.pages, objects: state.objects };
}

function pushHistory(
  state: EditorState,
  mutate: (snap: Snapshot) => Partial<Snapshot>,
): Partial<EditorState> {
  const patch = mutate(snapshot(state));
  return {
    past: [...state.past, snapshot(state)],
    future: [],
    ...patch,
  };
}

let idCounter = 0;
export function makeId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  fileName: null,
  originalBytes: null,
  pages: [],
  objects: [],
  currentPageId: null,
  selectedObjectId: null,
  tool: "select",
  zoom: 1.3,
  past: [],
  future: [],

  loadDocument({ fileName, bytes, pages }) {
    set({
      fileName,
      originalBytes: bytes,
      pages,
      objects: [],
      currentPageId: pages[0]?.id ?? null,
      selectedObjectId: null,
      tool: "select",
      zoom: 1.3,
      past: [],
      future: [],
    });
  },

  reset() {
    set({
      fileName: null,
      originalBytes: null,
      pages: [],
      objects: [],
      currentPageId: null,
      selectedObjectId: null,
      tool: "select",
      zoom: 1,
      past: [],
      future: [],
    });
  },

  setTool(tool) {
    set({ tool });
  },
  setZoom(zoom) {
    set({ zoom: Math.min(3, Math.max(0.25, zoom)) });
  },
  setCurrentPage(pageId) {
    set({ currentPageId: pageId });
  },
  selectObject(id) {
    set({ selectedObjectId: id });
  },

  addObject(object) {
    set((state) =>
      pushHistory(state, () => ({ objects: [...state.objects, object] })),
    );
    set({ selectedObjectId: object.id, tool: "select" });
  },

  updateObject(id, patch) {
    set((state) =>
      pushHistory(state, () => ({
        objects: state.objects.map((o) =>
          o.id === id ? ({ ...o, ...patch } as EditorObject) : o,
        ),
      })),
    );
  },

  deleteObject(id) {
    set((state) =>
      pushHistory(state, () => ({
        objects: state.objects.filter((o) => o.id !== id),
      })),
    );
    set({ selectedObjectId: null });
  },

  movePage(pageId, toIndex) {
    set((state) =>
      pushHistory(state, () => {
        const pages = [...state.pages];
        const fromIndex = pages.findIndex((p) => p.id === pageId);
        if (fromIndex === -1) return {};
        const [page] = pages.splice(fromIndex, 1);
        pages.splice(toIndex, 0, page);
        return { pages };
      }),
    );
  },

  rotatePage(pageId, deltaDegrees) {
    set((state) =>
      pushHistory(state, () => ({
        pages: state.pages.map((p) =>
          p.id === pageId
            ? { ...p, rotation: (p.rotation + deltaDegrees + 360) % 360 }
            : p,
        ),
      })),
    );
  },

  deletePage(pageId) {
    set((state) =>
      pushHistory(state, () => ({
        pages: state.pages.filter((p) => p.id !== pageId),
        objects: state.objects.filter((o) => o.pageId !== pageId),
      })),
    );
    const { pages, currentPageId } = get();
    if (currentPageId === pageId) {
      set({ currentPageId: pages[0]?.id ?? null });
    }
  },

  addBlankPage(afterPageId) {
    const newPage: EditorPage = {
      id: makeId("page"),
      sourceIndex: null,
      widthPt: 595.28,
      heightPt: 841.89,
      rotation: 0,
    };
    set((state) =>
      pushHistory(state, () => {
        const pages = [...state.pages];
        const insertAt = afterPageId
          ? pages.findIndex((p) => p.id === afterPageId) + 1
          : pages.length;
        pages.splice(insertAt, 0, newPage);
        return { pages };
      }),
    );
    set({ currentPageId: newPage.id });
  },

  undo() {
    const { past } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    set((state) => ({
      past: past.slice(0, -1),
      future: [snapshot(state), ...state.future],
      pages: previous.pages,
      objects: previous.objects,
      selectedObjectId: null,
    }));
  },

  redo() {
    const { future } = get();
    if (future.length === 0) return;
    const next = future[0];
    set((state) => ({
      future: future.slice(1),
      past: [...state.past, snapshot(state)],
      pages: next.pages,
      objects: next.objects,
      selectedObjectId: null,
    }));
  },
}));
