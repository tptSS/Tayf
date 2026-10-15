import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} tayf</p>
        <nav className="flex gap-4" aria-label="Alt bilgi bağlantıları">
          <Link href="/gizlilik" className="hover:text-foreground">
            Gizlilik
          </Link>
          <Link href="/hakkinda" className="hover:text-foreground">
            Hakkında
          </Link>
        </nav>
      </div>
    </footer>
  );
}
