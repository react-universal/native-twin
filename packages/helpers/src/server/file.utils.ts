export function ensureBuffer(file: Buffer | string): Buffer {
  return Buffer.isBuffer(file) ? file : Buffer.from(file);
}

export function matchCss(filename: string): boolean {
  return /\.(s?css|sass)$/.test(filename);
}

export function bufferToString(
  input: Buffer,
  encoding: BufferEncoding = 'utf-8',
): string {
  return input.toString(encoding);
}
