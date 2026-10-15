import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik",
  description: "tayf hiçbir dosyanı sunucuya göndermez. Ne topladığımızı buradan oku.",
};

export default function GizlilikPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Gizlilik</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Dosyaların ne olur?</h2>
        <p className="text-muted-foreground">
          Hiçbir şey. Yüklediğin veya bıraktığın dosya hiçbir zaman internete
          çıkmaz, bir sunucuya gönderilmez. Tüm dönüştürme ve düzenleme
          işlemleri senin tarayıcında, bilgisayarının ya da telefonunun
          belleğinde çalışır. Sayfayı kapattığında dosyan da kaybolur; biz
          bir kopyasını hiç görmeyiz.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Ne topluyoruz?</h2>
        <p className="text-muted-foreground">
          Çerezsiz, anonim ziyaret istatistikleri tutabiliriz (hangi sayfa
          görüntülendi, hangi araç kullanıldı). Bu istatistiklerde dosya adı,
          dosya boyutu ya da içeriğine dair hiçbir bilgi yoktur ve seni kişisel
          olarak tanımlamaz.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Hesap, üyelik yok</h2>
        <p className="text-muted-foreground">
          tayf&apos;ı kullanmak için hesap açmana gerek yok. Reklam göstermiyoruz,
          e-posta istemiyoruz, kişisel veri satmıyoruz.
        </p>
      </section>
    </div>
  );
}
