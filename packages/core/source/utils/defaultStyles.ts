import { TStyleObject } from '../store/styles/types';

const complete = (styles: TStyleObject['styles']): TStyleObject => {
  return { styles };
};

const defaultStyles = new Map<string, TStyleObject>();
const createDefaultStyles = () => {
  defaultStyles.set('aspect-square', complete({ aspectRatio: 1 }));
  defaultStyles.set(`aspect-video`, complete({ aspectRatio: 16 / 9 }));
  defaultStyles.set(`items-center`, complete({ alignItems: `center` }));
  defaultStyles.set(`items-start`, complete({ alignItems: `flex-start` }));
  defaultStyles.set(`items-end`, complete({ alignItems: `flex-end` }));
  defaultStyles.set(`items-baseline`, complete({ alignItems: `baseline` }));
  defaultStyles.set(`items-stretch`, complete({ alignItems: `stretch` }));
  defaultStyles.set(`justify-start`, complete({ justifyContent: `flex-start` }));
  defaultStyles.set(`justify-end`, complete({ justifyContent: `flex-end` }));
  defaultStyles.set(`justify-center`, complete({ justifyContent: `center` }));
  defaultStyles.set(`justify-between`, complete({ justifyContent: `space-between` }));
  defaultStyles.set(`justify-around`, complete({ justifyContent: `space-around` }));
  defaultStyles.set(`justify-evenly`, complete({ justifyContent: `space-evenly` }));
  defaultStyles.set(`content-start`, complete({ alignContent: `flex-start` }));
  defaultStyles.set(`content-end`, complete({ alignContent: `flex-end` }));
  defaultStyles.set(`content-between`, complete({ alignContent: `space-between` }));
  defaultStyles.set(`content-around`, complete({ alignContent: `space-around` }));
  defaultStyles.set(`content-stretch`, complete({ alignContent: `stretch` }));
  defaultStyles.set(`content-center`, complete({ alignContent: `center` }));
  defaultStyles.set(`self-auto`, complete({ alignSelf: `auto` }));
  defaultStyles.set(`self-start`, complete({ alignSelf: `flex-start` }));
  defaultStyles.set(`self-end`, complete({ alignSelf: `flex-end` }));
  defaultStyles.set(`self-center`, complete({ alignSelf: `center` }));
  defaultStyles.set(`self-stretch`, complete({ alignSelf: `stretch` }));
  defaultStyles.set(`self-baseline`, complete({ alignSelf: `baseline` }));
  defaultStyles.set(`direction-inherit`, complete({ direction: `inherit` }));
  defaultStyles.set(`direction-ltr`, complete({ direction: `ltr` }));
  defaultStyles.set(`direction-rtl`, complete({ direction: `rtl` }));
  defaultStyles.set(`hidden`, complete({ display: `none` }));
  defaultStyles.set(`flex`, complete({ display: `flex` }));
  defaultStyles.set(`flex-row`, complete({ flexDirection: `row` }));
  defaultStyles.set(`flex-row-reverse`, complete({ flexDirection: `row-reverse` }));
  defaultStyles.set(`flex-col`, complete({ flexDirection: `column` }));
  defaultStyles.set(`flex-col-reverse`, complete({ flexDirection: `column-reverse` }));
  defaultStyles.set(`flex-wrap`, complete({ flexWrap: `wrap` }));
  defaultStyles.set(`flex-wrap-reverse`, complete({ flexWrap: `wrap-reverse` }));
  defaultStyles.set(`flex-nowrap`, complete({ flexWrap: `nowrap` }));
  defaultStyles.set(`flex-auto`, complete({ flexGrow: 1, flexShrink: 1, flexBasis: `auto` }));
  defaultStyles.set(
    `flex-initial`,
    complete({ flexGrow: 0, flexShrink: 1, flexBasis: `auto` }),
  );
  defaultStyles.set(`flex-none`, complete({ flexGrow: 0, flexShrink: 0, flexBasis: `auto` }));
  defaultStyles.set(`overflow-hidden`, complete({ overflow: `hidden` }));
  defaultStyles.set(`overflow-visible`, complete({ overflow: `visible` }));
  defaultStyles.set(`overflow-scroll`, complete({ overflow: `scroll` }));
  defaultStyles.set(`absolute`, complete({ position: `absolute` }));
  defaultStyles.set(`relative`, complete({ position: `relative` }));
  defaultStyles.set(`italic`, complete({ fontStyle: `italic` }));
  defaultStyles.set(`not-italic`, complete({ fontStyle: `normal` }));
  defaultStyles.set(`flex-none`, complete({ flexGrow: 0, flexShrink: 0, flexBasis: `auto` }));
  defaultStyles.set(`overflow-hidden`, complete({ overflow: `hidden` }));
  defaultStyles.set(`overflow-visible`, complete({ overflow: `visible` }));
  defaultStyles.set(`overflow-scroll`, complete({ overflow: `scroll` }));
  defaultStyles.set(`absolute`, complete({ position: `absolute` }));
  defaultStyles.set(`relative`, complete({ position: `relative` }));
  defaultStyles.set(`italic`, complete({ fontStyle: `italic` }));
  defaultStyles.set(`not-italic`, complete({ fontStyle: `normal` }));
  // defaultStyles.set(`oldstyle-nums`, fontVariant(`oldstyle-nums`));
  // defaultStyles.set(`small-caps`, fontVariant(`small-caps`));
  // defaultStyles.set(`lining-nums`, fontVariant(`lining-nums`));
  // defaultStyles.set(`tabular-nums`, fontVariant(`tabular-nums`));
  // defaultStyles.set(`proportional-nums`, fontVariant(`proportional-nums`));
  defaultStyles.set(`font-thin`, complete({ fontWeight: `100` }));
  defaultStyles.set(`font-100`, complete({ fontWeight: `100` }));
  defaultStyles.set(`font-extralight`, complete({ fontWeight: `200` }));
  defaultStyles.set(`font-200`, complete({ fontWeight: `200` }));
  defaultStyles.set(`font-light`, complete({ fontWeight: `300` }));
  defaultStyles.set(`font-300`, complete({ fontWeight: `300` }));
  defaultStyles.set(`font-normal`, complete({ fontWeight: `normal` }));
  defaultStyles.set(`font-400`, complete({ fontWeight: `400` }));
  defaultStyles.set(`font-medium`, complete({ fontWeight: `500` }));
  defaultStyles.set(`font-500`, complete({ fontWeight: `500` }));
  defaultStyles.set(`font-semibold`, complete({ fontWeight: `600` }));
  defaultStyles.set(`font-600`, complete({ fontWeight: `600` }));
  defaultStyles.set(`font-bold`, complete({ fontWeight: `bold` }));
  defaultStyles.set(`font-700`, complete({ fontWeight: `700` }));
  defaultStyles.set(`font-extrabold`, complete({ fontWeight: `800` }));
  defaultStyles.set(`font-800`, complete({ fontWeight: `800` }));
  defaultStyles.set(`font-black`, complete({ fontWeight: `900` }));
  defaultStyles.set(`font-900`, complete({ fontWeight: `900` }));
  defaultStyles.set(`include-font-padding`, complete({ includeFontPadding: true }));
  defaultStyles.set(`remove-font-padding`, complete({ includeFontPadding: false }));
  defaultStyles.set(`max-w-none`, complete({ maxWidth: `99999%` }));
  defaultStyles.set(`text-left`, complete({ textAlign: `left` }));
  defaultStyles.set(`text-center`, complete({ textAlign: `center` }));
  defaultStyles.set(`text-right`, complete({ textAlign: `right` }));
  defaultStyles.set(`text-justify`, complete({ textAlign: `justify` }));
  defaultStyles.set(`text-auto`, complete({ textAlign: `auto` }));
  defaultStyles.set(`underline`, complete({ textDecorationLine: `underline` }));
  defaultStyles.set(`line-through`, complete({ textDecorationLine: `line-through` }));
  defaultStyles.set(`no-underline`, complete({ textDecorationLine: `none` }));
  defaultStyles.set(`uppercase`, complete({ textTransform: `uppercase` }));
  defaultStyles.set(`lowercase`, complete({ textTransform: `lowercase` }));
  defaultStyles.set(`capitalize`, complete({ textTransform: `capitalize` }));
  defaultStyles.set(`normal-case`, complete({ textTransform: `none` }));
  defaultStyles.set(`w-auto`, complete({ width: `auto` }));
  defaultStyles.set(`h-auto`, complete({ height: `auto` }));
  defaultStyles.set(`basis-auto`, complete({ flexBasis: `auto` }));
  defaultStyles.set(`flex-basis-auto`, complete({ flexBasis: `auto` }));
  defaultStyles.set(
    `shadow-sm`,
    complete({
      shadowOffset: { width: 1, height: 1 },
      shadowColor: `#000`,
      shadowRadius: 1,
      shadowOpacity: 0.025,
      elevation: 1,
    }),
  );
  defaultStyles.set(
    `shadow`,
    complete({
      shadowOffset: { width: 1, height: 1 },
      shadowColor: `#000`,
      shadowRadius: 1,
      shadowOpacity: 0.075,
      elevation: 2,
    }),
  );
  defaultStyles.set(
    `shadow-md`,
    complete({
      shadowOffset: { width: 1, height: 1 },
      shadowColor: `#000`,
      shadowRadius: 3,
      shadowOpacity: 0.125,
      elevation: 3,
    }),
  );
  defaultStyles.set(
    `shadow-lg`,
    complete({
      shadowOffset: { width: 1, height: 1 },
      shadowColor: `#000`,
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    }),
  );
  defaultStyles.set(
    `shadow-xl`,
    complete({
      shadowOffset: { width: 1, height: 1 },
      shadowColor: `#000`,
      shadowOpacity: 0.19,
      shadowRadius: 20,
      elevation: 12,
    }),
  );
  defaultStyles.set(
    `shadow-2xl`,
    complete({
      shadowOffset: { width: 1, height: 1 },
      shadowColor: `#000`,
      shadowOpacity: 0.25,
      shadowRadius: 30,
      elevation: 16,
    }),
  );
  defaultStyles.set(
    `shadow-none`,
    complete({
      shadowOffset: { width: 0, height: 0 },
      shadowColor: `#000`,
      shadowRadius: 0,
      shadowOpacity: 0,
      elevation: 0,
    }),
  );
};

export function getDefaultStyle(className: string) {
  if (defaultStyles.has(className)) {
    return defaultStyles.get(className);
  }
  return null;
}

if (defaultStyles.size === 0) {
  createDefaultStyles();
}
export default defaultStyles;

// function fontVariant(type: string) {
//   return {
//     complete(style) {
//       if (!style.fontVariant || !Array.isArray(style.fontVariant)) {
//         style.fontVariant = [];
//       }
//       style.fontVariant.push(type);
//     },
//   };
// }
