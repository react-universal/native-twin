import { type ComponentType, useContext, useEffect, useState } from 'react';
import type { StyleProp } from 'react-native';
import { Appearance, Dimensions, PixelRatio, Platform } from 'react-native';
import {
  type AnyStyle,
  type CompleteStyle,
  type FinalSheet,
  type GetChildStylesArgs,
  type SheetEntry,
  type SheetEntryDeclaration,
  type SheetInteractionState,
  getRuleSelectorGroup,
} from '@native-twin/css';
import { parseCssValue, tw } from '@native-twin/native-twin';
import type { StyledContext, Units } from '@native-twin/styled';
import { DEFAULT_CONTAINER_NAME } from '../../shared';
import { cleanupEffect } from '../observable';
import { variableContext, containerContext } from './globals';
import { externalCallbackRef } from './globals';
import { renderComponent } from './render-component';
import type { ComponentConfig, ComponentState, PropState } from './styled.types';

export function interop<
  StyleType,
  InitialProps extends { style?: StyleProp<StyleType> },
  Props extends InitialProps = InitialProps,
>(
  baseComponent: ComponentType<InitialProps>,
  configs: ComponentConfig[],
  props: Record<string, any> | null,
  ref: any,
) {
  // These are inherited from the parent components
  let variables = useContext(variableContext);
  let containers = useContext(containerContext);
  // const classNames = props?.className ?? props?.tw ?? '';

  /*
   * We need to keep track of the state of the component
   */
  const [componentState, setState] = useState(() => {
    const componentState: ComponentState = {
      // Refs are values that should be updated every time the component is rendered
      refs: { props, containers, variables },
      // This stores the state of 'active', 'hover', 'focus', and 'layout'
      interaction: {},
      // Should the component be upgraded? E.g View->Pressable, View->Animated.View
      upgrades: {},
      // The current state of each `className` prop
      propStates: [],
      // This is how we force a component to rerender
      rerender: () => setState((state) => ({ ...state })),
    };
    /*
     * Generate the propStates is the mapping of `className`->`style` props
     * You can have multiple propStates if you have multiple `className` props
     */
    componentState.propStates = configs.map((config) => {
      return createPropState(componentState, config);
    });

    return componentState;
  });

  // Components can subscribe to the event handlers of other components
  // So we need to ensure that everything is cleaned up when the component is unmounted
  useEffect(() => {
    return () => {
      for (const prop of componentState.propStates) {
        /*
         * Effects are a two-way dependency system, so we need to cleanup the references to avoid a memory leak
         */
        cleanupEffect(prop.declarationEffect);
        cleanupEffect(prop.styleEffect);
      }
    };
  }, [componentState.propStates]);

  // Update the refs so we don't have stale data
  componentState.refs.props = props;
  componentState.refs.containers = containers;
  componentState.refs.variables = variables;

  // Clone the props into a new object, as props will be frozen
  props = Object.assign({ ref }, props);

  // We need to rerun all the prop states to get the styled props
  for (const propState of componentState.propStates) {
    // This line is the magic and impure part of the code. It will mutate propState
    // and regenerate styles & props
    propState.declarationEffect.rerun(true);

    // Once propState has mutated, we can retrieve the data from it

    // Set the styled props
    Object.assign(props, propState.props);

    // Remove any source props
    // e.g remove props.className as React Native will throw a warning about unknown props
    if (propState.target !== propState.source) {
      delete props[propState.source];
    }

    // Collect any inline variables being set
    if (propState.variables) {
      variables = Object.assign({}, variables, propState.variables);
    }

    // Connect the containers being set
    if (propState.containerNames) {
      containers = Object.assign({}, containers);
      for (const name of propState.containerNames) {
        containers[name] = componentState;
      }
      containers[DEFAULT_CONTAINER_NAME] = componentState;
    }
  }

  /*
   * Render out the base component with the new styles.
   */
  return renderComponent(baseComponent, componentState, props, variables, containers);
}

