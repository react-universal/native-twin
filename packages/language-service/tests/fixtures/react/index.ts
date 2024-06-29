import {createVariants} from '@native-twin/styled';

// TEST DIAGNOSTICS
// css`bg-blue-200 bg-red-500 md:bg-green-200 text-lg`
 css`bg(blue-500 md:red) bg-blue-500 bg-pink md:bg-red md:(bg-red sm:bg-rose text-lg)`

createVariants({
  base: 'bg-blue-200 bg-red-500 translate-x-2',
  variants: {
    variant: {
      primary: `bg-pink-200`,
      sec: 'bg-red-200'
    }
  }
 })

 css`bg(blue-50) bg-green-600`
 css`bg(blue-500 md:red) bg-blue-500 bg-pink md:text-xs md:(bg-red text-lg)`

//                        ^26 -> Global
//                        ^22 -> Relative