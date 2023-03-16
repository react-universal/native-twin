const routes = [
  {
    title: 'Overview',
    routes: [
      { label: 'Overview', route: '/' },
      { label: 'Installation', route: '/setup' },
    ],
  },
  {
    title: 'Quick Starts',
    routes: [
      { label: 'Expo / RN CLI', route: '/setup/native' },
      { label: 'Next.js', route: '/setup/nextjs' },
      { label: 'Vite', route: '/setup/vite' },
    ],
  },
  {
    title: 'Layout',
    routes: [
      { label: 'Aspect Ratio', route: '/layout/aspect-ratio' },
      { label: 'Container', route: '/layout/container' },
      { label: 'Display', route: '/layout/display' },
      { label: 'Overflow', route: '/layout/container' },
      { label: 'Position', route: '/layout/position' },
      { label: 'Top / Right / Bottom / Left', route: '/layout/align' },
      { label: 'z-index', route: '/layout/z-index' },
    ],
  },
  {
    title: 'Flexbox',
    routes: [
      { label: 'Flex Basis', route: '/flexbox/aspect-ratio' },
      { label: 'Flex Direction', route: '/flexbox/container' },
      { label: 'Flex Wrap', route: '/flexbox/display' },
      { label: 'Flex Grow', route: '/flexbox/container' },
      { label: 'Flex Shrink', route: '/flexbox/position' },
      { label: 'Gap', route: '/flexbox/gap' },
      { label: 'Justify Content', route: '/flexbox/justify' },
      { label: 'Align Content', route: '/flexbox/align-context' },
      { label: 'Align Items', route: '/flexbox/align-items' },
      { label: 'Align Self', route: '/flexbox/align-self' },
    ],
  },
  {
    title: 'Spacing',
    routes: [
      { label: 'Padding', route: '/spacing/padding' },
      { label: 'Margin', route: '/spacing/margin' },
      { label: 'Space Between', route: '/layout/space-between' },
    ],
  },
  {
    title: 'Sizing',
    routes: [
      { label: 'Width', route: '/sizing/width' },
      { label: 'Min-Width', route: '/sizing/min-width' },
      { label: 'Max-Width', route: '/sizing/max-width' },
      { label: 'Min-Height', route: '/sizing/min-height' },
      { label: 'Max-Height', route: '/sizing/max-height' },
    ],
  },
  {
    title: 'Typography',
    routes: [
      { label: 'Font Family', route: '/typography/family' },
      { label: 'Font Size', route: '/typography/size' },
      { label: 'Font Style', route: '/typography/style' },
      { label: 'Font Weight', route: '/typography/transform' },
      { label: 'Letter Spacing', route: '/typography/color' },
      { label: 'Line Height', route: '/typography/line-height' },
      { label: 'Text Transform', route: '/typography/transform' },
      { label: 'Text Color', route: '/typography/color' },
      { label: 'Text Decoration', route: '/typography/decoration' },
      { label: 'Text Decoration Color', route: '/typography/decoration-color' },
      { label: 'Text Decoration Style', route: '/typography/decoration-style' },
      { label: 'Text Align', route: '/typography/align' },
    ],
  },
  {
    title: 'Background',
    routes: [{ label: 'Background Color', route: '/background/color' }],
  },
  {
    title: 'Borders',
    routes: [
      { label: 'Border Radius', route: '/borders/radius' },
      { label: 'Border Width', route: '/borders/width' },
      { label: 'Border Color', route: '/borders/color' },
      { label: 'Border Style', route: '/borders/style' },
      { label: 'Divide Width', route: '/borders/width' },
      { label: 'Divide Color', route: '/borders/divide-color' },
      { label: 'Border Style', route: '/borders/border-style' },
    ],
  },
  {
    title: 'Effects',
    routes: [
      { label: 'Box Shadow', route: '/effects/box-shadow' },
      { label: 'Opacity', route: '/effects/opacity' },
    ],
  },
  {
    title: 'Transforms',
    routes: [
      { label: 'Scale', route: '/transforms/scale' },
      { label: 'Rotate', route: '/transforms/rotate' },
      { label: 'Translate', route: '/transforms/translate' },
      { label: 'Skew', route: '/transforms/skew' },
      { label: 'Transform Origin', route: '/transforms/transform-origin' },
    ],
  },
  {
    title: 'SVG',
    routes: [
      { label: 'Fill', route: '/svg/fill' },
      { label: 'Stroke', route: '/svg/stroke' },
      { label: 'Stroke Width', route: '/svg/stroke-width' },
    ],
  },
];

export { routes };
