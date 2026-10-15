import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { converters, getConverter } from "@/converters/registry";
import { CATEGORY_COLOR_CLASS, CATEGORY_LABELS } from "@/lib/categories";
import { ToolRunner } from "@/components/tool-runner/tool-runner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return converters.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const converter = getConverter(slug);
  if (!converter) return {};
  return {
    title: `${converter.title} – ücretsiz, yükleme yok`,
    description: converter.description,
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "pdf-duzenle") redirect("/duzenle");

  const converter = getConverter(slug);
  if (!converter) notFound();

  const faq = [
    {
      q: "Dosyam sunucuya yükleniyor mu?",
      a: "Hayır. Tüm işlem tarayıcında yapılır, dosyan cihazından çıkmaz.",
    },
    {
      q: "Bu araç ücretsiz mi?",
      a: "Evet, tayf'taki tüm araçlar ücretsiz ve üyeliksizdir.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HowTo",
        name: converter.title,
        step: [
          { "@type": "HowToStep", text: "Dosyanı bırak ya da seç." },
          { "@type": "HowToStep", text: "Gerekirse seçenekleri ayarla." },
          { "@type": "HowToStep", text: "Sonucu indir." },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Tüm araçlar
        </Link>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold",
              CATEGORY_COLOR_CLASS[converter.category],
            )}
          >
            {CATEGORY_LABELS[converter.category].slice(0, 1)}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">
            {converter.title}
          </h1>
          {converter.status === "soon" && <Badge variant="secondary">Yakında</Badge>}
        </div>
        <p className="mt-2 text-muted-foreground">{converter.description}</p>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-data" aria-hidden />
          Dosyaların cihazından çıkmaz.
        </p>
      </div>

      {converter.status === "soon" ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
          Bu araç yakında burada olacak.
        </div>
      ) : (
        <ToolRunner converter={converter} />
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Nasıl kullanılır?</h2>
        <ol className="list-inside list-decimal text-sm text-muted-foreground">
          <li>Dosyanı bırak ya da seç.</li>
          <li>Gerekirse seçenekleri ayarla.</li>
          <li>Sonucu indir.</li>
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Sık sorulanlar</h2>
        {faq.map((f) => (
          <div key={f.q}>
            <p className="font-medium">{f.q}</p>
            <p className="text-sm text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
