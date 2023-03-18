import type { ReactNode } from 'react';
import { H6, Pressable, Span, View } from '@universal-labs/primitives';
import { Drawer } from '@universal-labs/tailwind-ui';
import { useRouter } from 'next/router';
import { routes } from '../constants';

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
    <View className='pt-4'>
      <View className='mb-2 pl-4'>
        <H6 className='font-bold text-gray-200'>{title}</H6>
      </View>
      <View className='pl-8'>
        {items.map((route, index) => {
          return renderItem(route, index);
        })}
      </View>
    </View>
  );
}

const AppLayout = ({ children }: IAppLayoutProps) => {
  const Router = useRouter();
  return (
    <View className='flex-1 flex-row'>
      <Drawer
        drawerWidth={250}
        className='h-screen flex-1 overflow-y-scroll border-r-[0.5px] border-gray-400 bg-gray-800'
      >
        {routes.map((item) => (
          <DrawerItems
            key={item.title}
            title={item.title}
            items={item.routes}
            renderItem={(route) => {
              return (
                <Pressable
                  onPress={() => Router.push(route.route)}
                  key={`${route.label}-${route.route}`}
                  className='rounded-lg py-1 px-2 hover:bg-gray-900'
                >
                  <Span className='text-base text-gray-200'>{route.label}</Span>
                </Pressable>
              );
            }}
          />
        ))}
      </Drawer>
      <View className='flex-1 bg-gray-800 px-5 pt-5'>{children}</View>
    </View>
  );
};

export { AppLayout };
