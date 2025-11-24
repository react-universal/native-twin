import { createVariants } from '@native-twin/core';

export const Component = () => {
  return (
    <div className='bg-blue- text-5xl basis-0.5 bg-blue-300'>
      <div className={`bg-rose-800 bg-blue-100 text(sm red-200 md:gray)`} />
      <div className='bg-blue' />
    </div>
  );
};
   
createVariants({
  base: 'bg-blue-200 bg-red-500 bg-black translate-x-2',
  variants: {
    variant: {
      primary: `bg-pink-200`,
      sec: 'bg-red-200',
    },
  },
});

