import { setup } from '@native-twin/core';
import { SimpleComponent } from './src/components/Simple';
import tailwindConfig from './tailwind.config';

setup(tailwindConfig);

export default function App() {
  return <SimpleComponent />;
}
