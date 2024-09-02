export function ensureBuffer(file: Buffer | string): Buffer {
  return Buffer.isBuffer(file) ? file : Buffer.from(file);
}

export function matchCss(filename: string): boolean {
  return /\.(s?css|sass)$/.test(filename);
}
