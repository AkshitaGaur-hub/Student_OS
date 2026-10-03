import React from 'react';

export default function Table({
  headers = [],
  data = [],
  renderRow,
  emptyMessage = 'No data available',
}) {
  return (
    <div className="w-full overflow-x-auto border border-slate-200 rounded-lg">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-4 py-3">
                {typeof header === 'object' ? header.label : header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100 text-slate-700">
          {data && data.length > 0 ? (
            data.map((row, index) =>
              renderRow ? (
                renderRow(row, index)
              ) : (
                <tr key={index} className="hover:bg-slate-50">
                  {headers.map((h, i) => {
                    const key = typeof h === 'object' ? h.key : h.toLowerCase();
                    return (
                      <td key={i} className="px-4 py-3 whitespace-nowrap">
                        {row[key] !== undefined ? String(row[key]) : '-'}
                      </td>
                    );
                  })}
                </tr>
              )
            )
          ) : (
            <tr>
              <td colSpan={headers.length || 1} className="px-4 py-8 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

