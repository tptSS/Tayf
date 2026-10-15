// Ana sayfada bırakılan dosyayı araç sayfasına yeniden seçtirmeden
// taşımak için modül kapsamında tutulan, oturum içi geçici bir depo.
// Next.js App Router istemci tarafı gezinmede sayfayı yeniden yüklemediği
// için bu modülün durumu sayfalar arasında hayatta kalır.
let pendingFiles: File[] | null = null;

export function setPendingFiles(files: File[]): void {
  pendingFiles = files;
}

export function takePendingFiles(): File[] | null {
  const files = pendingFiles;
  pendingFiles = null;
  return files;
}
