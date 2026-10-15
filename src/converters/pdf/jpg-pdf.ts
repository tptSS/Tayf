import type { Converter } from "../types";
import { run, type GorselPdfOptions } from "./gorsel-pdf";

const jpgPdfConverter: Converter<GorselPdfOptions> = {
  slug: "jpg-pdf",
  title: "JPG'den PDF oluştur",
  description: "JPG görsellerden PDF oluştur.",
  category: "pdf",
  accepts: [".jpg", ".jpeg"],
  output: "pdf",
  multiple: "merge",
  status: "ready",
  keywords: ["jpg pdf", "görselden pdf"],
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

export default jpgPdfConverter;