export function createPropState(componentState: ComponentState, config: ComponentConfig) {
  const propState: PropState = {
    // What is the source prop? e.g className
    source: config.source,
    // WHat is the target prop? e.g style
    target: config.target,
    // Should we move styles to props? e.g { style: { fill: 'red' } -> { fill: 'red' }
    nativeStyleToProp: config.nativeStyleToProp,
    // These are object references from the parent component
    // They should never be replaced, only mutated
    upgrades: componentState.upgrades,
    interaction: componentState.interaction,
    refs: componentState.refs,
    testID: componentState.refs.props?.testID,

    // Tracks what the classNames were last render and if anything has changed
    tracking: {
      index: 0,
      rules: [],
      changed: false,
    },

    /**
     * The first effect. This will run when props change and will determine which styles to apply
     * e.g className="active:text-red-500" should only apply when the component is active
     * Other conditions are
     *  : Media Queries
     *  - Container Queries
     *  - Pseudo Classes
     *
     * Once it works out which rules are relevant, it will then sort them by specificity
     * From MDN:
     * "Specificity is the algorithm used by browsers to determine the CSS declaration that
     *  is the most relevant to an element, which in turn, determines the property value to
     *  apply to the element. The specificity algorithm calculates the weight of a CSS selector
     *  to determine which rule from competing CSS declarations gets applied to an element."
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity
     */
    declarationEffect: {
      dependencies: new Set<() => void>(),
      rerun(isRendering: boolean = false) {
        // Clean up any previous effects which may have subscribed to external event handlers
        cleanupEffect(propState.declarationEffect);

        const tracking = propState.tracking;
        const classNames = propState.refs.props?.[propState.source];
        const inlineStyles = propState.refs.props?.[config.target];

        tracking.index = 0;
        tracking.changed = tracking.inlineStyles !== inlineStyles;
        tracking.inlineStyles = inlineStyles;

        const normal: CompleteStyle[] = [];
        const important: CompleteStyle[] = [];

        if (typeof classNames === 'string') {
          const { width, height } = Dimensions.get('screen');

          const entries = tw(classNames);
          const componentSheet = createComponentSheet(
            entries,
            createStyledContext({
              rem: 16,
              vh: height,
              vw: width,
            }),
          );

          console.log('SHEET: ', componentSheet);
          propState.refs.props = {
            ...propState.refs.props,
            [propState.target]: componentSheet.getStyles({
              isParentActive: false,
              isPointerActive: false,
            }),
          };
          propState.props = {
            ...propState.props,
            [propState.target]: componentSheet.getStyles({
              isParentActive: false,
              isPointerActive: false,
            }),
          };

          normal.push(componentSheet.sheet.base);
          tracking.index = entries.length ?? tracking.index++;

          // for (const entry of tw(classNames)) {
          //   const ruleSet = globalStyles.has(entry.className)
          //     ? globalStyles.get(entry.className)?.get(propState.declarationEffect)
          //       ? opaqueStyles.has(entry)
          //       : opaqueStyles.get(entry)
          //     : entry;

          //   if (!ruleSet) {
          //     const styleObservable = observable<SheetEntry>(entry);
          //     styleObservable.get(propState.declarationEffect);
          //     globalStyles.set(entry.className, styleObservable);
          //   } else {
          //     const group = getRuleSelectorGroup(entry.selectors);
          //     if (group === 'base') {
          //       if (entry.important) {
          //         important.push(entry);
          //       } else {
          //         normal.push(entry);
          //       }
          //     }
          //   }

          externalCallbackRef.current?.(classNames);
          // }
        }

        // Check if the number of matching rules have changed
        tracking.changed ||= tracking.rules.length !== normal.length + important.length;

        // If nothing has changed, we can skip the rest of the process
        if (!tracking.changed) return false;

        /*
         * Inline styles are applied after classNames.
         * They may be StyleRuleSets, but they are applied as if they were inline styles
         * These are added after storing, as they 'win' in specificity.
         * They are also applied Left->Right instead of following specificity order
         *
         * NOTE: This is relevant for remapProps, which change `className` to inline styles
         *       It these upgraded styles don't follow specificity order - they follow inline order
         */
        if (Array.isArray(inlineStyles)) {
          // RN styles can be an array, we need to flatten them so they can be added to `normal` and `important`
          const flat = inlineStyles.flat(10);
          normal.push(...flat);
        } else if (inlineStyles) {
          important.push(inlineStyles);
        }

        propState.declarations = [];
        propState.importantDeclarations = [];
        propState.variables = undefined;
        propState.containerNames = undefined;

        // Loop over the matching StyleRules and get their style properties/variables/animations
        // Because they are sorted by specificity, the last rule will 'win'
        // addDeclarations(propState, normal, propState.declarations);
        // addDeclarations(propState, important, propState.importantDeclarations);

        // Now everything is sorted, we need to actually apply the declarations
        propState.styleEffect.rerun(isRendering);

        return tracking.changed;
      },
    },
    styleEffect: {
      dependencies: new Set<() => void>(),
      rerun(isRendering = false) {
        cleanupEffect(propState.styleEffect);
        // @ts-expect-error
        const props: Record<string, any> = {};
        // const normalizedProps: Record<string, any> = {};
        const delayedValues: (() => void)[] = [];
        // const seenAnimatedProps = new Set<string>();

        /**
         * Apply the matching declarations to the props in Cascading order
         * From MDN:
         * "The cascade lies at the core of CSS, as emphasized by the name: Cascading Style Sheets."
         * "The cascade is an algorithm that defines how user agents combine property values originating from different sources. "
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Cascade
         *
         * TLDR: The order is (lowest to highest)
         *  - Normal Declarations
         *  - Animations
         *  - Important Declarations
         *  - Transitions
         */

        // This loops over the declarations, calculates the values, and applies them to the correct props
        // E.g ["color", "red"] -> { color: "red" }
        // processDeclarations(
        //   propState,
        //   propState.declarations,
        //   props,
        //   normalizedProps,
        //   delayedValues,
        // );

        // Same as processDeclarations, but for animations (working with SharedValues)
        // processAnimations(props, normalizedProps, seenAnimatedProps, propState);

        // Important declarations are applied after normal declarations and animations
        // processDeclarations(
        //   propState,
        //   propState.importantDeclarations,
        //   props,
        //   normalizedProps,
        //   delayedValues,
        // );

        // Some declarations will have values that had dependencies on other styles
        // e.g
        //  - lineHeight: '2rem' depends on the fontSize
        //  - color: var(--theme-fg) depends on the --theme-fg variable that could be present
        for (const delayed of delayedValues) {
          delayed();
        }

        // Look at what has changed between renders, replace their values with SharedValues
        // that interpolate between the old and new values
        // processTransition(props, normalizedProps, seenAnimatedProps, propState);

        // Animations and Transitions screw with things. Once an component has been upgraded to an
        // animated component, some of its props will be SharedValues. We need to keep these props
        // as shared values.
        // retainSharedValues(props, normalizedProps, seenAnimatedProps, propState);

        // Moves styles to the correct props
        // { style: { fill: 'red' } -> { fill: 'red' }
        // nativeStyleToProp(props, config);

        // We changed while not rerendering (e.g from a Media Query), so we need to notify React
        if (!isRendering) {
          componentState.rerender();
        }

        // Mutate the propState with the new props
        console.log('REF: ', propState.refs.props);
        propState.props = propState.refs.props ?? {};
      },
    },
  };
  return propState;
}

