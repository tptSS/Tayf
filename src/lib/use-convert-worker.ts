"use client";

import { useCallback, useRef } from "react";
import * as Comlink from "comlink";
import type { ConvertWorkerApi } from "@/workers/convert.worker";
import type { ConvertInputFile, ConvertOutput } from "@/converters/types";

type RemoteApi = Comlink.Remote<ConvertWorkerApi>;

export function useConvertWorker() {
  const workerRef = useRef<Worker | null>(null);
  const apiRef = useRef<RemoteApi | null>(null);

  const getApi = useCallback((): RemoteApi => {
    if (!apiRef.current) {
      const worker = new Worker(
        new URL("../workers/convert.worker.ts", import.meta.url),
      );
      workerRef.current = worker;
      apiRef.current = Comlink.wrap<ConvertWorkerApi>(worker);
    }
    return apiRef.current;
  }, []);

  const run = useCallback(
    async (
      slug: string,
      files: ConvertInputFile[],
      opts: Record<string, unknown>,
      onProgress: (ratio: number, label?: string) => void,
    ): Promise<ConvertOutput[]> => {
      const api = getApi();
      return api.run(slug, files, opts, Comlink.proxy(onProgress));
    },
    [getApi],
  );

  const cancel = useCallback(() => {
    apiRef.current?.cancel();
  }, []);

  const terminate = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    apiRef.current = null;
  }, []);

  return { run, cancel, terminate };
}
