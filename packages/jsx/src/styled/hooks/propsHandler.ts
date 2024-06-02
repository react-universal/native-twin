import { cx, tw } from '@native-twin/core';
import { createComponentSheet, StyleSheet } from '../../sheet/StyleSheet';
import { ComponentConfig, PropState, StyledComponentState } from '../../types/styled.types';
import { cleanupEffect, observable } from '../../utils/observable';

type ComponentProps = Record<string, any> | null;

export const createPropHandler = (
  configs: ComponentConfig[],
  props: ComponentProps,
  forceRenderFn: () => void,
) => {
  const componentState: StyledComponentState = {
    interaction: {},
    refs: { props },
    propStates: [],
    rerender() {
      forceRenderFn();
    },
  };

  componentState.propStates = configs.map((x) => createPropState(x, props, componentState));
  return componentState;
};

function createPropState(
  config: ComponentConfig,
  incomingProps: ComponentProps,
  componentState: StyledComponentState,
) {
  const propState: PropState = {
    interaction: componentState.interaction,
    refs: { props: incomingProps },
    source: config.source,
    target: config.target,
    currentStyles: {},
    styleEffect: {
      rerun: styleEffectFn,
      dependencies: new Set(),
    },
    declarationEffect: {
      rerun: declarationEffect,
      dependencies: new Set(),
    },
    sheet: null,
    classNames: incomingProps?.[config.source],
    testID: componentState.refs.props?.['testID'],
    props: incomingProps ?? undefined,
    nativeStyleToProp: config.nativeStyleToProp,
  };

  function declarationEffect(isRendering = false) {
    const sourceClassNames = propState.classNames ?? incomingProps?.[config.source];
    // const inlineStyles = propState.refs.props?.[config.target];

    if (sourceClassNames === propState.classNames) {
      return;
    }

    const classNames = cx`${sourceClassNames}`;

    if (!propState.classNames) {
      propState.classNames = classNames;
    }

    const sheet = createComponentSheet(tw(classNames), StyleSheet.runtimeContext);

    if (!propState.sheet) {
      // Object.assign(sheet.sheet.base, inlineStyles ?? {});
      propState.sheet = sheet;
    }
    propState.currentStyles = sheet.getStyles({
      isParentActive: false,
      isPointerActive: false,
    });
    // console.log('CURRENT: ', propState.currentStyles);

    if (sheet.metadata.hasPointerEvents) {
      propState.interaction.active ??= observable(false);
      propState.interaction.hover ??= observable(false);
      propState.interaction.focus ??= observable(false);
    }

    propState.styleEffect.rerun();
  }

  function styleEffectFn(isRendering = false) {
    const newProps: NonNullable<ComponentProps> = {};
    const prevProps = propState.props;
    cleanupEffect(propState.styleEffect);

    if (prevProps && prevProps?.[propState.target]) {
      // propState.tracking.sheet?.sheet?.base = {
      //   ...prevProps?.[propState.target],
      //   ...propState.sheet.sheet.base,
      // };
    }

    // newProps[propState.target] = propState.tracking.inlineStyles;

    newProps[propState.target] = propState.currentStyles;
    // propState.sheet?.getStyles({
    //   isPointerActive: false,
    // isPointerActive:
    //   componentState.interaction.active?.get?.() ||
    //   componentState.interaction.hover?.get?.() ||
    //   componentState.interaction.focus?.get?.() ||
    //   false,
    //   isParentActive: false,
    // });

    componentState.refs.props = newProps;
    if (Object.keys(componentState.interaction).length === 0) {
      componentState.interaction.active ??= propState.interaction.active;
      componentState.interaction.hover ??= propState.interaction.hover;
      componentState.interaction.focus ??= propState.interaction.focus;
    }

    // We changed while not rerendering (e.g from a Media Query), so we need to notify React
    if (!isRendering) {
      componentState.rerender();
    }

    propState.props = newProps;
  }

  return propState;
}
