import type { CompiledSheetEntry } from '@native-twin/core';
import type { TwinRuntimeComponent } from '@native-twin/css/jsx';
import type { TreeNode } from '@native-twin/helpers/tree';
import * as Data from 'effect/Data';
import type { TwinRunnerPlatform } from '../Config';
import type { TwinJSXElement, TwinJSXElementNode } from '../internal/babel/babel.models';
import type { CompiledStyledProp } from '../StyleSheet';

export interface TwinTransformOptions {
  platform: TwinRunnerPlatform;
}

export interface EvaluatedStyledProp {
  compiledProp: CompiledStyledProp;
}

export class TransformedJSXNode extends Data.Class<{
  node: TreeNode<TwinJSXElementNode>;
  styledProps: CompiledStyledProp[];
  parentStyles: CompiledSheetEntry[];
  jsxDeclarator: TwinJSXElement;
  index: number;
  parentSize: number;
  parentID: string | null;
}> {
  toRuntimeJSX(): TwinRuntimeComponent {
    const runtimeProps = this.styledProps.map((x) => x.toRuntime(false, this.parentStyles));
    const childStyles = runtimeProps.flatMap((x) => x.entries.child);

    const metadata = {
      hasGroupEvents: runtimeProps.some((x) => x.metadata.hasGroupEvents),
      hasPointerEvents: runtimeProps.some((x) => x.metadata.hasPointerEvents),
      isGroupParent: runtimeProps.some((x) => x.metadata.isGroupParent),
    };
    return {
      id: this.node.value.id,
      index: this.index,
      metadata,
      childIds: this.node.children.map((x) => x.value.id),
      parentID: this.parentID,
      parentSize: this.parentSize,
      props: runtimeProps,
      childStyles,
    };
  }
  // evaluatedStyledProps() {
  //   if (this.styledProps.length === 0 && this.parentStyles.length > 0) {
  //     return Stream.fromIterable(this.parentStyles).pipe(
  //       Stream.transduce(
  //         foldCompiledSheetEntriesSink.pipe(
  //           Sink.map((x): TwinEvaluatedStyle => ({ node: this.node, prop: null, styles: x })),
  //         ),
  //       ),
  //     );
  //   }

  //   return Stream.fromIterable(this.styledProps).pipe(
  //     Stream.mapEffect((prop) => {
  //       return Stream.concatAll(
  //         Chunk.make(
  //           Stream.fromIterable(prop.baseStyles),
  //           Stream.fromIterable(prop.pointerStyles),
  //           Stream.fromIterable(prop.groupStyles),
  //           Stream.fromIterable(this.parentStyles),
  //           Stream.fromIterable(prop.darkStyles),
  //         ),
  //       ).pipe(
  //         Stream.run(
  //           foldCompiledSheetEntriesSink.pipe(
  //             Sink.map((x): TwinEvaluatedStyle => ({ node: this.node, prop, styles: x })),
  //           ),
  //         ),
  //       );
  //     }),
  //   );
  // }
}
