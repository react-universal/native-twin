# Container

## Compatibility

| Class         | Web | Native |
| ------------- | --- | ------ |
| container     | ✅  | ✅     |
| container-sm  | ✅  | ✅     |
| container-md  | ✅  | ✅     |
| container-lg  | ✅  | ✅     |
| container-xl  | ✅  | ✅     |
| container-2xl | ✅  | ✅       |

## Usage

_Please refer to the [official documentation of tailwind](https://tailwindcss.com/docs/container) ._

## Example

```typescript
import { View } from '@universal-labs/primitives'
const MyComponent = () => {
  return (
    <View className="container mx-auto">
      <View className="container-sm bg-slate-500" > Content </View>
    </View>
  );
}

export default MyComponent;

```

