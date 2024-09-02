export function ensureBuffer(file: Buffer | string): Buffer {
  return Buffer.isBuffer(file) ? file : Buffer.from(file);
}

export function matchCss(filePath: string): boolean {
  return /\.css$/.test(filePath);
}
