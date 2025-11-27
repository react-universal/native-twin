import { createVariants } from '@native-twin/core';

export const Component = () => {
  return ( 
    <div className='bg-blue-100 text-5xl text-2xl text-black basis-0.5 bg-blue-300 bg-red-200'>
      <div className={`bg-rose-800  bg-blue-100 text(sm red-100 sm red-200 `}>
        <div className={`sub-child`} />
      </div>
      <div className='bg-blue bg-amber-100 text-amber-100' />
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

