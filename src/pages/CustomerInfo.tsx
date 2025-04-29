import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { WorkshopBookingResponse, WorkshopBooking } from '../types';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { MoreVertical, Download, Search, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

interface Column {
  id: keyof WorkshopBooking | 'customerName' | 'vehicleNumber' | 'service' | 'amount';
  label: string;
}

interface SortConfig {
  key: Column['id'];
  direction: 'asc' | 'desc';
}

const CustomerInfo = () => {
  const { workshopId } = useParams();
  const [bookings, setBookings] = useState<WorkshopBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Table features
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'booking_date',
    direction: 'desc'
  });
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initialColumns: Column[] = [
    { id: 'id', label: 'ID' },
    { id: 'booking_date', label: 'Booking Date' },
    { id: 'customerName', label: 'Customer Name' },
    { id: 'vehicleNumber', label: 'Vehicle Number' },
    { id: 'service', label: 'Service' },
    { id: 'amount', label: 'Amount' },
    { id: 'status', label: 'Status' }
  ];

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(initialColumns.map(col => col.id))
  );

  const [columns, setColumns] = useState<Column[]>(initialColumns);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const offset = (currentPage - 1) * pageSize;
        const response = await fetch(
          `https://ai.autorox.co/api/ax/dashboard/getWorkshopBookingData?workshopId=${workshopId}&limit=${pageSize}&offset=${offset}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data: WorkshopBookingResponse = await response.json();
        setBookings(data.data);
        setTotalCount(data.total_count);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    if (workshopId) {
      fetchBookings();
    }
  }, [workshopId, currentPage, pageSize]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsColumnSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleColumn = (columnId: string) => {
    setVisibleColumns(current => {
      const updated = new Set(current);
      if (updated.has(columnId)) {
        updated.delete(columnId);
      } else {
        updated.add(columnId);
      }
      return updated;
    });
  };

  const exportToExcel = () => {
    const worksheetData = sortedAndFilteredData.map(booking => {
      const payload = JSON.parse(booking.payload);
      const row: any = {};
      columns
        .filter(column => visibleColumns.has(column.id))
        .forEach(column => {
          if (column.id === 'customerName') {
            row[column.label] = payload.customerName;
          } else if (column.id === 'vehicleNumber') {
            row[column.label] = payload.vehicleNumber;
          } else if (column.id === 'service') {
            row[column.label] = payload.items[0]?.partDisplayName || 'N/A';
          } else if (column.id === 'amount') {
            row[column.label] = payload.items[0]?.appliedPrice?.amount || '0';
          } else if (column.id === 'booking_date') {
            row[column.label] = format(new Date(booking[column.id]), 'MMM dd, yyyy HH:mm');
          } else {
            row[column.label] = booking[column.id as keyof WorkshopBooking];
          }
        });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
    XLSX.writeFile(workbook, 'workshop_bookings.xlsx');
  };

  const sortedAndFilteredData = useMemo(() => {
    let filtered = bookings.filter(booking => {
      const payload = JSON.parse(booking.payload);
      const searchString = searchTerm.toLowerCase();
      return (
        booking.id.toString().includes(searchString) ||
        booking.status.toLowerCase().includes(searchString) ||
        payload.customerName.toLowerCase().includes(searchString) ||
        payload.vehicleNumber.toLowerCase().includes(searchString) ||
        (payload.items[0]?.partDisplayName || '').toLowerCase().includes(searchString)
      );
    });

    return filtered.sort((a: WorkshopBooking, b: WorkshopBooking): number => {
      const getValueFromPayload = (booking: WorkshopBooking, key: Column['id']) => {
        const payload = JSON.parse(booking.payload);
        switch(key) {
          case 'service':
            return payload.items[0]?.partDisplayName || '';
          case 'amount':
            return Number(payload.items[0]?.appliedPrice?.amount || '0');
          case 'customerName':
          case 'vehicleNumber':
            return payload[key];
          default:
            return booking[key as keyof WorkshopBooking];
        }
      };

      const aValue = getValueFromPayload(a, sortConfig.key);
      const bValue = getValueFromPayload(b, sortConfig.key);

      if (sortConfig.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
      }
    });
  }, [bookings, sortConfig, searchTerm]);

  const paginatedData = useMemo(() => {
    // No need to slice the data since the API is already returning paginated results
    return sortedAndFilteredData;
  }, [sortedAndFilteredData]);

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {/* <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4" />
          </button> */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Customer Info</h1>
            <p className="text-gray-600 mt-1">Total Bookings: {totalCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Column Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsColumnSelectorOpen(!isColumnSelectorOpen)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
            >
              <MoreVertical className="h-4 w-4" />
              <span>Columns</span>
            </button>
            {isColumnSelectorOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48">
                {columns.map(column => (
                  <label key={column.id} className="flex items-center px-4 py-2 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={visibleColumns.has(column.id)}
                      onChange={() => toggleColumn(column.id)}
                      className="mr-2"
                    />
                    {column.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Export Button */}
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.filter(col => visibleColumns.has(col.id)).map(column => (
                  <th
                    key={column.id}
                    onClick={() => handleSort(column.id)}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {sortConfig.key === column.id && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((booking) => {
                const payload = JSON.parse(booking.payload);
                const service = payload.items[0]?.partDisplayName || 'N/A';
                const amount = payload.items[0]?.appliedPrice?.amount || '0';

                return (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    {columns.filter(col => visibleColumns.has(col.id)).map(column => (
                      <td key={column.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {column.id === 'customerName' ? payload.customerName :
                         column.id === 'vehicleNumber' ? payload.vehicleNumber :
                         column.id === 'service' ? service :
                         column.id === 'amount' ? `₹${amount}` :
                         column.id === 'booking_date' ? format(new Date(booking[column.id]), 'MMM dd, yyyy HH:mm') :
                         column.id === 'status' ? (
                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                             booking.status === 'Success' 
                               ? 'bg-green-100 text-green-800' 
                               : 'bg-yellow-100 text-yellow-800'
                           }`}>
                             {booking.status}
                           </span>
                         ) :
                         booking[column.id as keyof WorkshopBooking]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md text-sm p-1"
            >
              {[10, 25, 50, 100].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-700">entries</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfo;
