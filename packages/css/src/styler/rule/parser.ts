import { tokenIdentity } from "../../css/tokens";
import type { SheetEntryDeclaration } from "../../sheets/sheet.types";
import type { CreateStylerInput } from "../styler.types";
import * as PropPredicates from "./predicates";

const imageDecl = tokenIdentity("image");
const textDecl = tokenIdentity("text");
const viewDecl = tokenIdentity("view");
const unknownDecl = tokenIdentity("unknown");
const compiledValue = tokenIdentity("compiledValue");
const unknownValue = tokenIdentity("unknownValue");

const getDeclKind = (prop: string) => {
  if (PropPredicates.isImage(prop)) {
    return imageDecl(prop);
  }
  if (PropPredicates.isText(prop)) {
    return textDecl(prop);
  }
  if (PropPredicates.isView(prop)) {
    return viewDecl(prop);
  }
  return unknownDecl(prop);
};

const getDeclValueKind = (prop: string) => {
  if (PropPredicates.isDimension(prop)) return "dimension";
  if (PropPredicates.isColor(prop)) return "color";
  return "unknown";
};

export const getSheetDeclInfo = (decl: SheetEntryDeclaration) => {
  const kind = getDeclKind(decl.prop);
  const valueType = getDeclValueKind(decl.prop);
  const supportsAuto = PropPredicates.supportsAuto(decl.prop);
  const supportsNone = PropPredicates.supportsNone(decl.prop);
  const isUnitless = PropPredicates.isUnitless(decl.prop);
  const isUnknownDecl = kind.type !== "unknown" && valueType !== "unknown";

  return {
    kind,
    valueType,
    supportsAuto,
    supportsNone,
    isUnknownDecl,
    isUnitless,
  };
};

export const parseSheetDecl = (
  decl: SheetEntryDeclaration,
  _ctx: CreateStylerInput
) => {
  const kind = getDeclKind(decl.prop);
  const valueType = getDeclValueKind(decl.prop);
  const supportsAuto = PropPredicates.supportsAuto(decl.prop);
  const supportsNone = PropPredicates.supportsNone(decl.prop);
  const isUnitless = PropPredicates.isUnitless(decl.prop);
  const isUnknownDecl = kind.type !== "unknown" && valueType !== "unknown";
  const value = guessDeclValue();

  return {
    value,
    decl,
    isUnitless,
    isUnknownDecl,
    supportsAuto,
    supportsNone,
    valueType,
    kind,
  };

  function guessDeclValue() {
    if (isUnknownDecl) unknownValue(decl.value);
    if (
      (supportsAuto && decl.value === "auto") ||
      (supportsNone && decl.value === "none")
    ) {
      return compiledValue(decl.value);
    }
    if (
      isUnitless &&
      (typeof decl.value === "number" || typeof decl.value === "string")
    ) {
      const result = Number.parseInt(decl.value.toString(), 10);
      if (!Number.isNaN(result)) return compiledValue(result);
    }
    if (valueType === "color" && typeof decl.value === "string") {
      return compiledValue(decl.value);
    }

    return unknownValue(decl.value);
  }
};

// const withParseStyleAuto = <A>(parser: P.Parser<A>) =>
//   P.choice([P.literal("auto"), parser]);
// const withParseStyleNone = <A>(parser: P.Parser<A>) =>
//   P.choice([P.literal("none"), parser]);
