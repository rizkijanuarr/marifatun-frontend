import type { ReactNode } from 'react';

type Column = {
  key: string;
  label: string;
};

type DataTableProps = {
  columns: Column[];
  rows: ReactNode;
  summary: string;
  pagination?: ReactNode;
};

export const DataTable = ({ columns, rows, summary, pagination }: DataTableProps) => {
  return (
    <section className="table-wrap">
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>{summary}</span>
        <div className="pagination">{pagination}</div>
      </div>
    </section>
  );
};
