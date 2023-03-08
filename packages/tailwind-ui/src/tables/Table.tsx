import type { ReactNode } from 'react';
import {
  Cell,
  createColumnHelper,
  getCoreRowModel,
  Header,
  useReactTable,
} from '@tanstack/react-table';
import { Table as RTable, THead, TBody, TFoot, TR, TH, TD } from '@universal-labs/primitives';

interface ITableProps<T extends object> {
  data: T[];
  columns: {
    id: string;
    title: keyof T;
  }[];
  renderHeaderCell: (cell: Header<T, unknown>) => ReactNode;
  renderBodyCell: (cell: Cell<T, unknown>) => ReactNode;
  renderFooterCell?: (cell: Header<T, unknown>) => ReactNode;
  bodyRowClassName?: string;
  headRowClassName?: string;
  footerRowClassName?: string;
  className?: string;
  headCellClassName?: string;
  bodyCellClassName?: string;
}

function Table<T extends object>({
  data,
  columns,
  renderHeaderCell,
  renderBodyCell,
  renderFooterCell,
  bodyRowClassName,
  footerRowClassName,
  headRowClassName,
  className,
  headCellClassName,
  bodyCellClassName,
}: ITableProps<T>) {
  const columnHelper = createColumnHelper<T>();
  const tableColumns = columns.map((item) =>
    columnHelper.accessor(item.title as any, {
      header: (info) => info.header.id,
      cell: (info) => info.getValue(),
    }),
  );
  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <RTable className={className}>
      <THead>
        {table.getHeaderGroups().map((headerGroup) => (
          <TR key={headerGroup.id} className={headRowClassName}>
            {headerGroup.headers.map((header) => (
              <TH key={header.id} className={headCellClassName}>
                {renderHeaderCell(header)}
              </TH>
            ))}
          </TR>
        ))}
      </THead>
      <TBody>
        {table.getRowModel().rows.map((row) => (
          <TR key={row.id} className={bodyRowClassName}>
            {row.getVisibleCells().map((cell) => (
              <TD key={cell.id} className={bodyCellClassName}>
                {renderBodyCell(cell)}
              </TD>
            ))}
          </TR>
        ))}
      </TBody>
      <TFoot>
        {renderFooterCell &&
          table.getFooterGroups().map((footerGroup) => (
            <TR key={footerGroup.id} className={footerRowClassName}>
              {footerGroup.headers.map((header) => (
                <TH key={header.id}>{renderFooterCell(header)}</TH>
              ))}
            </TR>
          ))}
      </TFoot>
    </RTable>
  );
}

export { Table };
