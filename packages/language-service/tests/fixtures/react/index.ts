import { createVariants, tx } from '@native-twin/core';

// TEST DIAGNOSTICS
// css`bg-blue-200 bg-red-500 md:bg-green-200 text-lg`
tx`bg(blue-500 md:red) bg-blue-500 bg-pink md:bg-red md:(bg-red sm:bg-rose text-lg)`;

createVariants({
  base: 'bg-blue-200 bg-red-500 translate-x-2',
  variants: {
    variant: {
      primary: `bg-pink-200`,
      sec: 'bg-red-200',
    },
  },
});

tx`bg(blue-50) bg-green-600`;
tx`bg(blue-500 md:red) bg-blue-500 bg-pink md:text-xs md:(bg-red text-lg)`;

//                        ^26 -> Global
//                        ^22 -> Relative
