import { Observable } from '../utils/observable';

export const rootVariables: Record<string, Observable<any>> = {};
export const universalVariables: Record<string, Observable<any>> = {};

export const warnings = new Map<string, any[]>();
export const warned = new Set<string>();
