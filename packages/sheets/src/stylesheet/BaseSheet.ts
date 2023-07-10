import type { FinalSheet } from '@universal-labs/css';

interface CreateStylesFn {
  (input: string): FinalSheet;
}

export class BaseSheet {
  create: CreateStylesFn;
  constructor(create: CreateStylesFn) {
    this.create = create;
  }
}
