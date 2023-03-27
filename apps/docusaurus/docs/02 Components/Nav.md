# Nav

## Usage

```typescript
import { Nav } from '@universal-labs/primitives' 

// inside your component
// ...
<Nav className='w-100 dark ...' />
```

## Props

| prop      | values | description         |
| --------- | ------ | ------------------- |
| className | string | TailwindCSS class   |

## Example

```typescript
import { Image } from '@universal-labs/primitives'

const MyComponent = () => {
	return (
		<div className='bg-indigo-300'>
			<Nav className='w-100 dark ...' />
		</div>
	)
}
	  
export default MyComponent
```