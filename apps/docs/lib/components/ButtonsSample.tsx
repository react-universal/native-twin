import { Span, View } from '@react-universal/primitives';
import { Button } from '@react-universal/tailwind-ui';

const ButtonsSample = () => {
  return (
    <View>
      <Button size='small'>
        <Span>Small</Span>
      </Button>
      <Button size='default'>
        <Span>default</Span>
      </Button>
      <Button className='dark:bg-red-800'>
        <Span>Bigger</Span>
      </Button>
    </View>
  );
};

export { ButtonsSample };
