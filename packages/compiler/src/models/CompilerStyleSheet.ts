import type {
  RuntimeJSXStyle,
  RuntimeTwinMappedProp,
  SheetEntryHandler,
  TwinInjectedObject,
} from '@native-twin/css/jsx';
import { hash } from '@native-twin/helpers';
import CodeBlockWriter from 'code-block-writer';
import * as RA from 'effect/Array';
import * as Option from 'effect/Option';
import { expressionFactory } from '../utils/babel/writer.factory';
import type { JSXMappedAttribute, TwinJSXElement } from './JSXElement.model';

interface CompiledProp extends JSXMappedAttribute {
  entries: SheetEntryHandler[];
  childEntries: SheetEntryHandler[];
}

export class JSXElementSheet {
  readonly childEntries: SheetEntryHandler[];

  constructor(
    readonly element: TwinJSXElement,
    private readonly styledProps: CompiledProp[],
    readonly parentSheet?: JSXElementSheet,
  ) {
    this.childEntries = styledProps.flatMap((x) => x.childEntries);
  }

  get classNames() {
    return this.styledProps.map((x) => x.value.text);
  }

  get selector(): string {
    return hash(this.classNames.join(' '));
  }

  get templateEntriesProps() {
    return getTemplateEntries(this.props);
  }

  get props() {
    const parent = this.parentSheet;
    if (!parent) return this.styledProps;
    const parentEntries = RA.filterMap(this.parentSheet.childEntries, (x) =>
      Option.fromNullable(
        x.applyChildEntry(this.element.index, parent.element.childsSize),
      ),
    );
    if (parentEntries.length === 0) return this.styledProps;

    if (this.styledProps.length === 0) {
      return Object.entries(this.element.config.config).map(([prop, target]) => ({
        childEntries: [],
        entries: parentEntries,
        prop,
        target,
        value: {
          templateExpression: Option.none(),
          text: '',
          twinRules: [],
        },
      }));
    }
    return this.styledProps.map((x) => ({
      ...x,
      entries: RA.union(x.entries, parentEntries),
    }));
  }

  toObject() {
    return sheetToRuntimeObject(this);
  }

  toCode() {
    return twinObjectToCode(this.toObject(), this.templateEntriesProps);
  }
}

/**
 * @description Serializable object representation for Element Sheet
 */
const sheetToRuntimeObject = (sheet: JSXElementSheet): TwinInjectedObject => {
  const props = getRuntimeProps(sheet.props);
  return {
    ...sheet.element.toObject(),
    childStyles: RA.fromIterable(sheet.childEntries).map(entryHandlerToInjected),
    metadata: getMappedPropsMetadata(props),
    props,
  };
};

const getRuntimeProps = (props: Iterable<CompiledProp>) =>
  RA.map(
    RA.fromIterable(props),
    (mapped): RuntimeTwinMappedProp => ({
      entries: RA.fromIterable(mapped.entries).map(entryHandlerToInjected),
      prop: mapped.prop,
      target: mapped.target,
    }),
  );

const twinObjectToCode = (
  twinObj: TwinInjectedObject,
  templateEntries: JSXElementSheet['templateEntriesProps'],
) => {
  const w = expressionFactory(new CodeBlockWriter());
  const componentProps = RA.fromIterable(twinObj.props)
    .map((x) => compiledPropToCode(x))
    .join(',');
  w.array(twinObj.childStyles).write(',');
  const componentData = `
      id: "${twinObj.id}", 
      index: ${twinObj.index}, 
      parentID: "${twinObj.parentID}",
      parentSize: ${twinObj.parentSize},
      metadata: ${expressionFactory(new CodeBlockWriter()).object(twinObj.metadata).toString()},`;
  const injectString = `{ 
      ${componentData}
      props: [${componentProps}],
      childStyles: ${w.writer.toString()}
    }`;
  const templateBuilder = expressionFactory(new CodeBlockWriter());
  templateBuilder.array(templateEntries).write(',');
  const jsxTwinProp = `{
      ${componentData}
      templateEntries: ${templateBuilder.writer.toString()}
    }`;

  return {
    injectString,
    jsxTwinProp,
  };
};

const getMappedPropsMetadata = (props: RuntimeTwinMappedProp[]) => {
  const data = props.flatMap((x) =>
    x.entries.map((y) => ({ group: y.group, className: y.className })),
  );
  return {
    isGroupParent: data.some((x) => x.className === 'group'),
    hasGroupEvents: data.some((x) => x.group === 'group'),
    hasPointerEvents: data.some((x) => x.group === 'pointer'),
  };
};

const getTemplateEntries = (props: Iterable<CompiledProp>) =>
  RA.filterMap(RA.fromIterable(props), (mapped) => {
    return mapped.value.templateExpression.pipe(
      Option.flatMap(
        Option.liftPredicate(
          (template) => template.length > 0 && template.replaceAll(/`/g, '').length > 0,
        ),
      ),
      Option.map((template) => ({
        prop: mapped.prop,
        target: mapped.target,
        value: template,
      })),
    );
  });

const entryHandlerToInjected = (entry: SheetEntryHandler): RuntimeJSXStyle => ({
  className: entry.className,
  declarations: entry.runtimeDeclarations,
  group: entry.selectorGroup(),
  important: entry.important,
  inherited: entry.inherited,
  precedence: entry.precedence,
});

const compiledPropToCode = (compiledProp: RuntimeTwinMappedProp) => {
  const w = expressionFactory(new CodeBlockWriter());

  w.writer.block(() => {
    w.writer.writeLine(`target: "${compiledProp.target}",`);
    w.writer.writeLine(`prop: "${compiledProp.prop}",`);
    w.writer.write('entries: ');
    w.array(compiledProp.entries).write(',');
  });
  return w.writer.toString();
};
