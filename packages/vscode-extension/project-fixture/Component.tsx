export const Component = () => {
  return (
    <div>
      <div className='bg-red bg-blue text(sm md:gray)' />
      <div className={`bg-blue`} />
    </div>
  )
}

variants({
  base: 'bg-blue-200 bg-red-500 translate-x-2',
  variants: {
    variant: {
      primary: `bg-pink-200`,
      sec: 'bg-red-200'
    }
  }
 })