# Aspect Ratio

## Compatibility

| Class         | Web | Native |
| ------------- | --- | ------ |
| aspect-auto   | ✅  | ✅     | 
| aspect-square | ✅  | ✅     |
| aspect-video  | ✅  | ✅     |

## Usage

_Please refer to the [official documentation of tailwind](https://tailwindcss.com/docs/aspect-ratio) ._

## Example

```typescript
import { View } from '@universal-labs/primitives'
const MyComponent = () => {
  return (
    <View className="flex-1 justify-center items-center space-y-2">
      <View className="w-50 aspect-square bg-slate-500" />
      <View className="w-50 aspect-video bg-slate-500" />
    </View>
  );
}

export default MyComponent;

```

