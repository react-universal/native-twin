export function log(): void {}

export function dim(input: string): string {
  return input;
}

export default {
  info: log,
  warn: log,
  risk: log,
};
