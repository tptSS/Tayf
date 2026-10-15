import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
    resolveAlias: {
      // qpdf-wasm'in (@neslinesli93/qpdf-wasm) Emscripten çıktısı yalnızca
      // Node.js'te çalışan dallarda bu modülleri require ediyor; tarayıcıda
      // hiç tetiklenmiyor ama Turbopack yine de build zamanında çözmeye
      // çalışıyor. Yalnızca `browser` koşulunda boş bir modüle yönlendiriyoruz
      // ki statik sayfa üretiminde Next'in kendi sunucu tarafı kodunun
      // gerçek fs/path/crypto'ya erişimi bozulmasın.
      fs: { browser: "./src/lib/empty-module.ts" },
      path: { browser: "./src/lib/empty-module.ts" },
      crypto: { browser: "./src/lib/empty-module.ts" },
    },
  },
};

export default nextConfig;
