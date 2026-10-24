import React, { useState } from 'react';
import { Edit2, Trash2, Eye, ChevronUp, ChevronDown } from 'lucide-react';

const DataTable = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  onView, 
  loading = false,
  emptyMessage = "No data available" 
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="animate-pulse flex flex-col">
          <div className="h-12 bg-gray-100 border-b border-gray-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-gray-100 flex items-center px-6 gap-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm font-semibold">
            <tr>
              {columns.map((col, index) => (
                <th 
                  key={index} 
                  className={`px-6 py-4 ${col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortConfig.key === col.key && (
                      sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-6 py-4 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedData.length > 0 ? (
              sortedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-sm text-gray-700">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {onView && (
                        <button 
                          onClick={() => onView(row)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                      )}
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(row)}
                          className="p-1.5 text-[#1880B8] hover:bg-sky-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(row)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)} 
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
