import {createVariants} from '@native-twin/styled';

createVariants({
  base: 'bg-blue-200 bg-red-500',
  variants: {
    variant: {
      primary: `bg-pink-200`,
      sec: 'bg-red-200'
    }
  }
 })

//  css`bg(blue-500 md:red) bg-blue-500 bg-pink md:(bg-red text-lg)`
 css`bg(blue-500 md:red-500) md:(bg-green-600) text([16px])`
//                        ^26 -> Global
//                        ^22 -> Relative