import type {
  AnyStyle,
  CompleteStyle,
  SheetEntryDeclaration,
} from '@native-twin/css';
import { keysOf } from '@native-twin/helpers';
import type { StyleProp } from 'react-native';
import type { ClassnameStyles, ComponentStyleRegistry } from './Models';

export function composeDeclValueArray(
  value: SheetEntryDeclaration['value'],
): AnyStyle[] | string | number | AnyStyle {
  if (typeof value === 'number' || typeof value === 'number') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((val) => {
      return { [val.prop]: composeDeclValueArray(val.value) };
    });
  }

  return value;
}

export const mergeStyles = (self: CompleteStyle, that: CompleteStyle): CompleteStyle => {
  for (const key of keysOf(that)) {
    if (key === 'transform') {
      const current = self[key];
      const thatValue = that[key];
      if (!Array.isArray(current) || !Array.isArray(thatValue)) continue;
      if (current) {
        const newValue = current.concat(thatValue);
        Object.assign({}, { ...self }, { [key]: newValue });
      }
    }
  }

  const result = Object.assign({}, { ...self }, { ...that });
  return result;
};

export const createMapRegistry = <Value>() => {
  const _registry = new Map<string, Value>();

  return {
    ref: _registry,
    add: (key: string, value: Value) => _registry.set(key, value),
    get: (key: string): Value | null => _registry.get(key) ?? null,
    unsafeGet: (key: string): Value => _registry.get(key)!,
  };
};

export const mergeComponentStyledProps = (
  component: ComponentStyleRegistry,
  withPointer: boolean,
  withGroup: boolean,
): {
  [key: string]: StyleProp<CompleteStyle>;
} =>
  component.props.reduce((prev, current) => {
    const final = { ...current.styles.base };
    if (withPointer) {
      Object.assign(final, current.styles.pointer);
    }
    if (withGroup) {
      Object.assign(final, current.styles.group);
    }
    return Object.assign(
      { ...prev },
      {
        [current.target]: final,
      },
    );
  }, {});

export const mergeCLassNameStyle = (
  self: ClassnameStyles,
  that: ClassnameStyles,
): ClassnameStyles => {
  return {
    ...self,
    base: mergeStyles(self.base, that.base),
    dark: mergeStyles(self.dark, that.dark),
    group: mergeStyles(self.group, that.group),
    pointer: mergeStyles(self.pointer, that.pointer),
  };
};
