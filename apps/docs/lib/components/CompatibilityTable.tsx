import { H3, Span } from '@react-universal/primitives';
import { Table } from '@react-universal/tailwind-ui';
import { flexRender } from '@tanstack/react-table';

type ICompatibilityTableData = {
  class: string;
  native: string;
  web: string;
};

interface ICompatibilityTableProps {
  data: ICompatibilityTableData[];
}

const CompatibilityTable = ({ data }: ICompatibilityTableProps) => {
  return (
    <Table
      data={data}
      className='max-w-md border border-gray-500 hover:border-collapse'
      headCellClassName='border border-gray-400 h-12'
      bodyCellClassName='border border-gray-500 h-10'
      columns={[
        { id: 'class', title: 'class' },
        { id: 'native', title: 'native' },
        { id: 'web', title: 'web' },
      ]}
      renderHeaderCell={(cell) => (
        <H3 className='capitalize text-gray-300'>
          {flexRender(cell.column.columnDef.header, cell.getContext())}
        </H3>
      )}
      renderBodyCell={(cell) => (
        <Span className='flex justify-center font-bold text-gray-400'>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </Span>
      )}
    />
  );
};

export { CompatibilityTable };
