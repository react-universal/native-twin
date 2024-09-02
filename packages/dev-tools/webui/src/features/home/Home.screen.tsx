import { useMemo, useSyncExternalStore } from 'react';
import { View } from 'react-native';
import { PLUGIN_EVENTS } from '@/constants/event.constants';
import {
  componentsStore,
  getComponentsSize,
  setTreeComponent,
} from '@/features/app/store/components.store';
import { useClientSubscription } from '@/features/app/useDevToolsClient';
import { useLoadFonts } from '@/features/app/useLoadFonts';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  Cell,
} from '@tanstack/react-table';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import { Link, useGlobalSearchParams, UnknownOutputParams } from 'expo-router';
import type { RawJSXElementTreeNode } from '@native-twin/css/jsx';
import { TableHeaderCell } from './components/TableHeaderCell';

export function HomeScreen() {
  const { loaded } = useLoadFonts();
  const params = useGlobalSearchParams();
  const columnHelper = createColumnHelper<RawJSXElementTreeNode>();
  const componentsSize = useSyncExternalStore(
    componentsStore.subscribe,
    () => {
      console.log('SIZE: ', getComponentsSize());
      return getComponentsSize();
    },
    () => getComponentsSize(),
  );
  const componentsData = useMemo(
    () =>
      componentsSize === 0
        ? []
        : pipe(componentsStore.getState(), (x) => x.values(), RA.fromIterable),
    [componentsSize],
  );
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: () => 'ID',
        enableSorting: true,
        cell: (props) => props.cell.getValue().split('_')[0],
      }),
      columnHelper.accessor('importKind', {
        header: () => 'Import Kind',
        cell: (props) => props.cell.getValue(),
      }),
      columnHelper.accessor('order', {
        header: () => 'Order',
        cell: (props) => props.cell.getValue(),
      }),
      columnHelper.accessor('jsxElementName', {
        header: () => 'Open',
        cell: (props) => <TableLink cell={props.cell} params={params} />,
      }),
    ],
    [columnHelper, params],
  );

  const table = useReactTable({
    columns,
    data: componentsData,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  useClientSubscription<RawJSXElementTreeNode>(PLUGIN_EVENTS.receiveTree, (_, tree) => {
    console.log('TREE_RECEIVED', tree);
    setTreeComponent(tree);
  });
  // if (!loaded) return null;
  return (
    <View className='w-full p-2 overflow-scroll'>
      <View
        className='flex-1 w-full'
        style={{
          width: table.getCenterTotalSize(),
        }}
      >
        <View className='w-full'>
          {table.getHeaderGroups().map((headerGroups) => {
            return (
              <View key={headerGroups.id} className='flex-row border-1'>
                {headerGroups.headers.map((header) => (
                  <TableHeaderCell key={header.id} {...header} />
                ))}
              </View>
            );
          })}
        </View>
        <View className='w-full'>
          {table.getRowModel().rows.map((row) => {
            return (
              <View key={row.id} className='flex-row'>
                {row.getVisibleCells().map((cell) => {
                  console.log('CELL: ', cell);
                  return (
                    <View
                      key={cell.id}
                      style={{
                        width: cell.column.getSize(),
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const TableLink = ({
  cell,
  params,
}: {
  cell: Cell<RawJSXElementTreeNode, unknown>;
  params: UnknownOutputParams;
}) => (
  <View
    key={cell.id}
    className='border-l-1'
    style={{
      width: cell.column.getSize(),
    }}
  >
    <Link
      href={{
        pathname: `/file-tree/${cell.row.original.id}`,
        params: {
          id: cell.row.original.id,
          order: cell.row.original.order,
          ...params,
        },
      }}
    >
      Open Tree
    </Link>
  </View>
);
