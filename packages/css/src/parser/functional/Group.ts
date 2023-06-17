import type { MonoID } from './MonoID';

export interface Group<A> extends MonoID<A> {
  inverse: (a: A) => A;
}

/**
 * Group: is a monoID that each value has a unique inverse
 * Group: is fundamental structure in Maths
 * Group: encodes the concept of symmetry
 */

const alphabet = 'abcdefghijklmnopqrstuvwxyz';
const caesarGroup: Group<number> = {
  concat: (x, y) => (x + y) % alphabet.length,
  inverse: (a) => (alphabet.length - a) % alphabet.length,
  empty: 0,
};

type Encrypt = (text: string, key: number) => string;
type Decrypt = (cipherText: string, key: number) => string;

const encrypt: Encrypt = (text, key) =>
  text
    .toLowerCase()
    .split('')
    .map((letter) => {
      const index = alphabet.indexOf(letter);
      if (index === -1) return letter;
      const newIndex = caesarGroup.concat(index, key);
      return alphabet[newIndex];
    })
    .join('');

const decrypt: Decrypt = (cipherText, key) => encrypt(cipherText, caesarGroup.inverse(key));
const encripted = encrypt('dfadasdasdasd', 4);
decrypt(encripted, 4);
