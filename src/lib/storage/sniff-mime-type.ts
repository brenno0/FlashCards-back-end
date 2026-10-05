const startsWith = (buffer: Buffer, bytes: number[], offset = 0) =>
  bytes.every((byte, index) => buffer[offset + index] === byte);

const ascii = (buffer: Buffer, start: number, end: number) =>
  buffer.subarray(start, end).toString('latin1');

export const IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
] as const;

/** Detects a small safe-list of types from magic bytes. Returns null when unknown. */
export const sniffMimeType = (buffer: Buffer): string | null => {
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png';
  }
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) {
    return 'image/jpeg';
  }
  if (ascii(buffer, 0, 6) === 'GIF87a' || ascii(buffer, 0, 6) === 'GIF89a') {
    return 'image/gif';
  }
  if (ascii(buffer, 0, 4) === 'RIFF' && ascii(buffer, 8, 12) === 'WEBP') {
    return 'image/webp';
  }
  if (ascii(buffer, 0, 5) === '%PDF-') {
    return 'application/pdf';
  }
  if (startsWith(buffer, [0x50, 0x4b, 0x03, 0x04])) {
    return 'application/zip';
  }
  return null;
};

/** Office/zip-based extensions share the zip signature; keep declared type for these. */
const ZIP_BASED_MIME_TYPES = new Set([
  'application/zip',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/epub+zip',
]);

/** Text-ish types we cannot sniff but are harmless when served as attachments. */
const TEXT_MIME_TYPES = new Set(['text/plain', 'text/csv', 'text/markdown']);

/**
 * Mime type stored for a generic file: sniffed type when known, the declared
 * type when it is consistent and safe-listed, otherwise application/octet-stream.
 */
export const resolveFileMimeType = (
  buffer: Buffer,
  declared: string | undefined,
): string => {
  const sniffed = sniffMimeType(buffer);
  if (
    sniffed === 'application/zip' &&
    declared &&
    ZIP_BASED_MIME_TYPES.has(declared)
  ) {
    return declared;
  }
  if (sniffed) {
    return sniffed;
  }
  if (declared && TEXT_MIME_TYPES.has(declared)) {
    return declared;
  }
  if (declared && /^(audio|video)\/[\w.+-]+$/.test(declared)) {
    return declared;
  }
  return 'application/octet-stream';
};