export function createComponentSheet(entries: SheetEntry[] = [], context: StyledContext) {
  const sheet = getSheetEntryStyles(entries, context);
  return {
    getChildStyles,
    getStyles,
    sheet,
    metadata: {
      isGroupParent: entries.some((x) => x.className == 'group'),
      hasGroupEvents: Object.keys(sheet.group).length > 0,
      hasPointerEvents: Object.keys(sheet.pointer).length > 0,
    },
  };
  function getStyles(input: SheetInteractionState) {
    const styles: AnyStyle = { ...sheet.base };
    if (input.isPointerActive) Object.assign(styles, { ...sheet.pointer });
    if (input.isParentActive) Object.assign(styles, { ...sheet.group });
    return styles;
  }

  function getChildStyles(input: GetChildStylesArgs) {
    const result: AnyStyle = {};
    if (input.isFirstChild) {
      Object.assign(result, sheet.first);
    }
    if (input.isLastChild) {
      Object.assign(result, sheet.last);
    }
    if (input.isEven) {
      Object.assign(result, sheet.even);
    }
    if (input.isOdd) {
      Object.assign(result, sheet.odd);
    }
    return Object.freeze(result);
  }
}

function getSheetEntryStyles(entries: SheetEntry[] = [], context: StyledContext) {
  return entries.reduce(
    (prev, current) => {
      const validRule = isApplicativeRule(current.selectors, context);
      if (!validRule) return prev;
      let nextDecl = composeDeclarations(current.declarations, context);
      const group = getRuleSelectorGroup(current.selectors);
      if (nextDecl.transform && prev[group].transform) {
        nextDecl.transform = [...(prev[group].transform as any), ...nextDecl.transform];
      }
      Object.assign(prev[group], nextDecl);
      return prev;
    },
    {
      base: {},
      even: {},
      first: {},
      group: {},
      last: {},
      odd: {},
      pointer: {},
    } as FinalSheet,
  );
}

