export interface DetectedFile {
  extension: string;
  mimeType: string;
}

// Uzantıdan güvenilir sonuç alınamazsa diye bilinen magic byte imzaları.
const SIGNATURES: Array<{
  mimeType: string;
  extension: string;
  match(bytes: Uint8Array): boolean;
}> = [
  {
    mimeType: "application/pdf",
    extension: "pdf",
    match: (b) => startsWith(b, [0x25, 0x50, 0x44, 0x46]), // %PDF
  },
  {
    mimeType: "image/png",
    extension: "png",
    match: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47]),
  },
  {
    mimeType: "image/jpeg",
    extension: "jpg",
    match: (b) => startsWith(b, [0xff, 0xd8, 0xff]),
  },
  {
    mimeType: "image/webp",
    extension: "webp",
    match: (b) =>
      startsWith(b, [0x52, 0x49, 0x46, 0x46]) &&
      b.length > 11 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
  {
    mimeType: "image/gif",
    extension: "gif",
    match: (b) => startsWith(b, [0x47, 0x49, 0x46, 0x38]),
  },
  {
    mimeType: "application/zip",
    // .xlsx/.docx/.ods de zip kapsayıcısıdır; uzantı bunları ayırt eder.
    extension: "zip",
    match: (b) => startsWith(b, [0x50, 0x4b, 0x03, 0x04]),
  },
  {
    mimeType: "image/heic",
    extension: "heic",
    match: (b) =>
      b.length > 12 &&
      b[4] === 0x66 &&
      b[5] === 0x74 &&
      b[6] === 0x79 &&
      b[7] === 0x70,
  },
];

function startsWith(bytes: Uint8Array, prefix: number[]): boolean {
  if (bytes.length < prefix.length) return false;
  return prefix.every((byte, i) => bytes[i] === byte);
}

function extensionOf(fileName: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(fileName);
  return match ? match[1].toLowerCase() : "";
}

/**
 * Dosyanın türünü önce uzantıdan, bulunamazsa ilk baytlardan (magic bytes)
 * tespit eder. zip tabanlı Office formatları (.xlsx/.docx/.ods) uzantıya
 * göre ayrılır çünkü imza (PK\x03\x04) hepsinde ortaktır.
 */
export async function detectFileType(file: File): Promise<DetectedFile> {
  const extension = extensionOf(file.name);
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());

  const officeZipExtensions = new Set(["xlsx", "docx", "ods", "pptx"]);
  if (officeZipExtensions.has(extension)) {
    return { extension, mimeType: officeMimeFor(extension) };
  }

  for (const sig of SIGNATURES) {
    if (sig.match(head)) {
      return { extension: extension || sig.extension, mimeType: sig.mimeType };
    }
  }

  return { extension, mimeType: file.type || "application/octet-stream" };
}

function officeMimeFor(extension: string): string {
  switch (extension) {
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "ods":
      return "application/vnd.oasis.opendocument.spreadsheet";
    default:
      return "application/zip";
  }
}
