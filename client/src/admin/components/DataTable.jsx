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
      <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden border border-[#C2DCF2]">
        <div className="animate-pulse flex flex-col">
          <div className="h-12 bg-[#EBF4FC] border-b border-[#C2DCF2]"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-[#EBF4FC] flex items-center px-6 gap-4">
              <div className="h-4 bg-[#DCEEFB] rounded w-1/4"></div>
              <div className="h-4 bg-[#DCEEFB] rounded w-1/4"></div>
              <div className="h-4 bg-[#DCEEFB] rounded w-1/4"></div>
              <div className="h-4 bg-[#DCEEFB] rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-[#C2DCF2] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap text-left border-collapse">
          <thead className="bg-[#EBF4FC] border-b border-[#C2DCF2] text-[#09223D] text-sm font-semibold">
            <tr>
              {columns.map((col, index) => (
                <th 
                  key={index} 
                  className={`px-6 py-4 font-semibold text-[#09223D] ${col.sortable ? 'cursor-pointer hover:bg-[#DFEFFB]' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1 font-semibold text-[#09223D]">
                    {col.label}
                    {col.sortable && sortConfig.key === col.key && (
                      sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-6 py-4 text-right font-semibold text-[#09223D]">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBF4FC] bg-white">
            {sortedData.length > 0 ? (
              sortedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-[#F0F7FD] transition-colors">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-sm text-[#243B52] font-medium">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
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
                            className="p-1.5 text-[#0C2B4B] hover:bg-sky-50 rounded-md transition-colors"
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
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)} 
                  className="px-6 py-12 text-center text-[#475E75] font-medium bg-white/70"
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
