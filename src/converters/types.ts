export type Category = "pdf" | "image" | "data" | "document";

export type Multiple = "none" | "batch" | "merge";

export interface OptionFieldBase {
  key: string;
  label: string;
  help?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export type OptionField =
  | (OptionFieldBase & {
      type: "select";
      options: SelectOption[];
      defaultValue: string;
    })
  | (OptionFieldBase & {
      type: "number";
      defaultValue: number;
      min?: number;
      max?: number;
      step?: number;
    })
  | (OptionFieldBase & { type: "text"; defaultValue: string })
  | (OptionFieldBase & { type: "password"; defaultValue: string })
  | (OptionFieldBase & { type: "toggle"; defaultValue: boolean })
  | (OptionFieldBase & {
      type: "range";
      defaultValue: number;
      min: number;
      max: number;
      step?: number;
    });

export interface ConvertInputFile {
  name: string;
  data: ArrayBuffer;
}

export interface ConvertInput {
  files: ConvertInputFile[];
}

export interface ConvertOutput {
  name: string;
  data: ArrayBuffer | string;
  mimeType: string;
}

export interface RunContext {
  progress(ratio: number, label?: string): void;
  signal: AbortSignal;
}

export interface Converter<O = Record<string, unknown>> {
  slug: string;
  title: string;
  description: string;
  category: Category;
  accepts: string[];
  output: string | ((opts: O) => string);
  multiple: Multiple;
  options?: OptionField[];
  keywords?: string[];
  /**
   * 'ready': çalışır durumda. 'soon': registry'de görünür ama sayfası
   * "yakında" durumunu gösterir, run çağrılamaz.
   */
  status: "ready" | "soon";
  run(input: ConvertInput, opts: O, ctx: RunContext): Promise<ConvertOutput[]>;
}

/**
 * registry.ts yalnızca bu hafif özeti tutar; `run` ve onun içindeki
 * dinamik kütüphane importları ana sayfa paketine girmez. Gerçek modül
 * (`run` dahil) yalnızca ilgili araç açıldığında ya da worker içinde
 * `converters/loader.ts` üzerinden dinamik olarak yüklenir.
 */
export type ConverterSummary<O = Record<string, unknown>> = Omit<
  Converter<O>,
  "run"
>;

