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

 css`bg(blue-200) md:(bg-red text-lg)`
//                        ^26 -> Global
//                        ^22 -> Relative