import type { MetadataRoute } from "next";
import { converters } from "@/converters/registry";

export const dynamic = "force-static";

const BASE_URL = "https://tayf.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/gizlilik`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/hakkinda`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/duzenle`, changeFrequency: "monthly", priority: 0.8 },
    ...converters
      .filter((c) => c.slug !== "pdf-duzenle" && c.slug !== "pdf-sayfa-duzenle")
      .map((c) => ({
        url: `${BASE_URL}/araclar/${c.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
  ];
}