function composeDeclarations(declarations: SheetEntryDeclaration[], context: StyledContext) {
  return declarations.reduce((prev, current) => {
    let value: any = current.value;
    if (Array.isArray(current.value)) {
      value = [];
      for (const t of current.value) {
        if (typeof t.value == 'string') {
          value.push({
            [t.prop]: parseCssValue(t.prop, t.value, {
              rem: tw.config.root?.rem ?? context.units.rem,
              deviceHeight: context.deviceHeight,
              deviceWidth: context.deviceWidth,
            }),
          });
        }
      }
      Object.assign(prev, {
        transform: [...(prev['transform'] ?? []), ...value],
      });
      return prev;
    }
    if (typeof value == 'string') {
      value = parseCssValue(current.prop, value, {
        rem: tw.config.root?.rem ?? context.units.rem,
        deviceHeight: context.deviceHeight,
        deviceWidth: context.deviceWidth,
      });
    }
    if (typeof value == 'object') {
      Object.assign(prev, value);
    } else {
      Object.assign(prev, {
        [current.prop]: value,
      });
    }

    return prev;
  }, {} as AnyStyle);
}

const platformVariants = ['web', 'native', 'ios', 'android'];
function isApplicativeRule(variants: string[], context: StyledContext) {
  if (variants.length == 0) return true;
  const screens = tw.theme('screens');
  for (let v of variants) {
    v = v.replace('&:', '');
    if (platformVariants.includes(v)) {
      if (v == 'web' && Platform.OS != 'web') return false;
      if (v == 'native' && Platform.OS == 'web') return false;
      if (v == 'ios' && Platform.OS != 'ios') return false;
      if (v == 'android' && Platform.OS != 'android') return false;
    }
    if (v in screens) {
      tw.theme('screens');
      const width = context.deviceWidth;
      const value = screens[v].replace('px', '');
      if (typeof value == 'string' && width >= Number(value)) {
        return false;
      }
      if (typeof value == 'object') {
        if ('raw' in value && !(width >= value.raw)) {
          return false;
        }
        if (value.max && value.min && !(width <= value.max && width >= value.min))
          return false;
        if (value.max && !(width <= value.max)) return false;
        if (value.min && !(width >= value.min)) return false;
      }
    }
  }
  return true;
}

export function createStyledContext(units: Pick<Units, 'rem' | 'vh' | 'vw'>): StyledContext {
  const vw = units.vw ?? 1;
  const vh = units.vh ?? 1;
  return {
    colorScheme: Appearance.getColorScheme()!,
    deviceAspectRatio: vw / vh,
    deviceHeight: vh,
    deviceWidth: vw,
    orientation: vw > vh ? 'landscape' : 'portrait',
    resolution: PixelRatio.getPixelSizeForLayoutSize(vw),
    fontScale: PixelRatio.getFontScale(),
    platform: Platform.OS,
    units: {
      rem: units.rem,
      em: units.rem,
      cm: 37.8,
      mm: 3.78,
      in: 96,
      pt: 1.33,
      pc: 16,
      px: 1,
      vmin: vw < vh ? vw : vh,
      vmax: vw > vh ? vw : vh,
      vw,
      vh,
    },
  };
}
