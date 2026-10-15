import * as Comlink from "comlink";
import { loadConverter } from "@/converters/loader";
import type { ConvertInputFile, ConvertOutput } from "@/converters/types";

let currentController: AbortController | null = null;

export interface ConvertWorkerApi {
  run(
    slug: string,
    files: ConvertInputFile[],
    opts: Record<string, unknown>,
    onProgress: (ratio: number, label?: string) => void,
  ): Promise<ConvertOutput[]>;
  cancel(): void;
}

const api: ConvertWorkerApi = {
  async run(slug, files, opts, onProgress) {
    const converter = await loadConverter(slug);

    currentController = new AbortController();
    const { signal } = currentController;

    try {
      return await converter.run(
        { files },
        opts,
        {
          progress: (ratio, label) => onProgress(ratio, label),
          signal,
        },
      );
    } finally {
      currentController = null;
    }
  },
  cancel() {
    currentController?.abort();
  },
};

Comlink.expose(api);
