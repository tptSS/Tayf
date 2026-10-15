import type { Converter } from "../types";
import { run, type GorselPdfOptions } from "./gorsel-pdf";

const pngPdfConverter: Converter<GorselPdfOptions> = {
  slug: "png-pdf",
  title: "PNG'den PDF oluştur",
  description: "PNG görsellerden PDF oluştur.",
  category: "pdf",
  accepts: [".png"],
  output: "pdf",
  multiple: "merge",
  status: "ready",
  keywords: ["png pdf", "görselden pdf"],
  options: [
    {
      key: "sayfaBoyutu",
      type: "select",
      label: "Sayfa boyutu",
      defaultValue: "a4",
      options: [
        { value: "a4", label: "A4" },
        { value: "letter", label: "Letter" },
        { value: "gorsele-uygun", label: "Görsele uygun" },
      ],
    },
    {
      key: "yonlendirme",
      type: "select",
      label: "Yönlendirme",
      defaultValue: "dikey",
      options: [
        { value: "dikey", label: "Dikey" },
        { value: "yatay", label: "Yatay" },
      ],
    },
    { key: "kenarBosluk", type: "number", label: "Kenar boşluğu (pt)", defaultValue: 24, min: 0, max: 200 },
  ],
  run,
};

export default pngPdfConverter;
