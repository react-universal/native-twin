// BITS: 0
// Type: S

// NON FLOATING NUMBERS (AKA NaN | Infinity | -Infinity | -0)
// 0/0 (NaN) | | 1/0 (Infinity) | -1/0 (-Infinity);

// Normalized numbers (Int|Float)
// De-Normalized numbers (2**0)

const EXP_BITS = 5;
const MANTISSA_BITS = 10;
const NON_SIGN_BITS = EXP_BITS + MANTISSA_BITS;

export const encode = (n: number) => {
  const signInput = Math.sign(n) === -1 ? 1 : 0;

  let exponent = Math.floor(Math.log(Math.abs(n)) / Math.log(2));
  const lowerByte = 2 ** exponent;
  const higherByte = 2 ** (exponent + 1);
  exponent = (exponent + 15) & 0b11111;
  const percentage = (Math.abs(n) - lowerByte) / (higherByte - lowerByte);
  const mantissaFuck = 1024 * percentage;

  return (signInput << NON_SIGN_BITS) | (exponent << MANTISSA_BITS) | mantissaFuck;
};

const decode = (n: number) => {
  const signInput = (n & 0b1000000000000000) >> NON_SIGN_BITS;
  const exponent = (n & 0b0111110000000000) >> MANTISSA_BITS;
  const mantissaFuck = n & 0b0000001111111111;

  if (n === 0) {
    return signInput === 0 ? 0 : 1 << NON_SIGN_BITS;
  }

  if (exponent === 0 && mantissaFuck === 0) {
    return signInput === 1 ? -0 : 0;
  }

  if (exponent === 0b11111) {
    if (mantissaFuck === 0) {
      return signInput ? Infinity : -Infinity;
    } else {
      return NaN;
    }
  }

  const wholePart = exponent === 0 ? 0 : 1;

  const percentage = mantissaFuck / 1024;
  return (-1) ** signInput * (wholePart + percentage) * 2 ** (exponent - 15);
};

const test = encode(2);
const originalNumber = 12.52571;
const encoded = encode(originalNumber);
const decoded = decode(encoded);

const infinityCheck = decode(0b0111110000000000);
const minusInfinityCheck = decode(0b1111110000000000);
// Nan Check
const nanCheck = decode(0b1111110000000001);

const math = 8 * 579;
