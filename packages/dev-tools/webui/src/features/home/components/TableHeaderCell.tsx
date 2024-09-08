import { Pressable, Text } from 'react-native';
import { flexRender, type Header } from '@tanstack/react-table';
import type { RawJSXElementTreeNode } from '@native-twin/css/build/jsx';

export const TableHeaderCell = (header: Header<RawJSXElementTreeNode, unknown>) => (
  <td className='border-1'>
    <Pressable
      key={header.id}
      onPress={header.column.getToggleSortingHandler()}
      className='w-full items-center px-2 py-1'
    >
      <Text className='font-inter-bold text-center'>
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
      </Text>

      <Text className='font-inter-bold text-right absolute self-end'>
        {{
          asc: ' 🔼',
          desc: ' 🔽',
        }[header.column.getIsSorted() as string] ?? null}
      </Text>
    </Pressable>
  </td>
);
