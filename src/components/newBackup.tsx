import React, { useState, useMemo, useEffect, useRef } from "react";
import { Workshop, SortConfig, Column } from "../types";
import {
  ExternalLink,
  CheckCircle,
  XCircle,
  Download,
  Star,
  Calendar,
  PenTool as Tools,
  Car,
  Wrench,
  MapPin,
  MoreVertical,
} from "lucide-react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { DraggableHeader } from "./DraggableHeader";
import * as XLSX from "xlsx";

import { workshopData } from "../data";

export const WorkshopTable: React.FC = () => {
  const [data, setData] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialColumns: Column[] = [
    { id: "WorkshopName", label: "Workshop Name" },
    { id: "state", label: "State" },
    { id: "Town", label: "Town" },
    { id: "isLive", label: "Live" },
    { id: "foundYear", label: "Founded" },
    { id: "yearOfExperience", label: "YOE" },
    { id: "bookingCount", label: "Bookings" },
    { id: "rating", label: "Rating" },
    // { id: 'location', label: 'Location' },
    { id: "totalVehiclesServicedCount", label: "Vehicles Serviced" },
    { id: "totalSpecializedServicesCount", label: "Specialized Services" },
    { id: "accidentRepairCount", label: "Accident Repairs" },
    { id: "makeWiseCount", label: "Make Wise Count" },
    { id: "workshopId", label: "Website Link" },
    {id:"typeOfVehicleServiced", label:"Type of vehicle serviced"}
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/workshopsDashboardData"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result.workshops);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };

    setData(workshopData);
    setLoading(false);

    // fetchData();
  }, []);

  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "WorkshopName",
    direction: "asc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageSizeOptions = [10, 25, 50, 100];

  // Add new state for visible columns
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      "WorkshopName",
      "yearOfExperience",
      "bookingCount",
      "totalVehiclesServicedCount",
      "totalSpecializedServicesCount",
      "accidentRepairCount",
      "makeWiseCount",
      "workshopId",
    ])
  );

  // Add this state near the other state declarations
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);

  // Add ref for dropdown click outside handling
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Add new state for dropdown menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsColumnSelectorOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add click outside handler for the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsColumnSelectorOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSort = (key: keyof Workshop) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(columns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setColumns(items);
  };

  const exportToExcel = () => {
    const worksheetData = sortedAndFilteredData.map((item) => {
      const row: any = {};
      columns
        .filter((column) => visibleColumns.has(column.id))
        .forEach((column) => {
          if (column.id === "rating") {
            row[column.label] = item[column.id] || "N/A";
          } else if (column.id === "foundYear") {
            row[column.label] = formatDate(item[column.id]);
          } else {
            row[column.label] = item[column.id];
          }
        });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Workshops");
    XLSX.writeFile(workbook, "workshops.xlsx");
  };

  const sortedAndFilteredData = useMemo(() => {
    let filtered = [...data].filter(
      (workshop) =>
        workshop.WorkshopName.toLowerCase().includes(
          searchTerm.toLowerCase()
        ) ||
        workshop.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workshop.Town.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workshop.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });
  }, [data, sortConfig, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedAndFilteredData.slice(startIndex, startIndex + pageSize);
  }, [sortedAndFilteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedAndFilteredData.length / pageSize);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleWebsiteClick = (url: string) => {
    window.open(url, "_blank");
  };

  const renderCell = (workshop: Workshop, columnId: keyof Workshop) => {
    switch (columnId) {
      case "rating":
        return workshop.rating ? (
          <span className="flex items-center text-yellow-500">
            <Star className="h-4 w-4 mr-1 fill-current" />
            {workshop.rating}
          </span>
        ) : (
          <span className="text-gray-400">N/A</span>
        );
      case "totalVehiclesServicedCount":
        return (
          <span className="flex items-center">
            <Car className="h-4 w-4 mr-2 text-blue-500" />
            {workshop[columnId].toLocaleString()}
          </span>
        );
      case "totalSpecializedServicesCount":
        return (
          <span className="flex items-center">
            <Tools className="h-4 w-4 mr-2 text-purple-500" />
            {workshop[columnId].toLocaleString()}
          </span>
        );
      case "accidentRepairCount":
        return (
          <span className="flex items-center">
            <Wrench className="h-4 w-4 mr-2 text-red-500" />
            {workshop[columnId].toLocaleString()}
          </span>
        );
      case "foundYear":
        return (
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            {formatDate(workshop[columnId])}
          </span>
        );
      case "location":
        return (
          <span className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-green-500" />
            {workshop[columnId]}
          </span>
        );
      case "state":
        return (
          <span className="font-medium text-gray-900">
            {workshop[columnId]}
          </span>
        );
      case "Town":
        return <span className="text-gray-700">{workshop[columnId]}</span>;
      case "WorkshopName":
        return (
          <span className="font-medium text-blue-600">
            {workshop[columnId]}
          </span>
        );
      case "workshopId":
        return (
          <button
            onClick={() =>
              handleWebsiteClick(
                "https://repairs.autorox.co/workshop/vasant2-motors-service-center-in-madhapur-hyderabad"
              )
            }
            className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
          >
            <span>Page</span>
            <ExternalLink className="h-4 w-4" />
          </button>
        );
      case "isLive":
        return (
          <>
            <span className="font-medium text-gray-900">
              {workshop[columnId] + ""}
            </span>
          </>
        );
      case "typeOfVehicleServiced":
        return(
          <div className="flex gap-2 flex-wrap">
            {workshop[columnId].map((type: string, index: number) => (
              <span 
                key={index}
                className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800"
              >
                {type}
              </span>
            ))}
          </div>
        )
      default:
        return typeof workshop[columnId] === "number"
          ? workshop[columnId].toLocaleString()
          : workshop[columnId];
    }
  };

  // Add new handler for column visibility toggle
  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search workshops, locations, states..."
          className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
              <button
                onClick={() => setIsColumnSelectorOpen(!isColumnSelectorOpen)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Show/Hide Columns
              </button>
              <button
                onClick={() => {
                  exportToExcel();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Export to Excel
              </button>
            </div>
          )}
          
          {isColumnSelectorOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 py-2 max-h-[300px] overflow-y-auto">
              {columns.map((column) => (
                <label
                  key={column.id}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns.has(column.id)}
                    onChange={() => toggleColumnVisibility(column.id)}
                    className="mr-2"
                  />
                  {column.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className="overflow-x-auto bg-white rounded-lg shadow"
        style={{ height: "calc(100vh - 250px)" }}
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          <table className="min-w-full table-auto">
            <Droppable droppableId="columns" direction="horizontal">
              {(provided) => (
                <thead
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="sticky top-0 bg-gray-50 z-10"
                >
                  <tr className="bg-gray-50">
                    {columns
                      .filter((column) => visibleColumns.has(column.id))
                      .map((column, index) => (
                        <DraggableHeader
                          key={column.id}
                          column={column}
                          index={index}
                          onSort={handleSort}
                        />
                      ))}
                    {provided.placeholder}
                  </tr>
                </thead>
              )}
            </Droppable>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((workshop, idx) => (
                <tr key={workshop.workshopId} className="hover:bg-gray-50">
                  {columns
                    .filter((column) => visibleColumns.has(column.id))
                    .map((column) => (
                      <td
                        key={column.id}
                        className="px-6 py-4 whitespace-nowrap"
                      >
                        {renderCell(workshop, column.id)}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </DragDropContext>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing page size
            }}
            className="border rounded px-2 py-1"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 border rounded hover:bg-gray-100 
                ${index + 1 === currentPage ? 'bg-blue-500 text-white' : ''}`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
