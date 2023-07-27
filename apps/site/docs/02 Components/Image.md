# Image

## Usage

```typescript
import { Image } from '@universal-labs/primitives' 

// inside your component
// ...
<Image className='object-cover h-48 w-96 ...' src='/my-source.png' ref='1' />
```

## Api

| prop      | values | description         |
| --------- | ------ | ------------------- |
| className | string | TailwindCSS class   |
| src       | string | Source of the image |
| ref       | string | React ref                    |

## Example

```typescript
import { Image } from '@universal-labs/primitives'

const MyComponent = () => {
	return (
		<div className='bg-indigo-300'>
			<Image className='object-cover h-48 w-96' src='/my-source.png' ref='1' />
		</div>
	)
}
	  
export default MyComponent
```