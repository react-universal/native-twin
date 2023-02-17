import { createTailwindcssPlugin } from '@mhsdesign/jit-browser-tailwindcss';
import postcss, { Root } from 'postcss';
import postcssJS from 'postcss-js';
import type { Config } from 'tailwindcss/types/config';

const setup = async (tailwindConfig: Config) => {
  const tailwindPlugin = createTailwindcssPlugin({
    tailwindConfig,
    content: ['flex-1 bg-black/10'],
  });
  const processor = postcss([tailwindPlugin]);
  const result = processor
    .process('@tailwind components;@tailwind utilities;', {
      from: undefined,
    })
    .sync();
  console.log('ROOT: ', result.root);
  const parsedRoot = postcssJS.parse(result);
  const objectify = postcssJS.objectify(result.root as Root);
  console.log('PARSED: ', { parsedRoot, objectify });

  // const processor = postcss([tailwindPlugin, postcssVariables]);
  // const result = await processor.process('@tailwind components;@tailwind utilities;', {
  //   from: undefined,
  // });
  // const tailwindCss = createTailwindcss({ tailwindConfig });
  // const css = await tailwindCss.generateStylesFromContent(
  //   `
  // @tailwind components;
  // @tailwind utilities;
  // `,
  //   [''],
  // );
  // console.log('CSS: ', css);
  // const result = postcss([
  //   createTailwindcssPlugin({
  //     tailwindConfig: _twConfig,
  //     content: [],
  //   }),
  //   postcssVariables(),
  // ])
  //   .process('@tailwind components;@tailwind utilities;')
  //   .then((response) => {
  //     console.log('FINAL_CSS', response.css);
  //   })
  //   .catch((error) => {
  //     console.log('PARSER_FAIL: ', error);
  //   });
  // console.log('RESULT: ', result);
  // if (!tailwindStore.getState().tailwind.config.theme) {
  //   useStore.getState().tailwind.setup(twConfig);
  // }
};

export default setup;
