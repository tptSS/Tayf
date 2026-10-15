/**
 * qpdf-wasm'in Emscripten çıktısı, yalnızca gerçek Node.js ortamında
 * çalışan kod yollarında `require("fs")`/`require("path")`/`require("crypto")`
 * çağırıyor (tarayıcıda hiç tetiklenmiyor). Turbopack yine de bu
 * `require` çağrılarını build zamanında çözmeye çalışıyor; next.config.ts
 * bu modülleri buraya yönlendirip build'in başarısız olmasını önlüyor.
 */
export {};
