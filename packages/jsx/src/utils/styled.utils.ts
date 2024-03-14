// @ts-noCheck
import { tw } from '@native-twin/core';
import { CompleteStyle } from '@native-twin/css';
import { createComponentSheet, StyleSheet } from '../sheet/StyleSheet';
import { ComponentConfig, PropState, StyledComponentState } from '../types/styled.types';
import { cleanupEffect, observable } from './observable';
import { externalCallbackRef, nativeStyleToProp } from './react.utils';

export function createPropState(
  componentState: StyledComponentState,
  config: ComponentConfig,
) {
  let componentSheet = createComponentSheet([], StyleSheet.runtimeContext);
  const propState: PropState = {
    // What is the source prop? e.g className
    source: config.source,
    // WHat is the target prop? e.g style
    target: config.target,
    // These are object references from the parent component
    // They should never be replaced, only mutated
    // upgrades: componentState.upgrades,
    interaction: componentState.interaction,
    refs: componentState.refs,
    testID: componentState.refs.props?.['testID'],
    sheet: componentSheet,

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
          const entries = tw(`${classNames}`);
          componentSheet = createComponentSheet(entries, StyleSheet.runtimeContext);
          if (componentSheet.metadata.hasPointerEvents) {
            componentState.interaction.active ??= observable(false);
            componentState.interaction.hover ??= observable(false);
            componentState.interaction.focus ??= observable(false);
          }

          propState.refs.props = {
            ...propState.refs.props,
            [propState.target]: componentSheet.getStyles({
              isParentActive: false,
              isPointerActive:
                (!!componentState.interaction.active &&
                  componentState.interaction.active.get()) ||
                (!!componentState.interaction.hover &&
                  componentState.interaction.hover.get()) ||
                (!!componentState.interaction.active &&
                  componentState.interaction.active.get()),
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
        let props: Record<string, any> = {};
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
        props = propState.props ?? props;
        nativeStyleToProp(props ?? props, config);

        // We changed while not rerendering (e.g from a Media Query), so we need to notify React
        if (!isRendering) {
          componentState.rerender();
        }

        // Mutate the propState with the new props
        propState.props = props ?? {};
      },
    },
  };
  return propState;
}
