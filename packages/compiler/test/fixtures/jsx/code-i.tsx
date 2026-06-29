// @ts-noCheck
import { Text, Pressable } from 'react-native';

// const buttonVariants = createVariants({
//   base: 'py-5 m-1 rounded-md items-center justify-center group-hover:bg-red-400',
//   variants: {
//     variant: {
//       primary: 'bg-blue-200',
//       secondary: 'bg-white',
//     },
//     size: {
//       large: 'w-40',
//       small: 'w-4',
//     },
//     isDisable: {
//       true: 'opacity-30',
//       false: '',
//     },
//   },
//   defaultVariants: {
//     variant: 'primary',
//   },
// });

export const Button = (props) => {
  const [isLoading,setIsLoading] = useState(true);
  return (
    <Pressable className={`flex-1 ${isLoading ? 'bg-gray' : 'bg-red-200'}`}>
      <Text className='group-hover:text-white'>asd</Text>
    </Pressable>
  );
};
