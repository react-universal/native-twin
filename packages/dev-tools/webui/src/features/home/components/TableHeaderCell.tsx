import { Pressable, Text } from 'react-native';
import { flexRender, type Header } from '@tanstack/react-table';
import type { RawJSXElementTreeNode } from '@native-twin/css/build/jsx';

export const TableHeaderCell = (header: Header<RawJSXElementTreeNode, unknown>) => (
  <Pressable
    key={header.id}
    onPress={header.column.getToggleSortingHandler()}
    className='border-1 flex-row justify-between px-2 items-center'
    style={{
      width: header.getSize(),
    }}
  >
    {header.isPlaceholder
      ? null
      : flexRender(header.column.columnDef.header, header.getContext())}

    <Text className='font-inter-bold'>
      {{
        asc: ' 🔼',
        desc: ' 🔽',
      }[header.column.getIsSorted() as string] ?? null}
    </Text>
  </Pressable>
);
