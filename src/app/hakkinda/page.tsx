import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Hakkında",
  description: "tayf nedir, neden var, kimler için yapıldı.",
};

export default function HakkindaPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <Logo />
      <h1 className="text-2xl font-semibold tracking-tight">Hakkında</h1>
      <p className="text-muted-foreground">
        tayf, ücretsiz ve tamamen tarayıcıda çalışan bir PDF düzenleyici ve
        dosya dönüştürücü. Bir dosya bırakırsın, istediğin formata çevirir
        ya da düzenlersin, sonucu indirirsin. Dosyan hiçbir zaman sunucuya
        yüklenmez — her şey senin cihazında olur.
      </p>
      <p className="text-muted-foreground">
        İsmini ışık tayfından alır: tek bir dosya girer, istenen biçimde
        ayrılır. Arkadaşlar, iş arkadaşları ve bu işi ücretsiz, reklamsız ve
        üyeliksiz yapmak isteyen herkes için yapıldı.
      </p>
    </div>
  );
}
