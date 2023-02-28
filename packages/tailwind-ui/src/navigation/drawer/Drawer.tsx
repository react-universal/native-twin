import type { ReactNode } from 'react';
import { Pressable, Span, View } from '@react-universal/primitives';
import clsx from 'clsx';

interface TAppDrawerProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
  onToggle: () => void;
  drawerWidth: number;
}

function Drawer({ isOpen, drawerWidth, children, className, onToggle }: TAppDrawerProps) {
  return (
    <View
      className={clsx('relative top-0 left-0 z-40 h-full transition-all', className)}
      style={{
        marginLeft: isOpen ? 0 : -drawerWidth,
        width: drawerWidth,
        maxWidth: drawerWidth,
      }}
    >
      <Pressable
        className={clsx('absolute z-50 mr-2 flex items-center self-end')}
        onPress={onToggle}
      >
        <Span className='text-3xl font-bold text-white'>x</Span>
      </Pressable>
      {children}
    </View>
  );
}

export { Drawer };
