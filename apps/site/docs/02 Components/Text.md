# Text

## Usage

```typescript
import { H1, H2, H3, H4, H5, H6, Span, Strong, P } from '@universal-labs/primitives' 

// inside your component
// ...
<H1 className='rounded-full'> My h1 text </H1>
```

## Props

| prop      | values | description         |
| --------- | ------ | ------------------- |
| className | string | TailwindCSS class   |

## Example

```typescript
import { H1, P, Strong } from '@universal-labs/primitives'

const MyComponent = () => {
	return (
		<div className='bg-indigo-300'>
			<H1 className='text-4xl text-center'> This is a header1 centered text </H1>
			<P className='text-left'> This is a paragraph text aligned to the left </P>
			<Strong className='font-bold text-sm'> This is a strong text text </Strong>
		</div>
	)
}
	  
export default MyComponent
```