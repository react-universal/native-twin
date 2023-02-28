import { ReactNode, useState } from 'react';
import { H3, Pressable, Span, View } from '@react-universal/primitives';
import { Drawer } from '@react-universal/tailwind-ui';

interface IAppLayoutProps {
  children: ReactNode;
}

interface IDrawerItemsProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
}

function DrawerItems<T>({ items, renderItem, title }: IDrawerItemsProps<T>) {
  return (
    <View>
      <View className='pl-4'>
        <H3 className='text-gray-200'>{title}</H3>
      </View>
      <View className='pl-8'>
        {items.map((route, index) => {
          return renderItem(route, index);
        })}
      </View>
    </View>
  );
}

const routes = [
  {
    title: 'Overview',
    routes: [{ label: 'Overview', route: '/' }],
  },
];

const AppLayout = ({ children }: IAppLayoutProps) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <View className='flex-1 flex-row'>
      <Drawer
        drawerWidth={250}
        className='flex-1 border-r-[0.5px] border-gray-400 bg-gray-800'
        isOpen={isOpen}
        onToggle={() => setIsOpen((prev) => !prev)}
      >
        {routes.map((item) => (
          <DrawerItems
            key={item.title}
            title={item.title}
            items={item.routes}
            renderItem={(route) => {
              return (
                <Pressable
                  key={`${route.label}-${route.route}`}
                  className='rounded-lg py-3 px-2 hover:bg-gray-900'
                >
                  <Span className='text-lg text-gray-200'>{route.label}</Span>
                </Pressable>
              );
            }}
          />
        ))}
      </Drawer>
      <View className='flex-1 bg-gray-700'>{children}</View>
    </View>
  );
};

export { AppLayout };
