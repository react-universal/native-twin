// @ts-nocheck

function unsupportedCssPropertyWarn(property: string) {
  console.warn(`Unsupported property found: ${property}`);
}

function getDeclarationParser(property: string, value: string) {
  switch (declaration.property) {
    case 'background-color':
      // return addStyleProp(declaration.property, parseColor(declaration.value));
      return;
    case 'background-image':
      unsupportedCssPropertyWarn(property);
      return;
    case 'background-position-x':
      unsupportedCssPropertyWarn(property);
      return;
    case 'background-position-y':
      unsupportedCssPropertyWarn(property);
      return;
    case 'background-position':
      unsupportedCssPropertyWarn(property);
      return;
    case 'background-size':
      unsupportedCssPropertyWarn(property);
      return;
    case 'background-repeat':
      unsupportedCssPropertyWarn(property);
      return;
    case 'background-attachment':
      unsupportedCssPropertyWarn(property);
      return;
    case 'background-clip':
      unsupportedCssPropertyWarn(property);
      return;
    case 'background-origin':
      unsupportedCssPropertyWarn(property);
      return;
    case 'background':
      return;
    case 'box-shadow':
      return;
    case 'opacity':
    // return addStyleProp(declaration.property, declaration.value);
    case 'color':
      // return addStyleProp(declaration.property, parseColor(declaration.value));
      break;
    case 'display':
      if (declaration.value.type === 'keyword' && declaration.value.value === 'none') {
        addStyleProp(declaration.property, declaration.value.value);
      } else if (
        declaration.value.type === 'pair' &&
        declaration.value.inside.type === 'flex'
      ) {
        addStyleProp(declaration.property, declaration.value.inside.type);
      }
      return;
    case 'visibility':
      // Might be possible to polyfill this with opacity 0 and to disable event handlers
      return;
    case 'width':
      return addStyleProp(declaration.property, parseSize(declaration.value, options));
    case 'height':
      return addStyleProp(declaration.property, parseSize(declaration.value, options));
    case 'min-width':
      return addStyleProp(declaration.property, parseSize(declaration.value, options));
    case 'min-height':
      return addStyleProp(declaration.property, parseSize(declaration.value, options));
    case 'max-width':
      return addStyleProp(declaration.property, parseSize(declaration.value, options));
    case 'max-height':
      return addStyleProp(declaration.property, parseSize(declaration.value, options));
    case 'block-size':
      return addStyleProp('width', parseSize(declaration.value, options));
    case 'inline-size':
      return addStyleProp('height', parseSize(declaration.value, options));
    case 'min-block-size':
      return addStyleProp('min-width', parseSize(declaration.value, options));
    case 'min-inline-size':
      return addStyleProp('min-height', parseSize(declaration.value, options));
    case 'max-block-size':
      return addStyleProp('max-width', parseSize(declaration.value, options));
    case 'max-inline-size':
      return addStyleProp('max-height', parseSize(declaration.value, options));
    case 'box-sizing':
      return;
    case 'overflow':
      return addStyleProp(declaration.property, parseOverflow(declaration.value.x));
    case 'overflow-x':
      return;
    case 'overflow-y':
      return;
    case 'text-overflow':
      return;
    case 'position':
      // Position works differently on web and native
      return;
    case 'top':
      return addStyleProp(declaration.property, parseSize(declaration.value, options));
    case 'bottom':
      return addStyleProp(declaration.property, parseSize(declaration.value, options));
    case 'left':
      return addStyleProp(declaration.property, parseSize(declaration.value, options));
    case 'right':
      return addStyleProp(declaration.property, parseSize(declaration.value, options));
    case 'inset-block-start':
      return addStyleProp(
        declaration.property,
        parseLengthPercentageOrAuto(declaration.value, options),
      );
    case 'inset-block-end':
      return addStyleProp(
        declaration.property,
        parseLengthPercentageOrAuto(declaration.value, options),
      );
    case 'inset-inline-start':
      return addStyleProp(
        declaration.property,
        parseLengthPercentageOrAuto(declaration.value, options),
      );
    case 'inset-inline-end':
      return addStyleProp(
        declaration.property,
        parseLengthPercentageOrAuto(declaration.value, options),
      );
    case 'inset-block':
      addStyleProp(
        'inset-block-start',
        parseLengthPercentageOrAuto(declaration.value.blockStart, options),
        { shortHand: true },
      );
      addStyleProp(
        'inset-block-end',
        parseLengthPercentageOrAuto(declaration.value.blockEnd, options),
        { shortHand: true },
      );
      return;
    case 'inset-inline':
      addStyleProp(
        'inset-block-start',
        parseLengthPercentageOrAuto(declaration.value.inlineStart, options),
        { shortHand: true },
      );
      addStyleProp(
        'inset-block-end',
        parseLengthPercentageOrAuto(declaration.value.inlineEnd, options),
        { shortHand: true },
      );
      return;
    case 'inset':
      addStyleProp('top', parseLengthPercentageOrAuto(declaration.value.top, options), {
        shortHand: true,
      });
      addStyleProp('bottom', parseLengthPercentageOrAuto(declaration.value.bottom, options), {
        shortHand: true,
      });
      addStyleProp('left', parseLengthPercentageOrAuto(declaration.value.left, options), {
        shortHand: true,
      });
      addStyleProp('right', parseLengthPercentageOrAuto(declaration.value.right, options), {
        shortHand: true,
      });
      return;
    case 'border-spacing':
      return;
    case 'border-top-color':
      return addStyleProp(declaration.property, parseColor(declaration.value));
    case 'border-bottom-color':
      return addStyleProp(declaration.property, parseColor(declaration.value));
    case 'border-left-color':
      return addStyleProp(declaration.property, parseColor(declaration.value));
    case 'border-right-color':
      return addStyleProp(declaration.property, parseColor(declaration.value));
    case 'border-block-start-color':
      return addStyleProp('border-top-color', parseColor(declaration.value));
    case 'border-block-end-color':
      return addStyleProp('border-bottom-color', parseColor(declaration.value));
    case 'border-inline-start-color':
      return addStyleProp('border-left-color', parseColor(declaration.value));
    case 'border-inline-end-color':
      return addStyleProp('border-right-color', parseColor(declaration.value));
    case 'border-top-style':
      return;
    case 'border-bottom-style':
      return;
    case 'border-left-style':
      return;
    case 'border-right-style':
      return;
    case 'border-block-start-style':
      return;
    case 'border-block-end-style':
      return;
    case 'border-inline-start-style':
      return;
    case 'border-inline-end-style':
      return;
    case 'border-top-width':
      return addStyleProp(
        declaration.property,
        parseBorderSideWidth(declaration.value, options),
      );
    case 'border-bottom-width':
      return addStyleProp(
        declaration.property,
        parseBorderSideWidth(declaration.value, options),
      );
    case 'border-left-width':
      return addStyleProp(
        declaration.property,
        parseBorderSideWidth(declaration.value, options),
      );
    case 'border-right-width':
      return addStyleProp(
        declaration.property,
        parseBorderSideWidth(declaration.value, options),
      );
    case 'border-block-start-width':
      return addStyleProp(
        'border-top-width',
        parseBorderSideWidth(declaration.value, options),
      );
    case 'border-block-end-width':
      return addStyleProp(
        'border-bottom-width',
        parseBorderSideWidth(declaration.value, options),
      );
    case 'border-inline-start-width':
      return addStyleProp(
        'border-left-width',
        parseBorderSideWidth(declaration.value, options),
      );
    case 'border-inline-end-width':
      return addStyleProp(
        'border-right-width',
        parseBorderSideWidth(declaration.value, options),
      );
    case 'border-top-left-radius':
      return addStyleProp(declaration.property, parseLength(declaration.value[0], options));
    case 'border-top-right-radius':
      return addStyleProp(declaration.property, parseLength(declaration.value[0], options));
    case 'border-bottom-left-radius':
      return addStyleProp(declaration.property, parseLength(declaration.value[0], options));
    case 'border-bottom-right-radius':
      return addStyleProp(declaration.property, parseLength(declaration.value[0], options));
    case 'border-start-start-radius':
      return addStyleProp(declaration.property, parseLength(declaration.value[0], options));
    case 'border-start-end-radius':
      return addStyleProp(declaration.property, parseLength(declaration.value[0], options));
    case 'border-end-start-radius':
      return addStyleProp(declaration.property, parseLength(declaration.value[0], options));
    case 'border-end-end-radius':
      return addStyleProp(declaration.property, parseLength(declaration.value[0], options));
    case 'border-radius':
      addStyleProp(
        'border-bottom-left-radius',
        parseLength(declaration.value.bottomLeft[0], options),
        { shortHand: true },
      );
      addStyleProp(
        'border-bottom-right-radius',
        parseLength(declaration.value.bottomRight[0], options),
        { shortHand: true },
      );
      addStyleProp(
        'border-top-left-radius',
        parseLength(declaration.value.topLeft[0], options),
        { shortHand: true },
      );
      addStyleProp(
        'border-top-right-radius',
        parseLength(declaration.value.topRight[0], options),
        { shortHand: true },
      );
      return;
    case 'border-image-source':
      return;
    case 'border-image-outset':
      return;
    case 'border-image-repeat':
      return;
    case 'border-image-width':
      return;
    case 'border-image-slice':
      return;
    case 'border-image':
      return;
    case 'border-color':
      addStyleProp('border-top-color', parseColor(declaration.value.top), {
        shortHand: true,
      });
      addStyleProp('border-bottom-color', parseColor(declaration.value.bottom), {
        shortHand: true,
      });
      addStyleProp('border-left-color', parseColor(declaration.value.left), {
        shortHand: true,
      });
      addStyleProp('border-right-color', parseColor(declaration.value.right), {
        shortHand: true,
      });
      return;
    case 'border-style':
      return addStyleProp(declaration.property, parseBorderStyle(declaration.value));
    case 'border-width':
      addStyleProp('border-top-width', parseBorderSideWidth(declaration.value.top, options), {
        shortHand: true,
      });
      addStyleProp(
        'border-bottom-width',
        parseBorderSideWidth(declaration.value.bottom, options),
        { shortHand: true },
      );
      addStyleProp(
        'border-left-width',
        parseBorderSideWidth(declaration.value.left, options),
        { shortHand: true },
      );
      addStyleProp(
        'border-right-width',
        parseBorderSideWidth(declaration.value.right, options),
        { shortHand: true },
      );
      return;
    case 'border-block-color':
      addStyleProp('border-top-color', parseColor(declaration.value.start));
      addStyleProp('border-bottom-color', parseColor(declaration.value.end));
      return;
    case 'border-block-style':
      return;
    case 'border-block-width':
      addStyleProp('border-top-width', parseBorderSideWidth(declaration.value.start, options));
      addStyleProp(
        'border-bottom-width',
        parseBorderSideWidth(declaration.value.end, options),
      );
      return;
    case 'border-inline-color':
      addStyleProp('border-left-color', parseColor(declaration.value.start));
      addStyleProp('border-right-color', parseColor(declaration.value.end));
      return;
    case 'border-inline-style':
      return;
    case 'border-inline-width':
      addStyleProp(
        'border-left-width',
        parseBorderSideWidth(declaration.value.start, options),
      );
      addStyleProp('border-right-width', parseBorderSideWidth(declaration.value.end, options));
      return;
    case 'border':
      addStyleProp('border-width', parseBorderSideWidth(declaration.value.width, options), {
        shortHand: true,
      });
      addStyleProp('border-style', parseBorderStyle(declaration.value.style), {
        shortHand: true,
      });
      return;
    case 'border-top':
      addStyleProp(declaration.property + '-color', parseColor(declaration.value.color));
      addStyleProp(
        declaration.property + '-width',
        parseBorderSideWidth(declaration.value.width, options),
      );
      return;
    case 'border-bottom':
      addStyleProp(declaration.property + '-color', parseColor(declaration.value.color));
      addStyleProp(
        declaration.property + '-width',
        parseBorderSideWidth(declaration.value.width, options),
      );
      return;
    case 'border-left':
      addStyleProp(declaration.property + '-color', parseColor(declaration.value.color));
      addStyleProp(
        declaration.property + '-width',
        parseBorderSideWidth(declaration.value.width, options),
      );
      return;
    case 'border-right':
      addStyleProp(declaration.property + '-color', parseColor(declaration.value.color));
      addStyleProp(
        declaration.property + '-width',
        parseBorderSideWidth(declaration.value.width, options),
      );
      return;
    case 'border-block':
      addStyleProp('border-top-color', parseColor(declaration.value.color));
      addStyleProp('border-bottom-color', parseColor(declaration.value.color));
      addStyleProp('border-top-width', parseBorderSideWidth(declaration.value.width, options));
      addStyleProp(
        'border-bottom-width',
        parseBorderSideWidth(declaration.value.width, options),
      );
      return;
    case 'border-block-start':
      addStyleProp('border-top-color', parseColor(declaration.value.color));
      addStyleProp('border-top-width', parseBorderSideWidth(declaration.value.width, options));
      return;
    case 'border-block-end':
      addStyleProp('border-bottom-color', parseColor(declaration.value.color));
      addStyleProp(
        'border-bottom-width',
        parseBorderSideWidth(declaration.value.width, options),
      );
      return;
    case 'border-inline':
      addStyleProp('border-left-color', parseColor(declaration.value.color));
      addStyleProp('border-right-color', parseColor(declaration.value.color));
      addStyleProp(
        'border-left-width',
        parseBorderSideWidth(declaration.value.width, options),
      );
      addStyleProp(
        'border-right-width',
        parseBorderSideWidth(declaration.value.width, options),
      );
      return;
    case 'border-inline-start':
      addStyleProp('border-left-color', parseColor(declaration.value.color));
      addStyleProp(
        'border-left-width',
        parseBorderSideWidth(declaration.value.width, options),
      );
      return;
    case 'border-inline-end':
      addStyleProp('border-right-color', parseColor(declaration.value.color));
      addStyleProp(
        'border-right-width',
        parseBorderSideWidth(declaration.value.width, options),
      );
      return;
    case 'outline':
      unsupportedCssPropertyWarn(property);
      return;
    case 'outline-color':
      unsupportedCssPropertyWarn(property);
      return;
    case 'outline-style':
      unsupportedCssPropertyWarn(property);
      return;
    case 'outline-width':
      unsupportedCssPropertyWarn(property);
      return;
    case 'flex-direction':
      return addStyleProp(declaration.property, declaration.value);
    case 'flex-wrap':
      return addStyleProp(declaration.property, declaration.value);
    case 'flex-flow':
      addStyleProp('flexWrap', declaration.value.wrap);
      addStyleProp('flexDirection', declaration.value.direction);
      break;
    case 'flex-grow':
      return addStyleProp(declaration.property, declaration.value);
    case 'flex-shrink':
      return addStyleProp(declaration.property, declaration.value);
    case 'flex-basis':
      return addStyleProp(
        declaration.property,
        parseLengthPercentageOrAuto(declaration.value, options),
      );
    case 'flex':
      addStyleProp('flex-grow', declaration.value.grow);
      addStyleProp('flex-shrink', declaration.value.shrink);
      addStyleProp(
        'flex-basis',
        parseLengthPercentageOrAuto(declaration.value.basis, options),
      );
      break;
    case 'order':
      unsupportedCssPropertyWarn(property);
      return;
    case 'align-content':
      return addStyleProp(declaration.property, parseAlignContent(declaration.value));
    case 'justify-content':
      return addStyleProp(declaration.property, parseJustifyContent(declaration.value));
    case 'place-content':
      unsupportedCssPropertyWarn(property);
      return;
    case 'align-self':
      return addStyleProp(declaration.property, parseAlignSelf(declaration.value));
    case 'justify-self':
      unsupportedCssPropertyWarn(property);
      return;
    case 'place-self':
      unsupportedCssPropertyWarn(property);
      return;
    case 'align-items':
      return addStyleProp(declaration.property, parseAlignItems(declaration.value));
    case 'justify-items':
      unsupportedCssPropertyWarn(property);
      return;
    case 'place-items':
      return;
    case 'row-gap':
      return addStyleProp('row-gap', parseGap(declaration.value, options));
    case 'column-gap':
      return addStyleProp('row-gap', parseGap(declaration.value, options));
    case 'gap':
      addStyleProp('row-gap', parseGap(declaration.value.row, options));
      addStyleProp('column-gap', parseGap(declaration.value.column, options));
      return;
    case 'box-orient':
      return;
    case 'box-direction':
      return;
    case 'box-ordinal-group':
      return;
    case 'box-align':
      return;
    case 'box-flex':
      return;
    case 'box-flex-group':
      return;
    case 'box-pack':
      return;
    case 'box-lines':
      return;
    case 'flex-pack':
      return;
    case 'flex-order':
      return;
    case 'flex-align':
      return;
    case 'flex-item-align':
      return;
    case 'flex-line-pack':
      return;
    case 'flex-positive':
      return;
    case 'flex-negative':
      return;
    case 'flex-preferred-size':
      return;
    case 'grid-template-columns':
      return;
    case 'grid-template-rows':
      return;
    case 'grid-auto-columns':
      return;
    case 'grid-auto-rows':
      return;
    case 'grid-auto-flow':
      return;
    case 'grid-template-areas':
      return;
    case 'grid-template':
      return;
    case 'grid':
      return;
    case 'grid-row-start':
      return;
    case 'grid-row-end':
      return;
    case 'grid-column-start':
      return;
    case 'grid-column-end':
      return;
    case 'grid-row':
      return;
    case 'grid-column':
      return;
    case 'grid-area':
      return;
    case 'margin-top':
      return addStyleProp(declaration.property, parseSize(declaration.value, options));
    case 'margin-bottom':
      return addStyleProp(declaration.property, parseSize(declaration.value, options));
    case 'margin-left':
      return addStyleProp(declaration.property, parseSize(declaration.value, options));
    case 'margin-right':
      return addStyleProp(declaration.property, parseSize(declaration.value, options));
    case 'margin-block-start':
      return addStyleProp(
        declaration.property,
        parseLengthPercentageOrAuto(declaration.value, options),
      );
    case 'margin-block-end':
      return addStyleProp(
        declaration.property,
        parseLengthPercentageOrAuto(declaration.value, options),
      );
    case 'margin-inline-start':
      return addStyleProp(
        declaration.property,
        parseLengthPercentageOrAuto(declaration.value, options),
      );
    case 'margin-inline-end':
      return addStyleProp(
        declaration.property,
        parseLengthPercentageOrAuto(declaration.value, options),
      );
    case 'margin-block':
      addStyleProp(
        declaration.property + '-start',
        parseLengthPercentageOrAuto(declaration.value.blockStart, options),
        { shortHand: true },
      );
      addStyleProp(
        declaration.property + '-end',
        parseLengthPercentageOrAuto(declaration.value.blockEnd, options),
        { shortHand: true },
      );
      return;
    case 'margin-inline':
      addStyleProp(
        declaration.property + '-start',
        parseLengthPercentageOrAuto(declaration.value.inlineStart, options),
        { shortHand: true },
      );
      addStyleProp(
        declaration.property + '-end',
        parseLengthPercentageOrAuto(declaration.value.inlineEnd, options),
        { shortHand: true },
      );
      return;
    case 'margin':
      addStyleProp('margin-top', parseSize(declaration.value.top, options));
      addStyleProp('margin-left', parseSize(declaration.value.left, options));
      addStyleProp('margin-right', parseSize(declaration.value.right, options));
      addStyleProp('margin-bottom', parseSize(declaration.value.bottom, options));
      return;
    case 'padding-top':
      return addStyleProp(declaration.property, parseSize(declaration.value, options));
    case 'padding-bottom':
      return addStyleProp(declaration.property, parseSize(declaration.value, options));
    case 'padding-left':
      return addStyleProp(declaration.property, parseSize(declaration.value, options));
    case 'padding-right':
      return addStyleProp(declaration.property, parseSize(declaration.value, options));
    case 'padding-block-start':
      return addStyleProp(
        declaration.property,
        parseLengthPercentageOrAuto(declaration.value, options),
      );
    case 'padding-block-end':
      return addStyleProp(
        declaration.property,
        parseLengthPercentageOrAuto(declaration.value, options),
      );
    case 'padding-inline-start':
      return addStyleProp(
        declaration.property,
        parseLengthPercentageOrAuto(declaration.value, options),
      );
    case 'padding-inline-end':
      return addStyleProp(
        declaration.property,
        parseLengthPercentageOrAuto(declaration.value, options),
      );
    case 'padding-block':
      addStyleProp(
        declaration.property + '-start',
        parseLengthPercentageOrAuto(declaration.value.blockStart, options),
        { shortHand: true },
      );
      addStyleProp(
        declaration.property + '-end',
        parseLengthPercentageOrAuto(declaration.value.blockEnd, options),
        { shortHand: true },
      );
      return;
    case 'padding-inline':
      addStyleProp(
        declaration.property + '-start',
        parseLengthPercentageOrAuto(declaration.value.inlineStart, options),
        { shortHand: true },
      );
      addStyleProp(
        declaration.property + '-end',
        parseLengthPercentageOrAuto(declaration.value.inlineEnd, options),
        { shortHand: true },
      );
      break;
    case 'padding':
      addStyleProp('padding-top', parseSize(declaration.value.top, options));
      addStyleProp('padding-left', parseSize(declaration.value.left, options));
      addStyleProp('padding-right', parseSize(declaration.value.right, options));
      addStyleProp('paddingBottom', parseSize(declaration.value.bottom, options));
      break;
    case 'scroll-margin-top':
    case 'scroll-margin-bottom':
    case 'scroll-margin-left':
    case 'scroll-margin-right':
    case 'scroll-margin-block-start':
    case 'scroll-margin-block-end':
    case 'scroll-margin-inline-start':
    case 'scroll-margin-inline-end':
    case 'scroll-margin-block':
    case 'scroll-margin-inline':
    case 'scroll-margin':
    case 'scroll-padding-top':
    case 'scroll-padding-bottom':
    case 'scroll-padding-left':
    case 'scroll-padding-right':
    case 'scroll-padding-block-start':
    case 'scroll-padding-block-end':
    case 'scroll-padding-inline-start':
    case 'scroll-padding-inline-end':
    case 'scroll-padding-block':
    case 'scroll-padding-inline':
    case 'scroll-padding':
      return;
    case 'font-weight':
      return addStyleProp(declaration.property, parseFontWeight(declaration.value));
    case 'font-size':
      return addStyleProp(declaration.property, parseFontSize(declaration.value, options));
    case 'font-stretch':
      return;
    case 'font-family':
      return addStyleProp(declaration.property, parseFontFamily(declaration.value));
    case 'font-style':
      return addStyleProp(declaration.property, parseFontStyle(declaration.value));
    case 'font-variant-caps':
      return addStyleProp(declaration.property, parseFontVariantCaps(declaration.value));
    case 'line-height':
      return addStyleProp(declaration.property, parseLineHeight(declaration.value, options));
    case 'font':
      addStyleProp(
        declaration.property + '-family',
        parseFontFamily(declaration.value.family),
        { shortHand: true },
      );
      addStyleProp('line-height', parseLineHeight(declaration.value.lineHeight, options), {
        shortHand: true,
      });
      addStyleProp(
        declaration.property + '-size',
        parseFontSize(declaration.value.size, options),
        { shortHand: true },
      );
      addStyleProp(declaration.property + '-style', parseFontStyle(declaration.value.style), {
        shortHand: true,
      });

      addStyleProp(
        declaration.property + '-variant',
        parseFontVariantCaps(declaration.value.variantCaps),
        { shortHand: true },
      );
      addStyleProp(
        declaration.property + '-weight',
        parseFontWeight(declaration.value.weight),
        { shortHand: true },
      );
      return;
    case 'vertical-align':
      return addStyleProp(declaration.property, parseVerticalAlign(declaration.value));
    case 'font-palette':
      return;
    case 'transition-property':
    case 'transition-duration':
    case 'transition-delay':
    case 'transition-timing-function':
    case 'transition':
      return addTransitionProp(declaration);
    case 'animation-duration':
    case 'animation-timing-function':
    case 'animation-iteration-count':
    case 'animation-direction':
    case 'animation-play-state':
    case 'animation-delay':
    case 'animation-fill-mode':
    case 'animation-name':
    case 'animation':
      return addAnimationProp(declaration.property, declaration.value);
    case 'transform': {
      const transforms: TransformRecord[] = [];

      for (const transform of declaration.value) {
        switch (transform.type) {
          case 'perspective':
            transforms.push({
              [transform.type]: parseLength(transform.value, options) as number,
            });
            break;
          case 'translateX':
          case 'scaleX':
            transforms.push({
              [transform.type]: parseLengthOrCoercePercentageToRuntime(
                transform.value,
                'cw',
                options,
              ) as number,
            });
            break;
          case 'translateY':
          case 'scaleY':
            transforms.push({
              [transform.type]: parseLengthOrCoercePercentageToRuntime(
                transform.value,
                'ch',
                options,
              ) as number,
            });
            break;
          case 'rotate':
          case 'rotateX':
          case 'rotateY':
          case 'rotateZ':
          case 'skewX':
          case 'skewY':
            transforms.push({ [transform.type]: parseAngle(transform.value) });
            break;
          case 'translate':
            transforms.push({
              translateX: parseLength(transform.value[0], options) as number,
            });
            transforms.push({
              translateY: parseLength(transform.value[1], options) as number,
            });
            break;
          case 'scale':
            transforms.push({
              scaleX: parseLength(transform.value[0], options) as number,
            });
            transforms.push({
              scaleY: parseLength(transform.value[1], options) as number,
            });
            break;
          case 'skew':
            transforms.push({ skewX: parseAngle(transform.value[0]) });
            transforms.push({ skewY: parseAngle(transform.value[1]) });
            break;
          case 'translateZ':
          case 'translate3d':
          case 'scaleZ':
          case 'scale3d':
          case 'rotate3d':
          case 'matrix':
          case 'matrix3d':
            break;
        }
      }

      return addStyleProp(declaration.property, transforms);
    }
    case 'transform-origin':
      return;
    case 'transform-style':
      return;
    case 'transform-box':
      return;
    case 'backface-visibility':
      return;
    case 'perspective':
      return;
    case 'perspective-origin':
      return;
    case 'translate':
      return addStyleProp(
        'transform',
        [{ translateX: declaration.value.x }, { translateY: declaration.value.y }],
        { append: true },
      );
    case 'rotate':
      return addStyleProp(
        'transform',
        [
          { rotateX: declaration.value.x },
          { rotateY: declaration.value.y },
          { rotateY: declaration.value.z },
        ],
        { append: true },
      );
    case 'scale':
      return addStyleProp(
        'transform',
        [
          { scaleX: parseLength(declaration.value.x, options) },
          { scaleY: parseLength(declaration.value.y, options) },
        ],
        { append: true },
      );
    case 'text-transform':
      return addStyleProp(declaration.property, declaration.value.case);
    case 'white-space':
      return;
    case 'tab-size':
      return;
    case 'word-break':
      return;
    case 'line-break':
      return;
    case 'hyphens':
      return;
    case 'overflow-wrap':
      return;
    case 'word-wrap':
      return;
    case 'text-align':
      return;
    case 'text-align-last':
      return;
    case 'text-justify':
      return;
    case 'word-spacing':
      return;
    case 'letter-spacing':
      if (declaration.value.type !== 'normal') {
        return addStyleProp(
          declaration.property,
          parseLength(declaration.value.value, options),
        );
      }
      return;
    case 'text-indent':
      return;
    case 'text-decoration-line':
      return addStyleProp(declaration.property, parseTextDecorationLine(declaration.value));
    case 'text-decoration-style':
      return;
    case 'text-decoration-color':
      return addStyleProp(declaration.property, parseColor(declaration.value));
    case 'text-decoration-thickness':
      if (declaration.value.type === 'length-percentage') {
        return addStyleProp(
          declaration.property,
          parseLength(declaration.value.value, options),
        );
      }
      return;
    case 'text-decoration':
      addStyleProp('text-decoration-color', parseColor(declaration.value.color));
      addStyleProp('text-decoration-line', parseTextDecorationLine(declaration.value.line));
      if (declaration.value.thickness.type === 'length-percentage') {
        addStyleProp(
          declaration.property,
          parseLength(declaration.value.thickness.value, options),
        );
      }
      return;
    case 'text-decoration-skip-ink':
      return;
    case 'text-emphasis-style':
      return;
    case 'text-emphasis-color':
      return;
    case 'text-emphasis':
      return;
    case 'text-emphasis-position':
      return;
    case 'text-shadow':
      return parseTextShadow(declaration.value, addStyleProp, options);
    case 'box-decoration-break':
    case 'resize':
    case 'cursor':
    case 'caret-color':
    case 'caret-shape':
    case 'caret':
    case 'user-select':
    case 'accent-color':
    case 'appearance':
    case 'list-style-type':
    case 'list-style-image':
    case 'list-style-position':
    case 'list-style':
    case 'marker-side':
    case 'composes':
    case 'fill':
    case 'fill-rule':
    case 'fill-opacity':
    case 'stroke':
    case 'stroke-opacity':
    case 'stroke-width':
    case 'stroke-linecap':
    case 'stroke-linejoin':
    case 'stroke-miterlimit':
    case 'stroke-dasharray':
    case 'stroke-dashoffset':
    case 'marker-start':
    case 'marker-mid':
    case 'marker-end':
    case 'marker':
    case 'color-interpolation':
    case 'color-interpolation-filters':
    case 'color-rendering':
    case 'shape-rendering':
    case 'text-rendering':
    case 'image-rendering':
    case 'clip-path':
    case 'clip-rule':
    case 'mask-image':
    case 'mask-mode':
    case 'mask-repeat':
    case 'mask-position-x':
    case 'mask-position-y':
    case 'mask-position':
    case 'mask-clip':
    case 'mask-origin':
    case 'mask-size':
    case 'mask-composite':
    case 'mask-type':
    case 'mask':
    case 'mask-border-source':
    case 'mask-border-mode':
    case 'mask-border-slice':
    case 'mask-border-width':
    case 'mask-border-outset':
    case 'mask-border-repeat':
    case 'mask-border':
    case '-webkit-mask-composite':
    case 'mask-source-type':
    case 'mask-box-image':
    case 'mask-box-image-source':
    case 'mask-box-image-slice':
    case 'mask-box-image-width':
    case 'mask-box-image-outset':
    case 'mask-box-image-repeat':
    case 'filter':
    case 'backdrop-filter':
      return;
    case 'z-index':
      if (declaration.value.type === 'integer') {
        addStyleProp(declaration.property, parseLength(declaration.value.value, options));
      }
      return;
    case 'container-type':
    case 'container-name':
    case 'container':
      return addContainerProp(declaration);
    default: {
      exhaustiveCheck(declaration);
    }
  }
}
