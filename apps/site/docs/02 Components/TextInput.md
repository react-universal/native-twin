# TextInput

## Usage

```typescript
import { TextInput } from '@universal-labs/primitives' 

// inside your component
// ...
<TextInput className='rounded-full' />
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
			<TextInput className='rounded-full' />
		</div>
	)
}
	  
export default MyComponent
```