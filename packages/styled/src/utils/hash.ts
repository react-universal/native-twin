// Copyright (c) 2016-present Glen Maddern and Maximilian Stoiber
import generateAlphabeticName from './generateAlphabeticalName';

export const SEED = 5381;

// When we have separate strings it's useful to run a progressive
// version of djb2 where we pretend that we're still looping over
// the same string
export const phash = (h: number, x: string) => {
  let i = x.length;

  while (i) {
    h = (h * 33) ^ x.charCodeAt(--i);
  }

  return h;
};

// This is a djb2 hashing function
export const hash = (x: string) => {
  return phash(SEED, x);
};

export function generateComponentHashID(str: string) {
  return generateAlphabeticName(hash(str) >>> 0);
}
