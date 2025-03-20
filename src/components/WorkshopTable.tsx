import React, { useState, useMemo, useEffect, useRef } from "react";
import { Workshop, SortConfig, Column } from "../types";
import {
  ExternalLink,
  Star,
  Calendar,
  PenTool as Tools,
  Car,
  Wrench,
  MapPin,
  MoreVertical,
  Clock,
  Cross,
} from "lucide-react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { DraggableHeader } from "./DraggableHeader";
import * as XLSX from "xlsx";
import { ChatBot } from "./ChatBot";

import { transformDashboardData, workshopData } from "../data";

const WorkshopModal = ({
  workshop,
  isOpen,
  onClose,
}: {
  workshop: Workshop;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [workshopDetails, setWorkshopDetails] = useState<any>();
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [insuranceData, setInsuranceData] = useState<any[]>([]);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isOwnerDetailsOpen, setIsOwnerDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("basic-info");

  useEffect(() => {
    const fetchWorkshopDetails = async () => {
      if (isOpen && workshop.workshopId) {
        try {
          setLoading(true);
          const response = await fetch(
            `https://tserv-app.autorox.co/api/webhub/dashboard/getWorkshopById?workshopId=${workshop.workshopId}&clientName=Repairs`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();
          setWorkshopDetails(data[0]?.data || null);

          // Only fetch services if we have workshop data and servicesLink
          if (data[0]?.data?.servicesLink?.length > 0) {
            const serviceIds = data[0].data.servicesLink.join(",");
            const servicesResponse = await fetch(
              `https://tserv-app.autorox.co/api/webhub/dashboard/getWorkshopAndServiceData?serviceIds=${serviceIds}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            const servicesData = await servicesResponse.json();
            setServicesData(servicesData);
          }

          if (data[0]?.data?.insuranceMasterMapping?.length > 0) {
            getInsuranceDetails(data[0]?.data?.insuranceMasterMapping[0]);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setWorkshopDetails(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchWorkshopDetails();
  }, [isOpen, workshop.workshopId]);

  const getImageUrl = (imageId: string) => {
    return `https://squidex.autorox.co:8443/api/assets/b2c/${imageId}`;
  };

  const menuItems = [
    { id: "basic-info", label: "Basic Information", icon: Star },
    {
      id: "services",
      label: "Available Services (" + servicesData?.length + ")",
      icon: Tools,
    },
    { id: "service-history", label: "Service History", icon: Clock },
    {
      id: "brands",
      label: "Brands Serviced (" + workshopDetails?.brands?.length + ")",
      icon: Car,
    },
    { id: "insurance", label: "Insurance Info ", icon: Cross },
    { id: "gallery", label: "Workshop Gallery", icon: Calendar },
    { id: "working-hours", label: "Working Hours", icon: Clock },
  ];

  const getInsuranceDetails = async (insuranceMasterMapping) => {
    const insuranceResponse = await fetch(
      `https://tserv-app.autorox.co/api/webhub/dashboard/getInuranceById?insuranceId=${insuranceMasterMapping}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const insuranceData = await insuranceResponse.json();
    setInsuranceData(insuranceData);
  };

  const noDataFound = () => {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            No Workshop Data Found
          </h2>
          <p className="text-gray-500 mt-2">
            The workshop details are currently unavailable In Squidex.
          </p>
          {/* <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Close
          </button> */}
        </div>
      </div>
    );
  };

  const renderContent = (tableData) => {
    switch (activeSection) {
      case "basic-info":
        return (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="font-medium">Rating:</span>
                <span className="ml-2">
                  {workshopDetails?.rating} ({workshopDetails?.reviewsCount}{" "}
                  reviews)
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-medium">Founded:</span>
                <span className="ml-2">
                  {workshopDetails?.businessStartedYear}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Certified:</span>
                <span className="ml-2 flex items-center gap-2">
                  {workshopDetails?.isCertified ? (
                    <>
                      <span className="text-green-600">Yes</span>
                      {workshopDetails?.certifiedImage?.[0] && (
                        <img
                          src={getImageUrl(workshopDetails.certifiedImage[0])}
                          alt="Certification"
                          className="h-6 w-full object-contain"
                        />
                      )}
                    </>
                  ) : (
                    <span className="text-red-600">No</span>
                  )}
                </span>
              </div>
              {workshopDetails?.location && (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-red-500 mr-2" />
                  <a
                    href={`https://www.google.com/maps?q=${workshopDetails.location.latitude},${workshopDetails.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                  >
                    View on Map <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
              
                {/* <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-red-500 mr-2" />
                  <a
                    href={`https://repairs.autorox.co/workshop/vasant-motors-service-center-in-madhapur-hyderabad`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                  >
                    website page <ExternalLink className="h-4 w-4" />
                  </a>
                </div> */}
              {workshopDetails?.franchiseDetails &&
                workshopDetails.franchiseDetails.length > 0 && (
                  <div className="col-span-2">
                    <span className="font-medium">Franchises:</span>
                    <div className="flex gap-4 mt-2">
                      {workshopDetails.franchiseDetails.map(
                        (franchise: any, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            {franchise.images?.[0] && (
                              <img
                                src={getImageUrl(franchise.images[0])}
                                alt={franchise.name}
                                className="w-8 h-8 object-contain"
                              />
                            )}
                            <span>{franchise.name}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              {workshopDetails?.customer?.[0] && (
                <div className="col-span-2">
                  <button
                    onClick={() => setIsOwnerDetailsOpen(!isOwnerDetailsOpen)}
                    className="flex items-center justify-between w-full text-left font-medium p-2 hover:bg-gray-100 rounded"
                  >
                    <span>Owner Details</span>
                    <span className="text-gray-500">
                      {isOwnerDetailsOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOwnerDetailsOpen && (
                    <div className="mt-2 space-y-1 p-2 bg-white rounded">
                      <p>Name: {workshopDetails.customer[0].name}</p>
                      <p>Type: {workshopDetails.customer[0].customerType}</p>
                      <p>Location: {workshopDetails.customer[0].address}</p>
                      <p>Contact: {workshopDetails.customer[0].mobileNumber}</p>
                      <p>Email: {workshopDetails.customer[0].email}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case "gallery":
        return workshopDetails?.galleryImages &&
          workshopDetails.galleryImages.length > 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Workshop Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {workshopDetails.galleryImages.map(
                (imageId: string, index: number) => (
                  <img
                    key={index}
                    src={getImageUrl(imageId)}
                    alt={`Workshop gallery ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                    onClick={() => {
                      // You could add a lightbox view here if needed
                    }}
                  />
                )
              )}
            </div>
          </div>
        ) : (
          <>{noDataFound()}</>
        );

      case "service-history":
        return workshopDetails?.workshopServiceHistory?.[0] ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Service History</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-blue-600 font-semibold">
                  Vehicles Serviced
                </div>
                <div className="text-2xl font-bold">
                  {workshopDetails.workshopServiceHistory[0].vehiclesServiced}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-green-600 font-semibold">
                  Cashless Tie-ups
                </div>
                <div className="text-2xl font-bold">
                  {workshopDetails.workshopServiceHistory[0].cashlessTieUps}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-purple-600 font-semibold">
                  Specialized Services
                </div>
                <div className="text-2xl font-bold">
                  {
                    workshopDetails.workshopServiceHistory[0]
                      .specializedServices
                  }
                </div>
              </div>
            </div>
          </div>
        ) : null;

      case "brands":
        return workshopDetails?.brands && workshopDetails.brands.length > 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Brands Serviced</h3>
            <div className="flex flex-wrap gap-3">
              {workshopDetails.brands.map((brand: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm"
                >
                  {brand.image?.[0] && (
                    <img
                      src={getImageUrl(brand.image[0])}
                      alt={brand.name}
                      className="h-6 object-contain"
                    />
                  )}
                  <span className="text-sm font-medium">{brand?.name}</span>
                  <span className="text-sm font-medium">
                    ({brand?.numberOfTimeServiced})
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "working-hours":
        return workshopDetails?.workshopAvailableTimes &&
          workshopDetails.workshopAvailableTimes.length > 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Working Hours</h3>
            <div className="flex items-center text-gray-700">
              <Clock className="h-5 w-5 mr-2 text-gray-500" />
              {workshopDetails.workshopAvailableTimes[0].startTime} -{" "}
              {workshopDetails.workshopAvailableTimes[0].endTime}
            </div>
          </div>
        ) : null;

      case "services":
        return servicesData.length > 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Available Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {servicesData
                .sort((a, b) => (b.data.rating || 0) - (a.data.rating || 0))
                .map((service) => (
                  <div
                    key={service.id}
                    className="bg-white p-4 rounded-lg shadow-sm"
                  >
                    {service.data.imageId && (
                      <img
                        src={getImageUrl(service.data.imageId)}
                        alt={service.data.displayName}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-medium text-blue-600">
                        {service.data.displayName}
                      </h4>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span>{service.data.rating}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3">
                      {service.data.shortDescription}
                    </p>

                    <div className="space-y-2">
                      {service.data.features
                        ?.slice(0, 3)
                        .map((feature: any, index: number) => (
                          <div key={index} className="flex items-start text-sm">
                            <Wrench className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                            <div>
                              <span className="font-medium">
                                {feature.item}
                              </span>
                              <p className="text-gray-500 text-xs">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="mt-3 flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-900">
                        Price: ₹{service.data.price.toLocaleString()}
                      </span>
                      <span className="text-gray-500">
                        {service.data.noOfTimeServiced} services completed
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : null;

      case "insurance":
        return (
          <div className="bg-gray-50 p-4 rounded-lg">
            {/* <h3 className="text-lg font-semibold mb-3">Insurance Information</h3> */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {/* start */}
              <div className="flex items-center gap-4">
                <span className="font-medium">Logo:</span>
                {workshopDetails?.workshopLogo?.[0] && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#241a45] rounded-lg"></div>
                    <img
                      src={getImageUrl(insuranceData?.primaryImage[0])}
                      alt={workshopDetails?.displayName}
                      className="w-full h-16 rounded-lg object-cover relative z-10"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-sm z-20">
                      LOGO
                    </span>
                  </div>
                )}
              </div>
              {/* end */}
              <div className="flex items-center">
                <span className="font-medium">Name:</span>
                <span className="ml-2">{insuranceData?.displayName}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Short Description:</span>
                <span className="ml-2 flex items-center gap-2">
                  {insuranceData?.shortDescription}
                </span>
              </div>
              <div className="items-center">
                <span className="font-medium">Long Description:</span>
                <span className="ml-1 flex items-center gap-2">
                  {insuranceData?.longDescription}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Count:</span>
                <span className="ml-2">{tableData?.accidentRepairCount}</span>
              </div>
              {/* start */}
              <div className="bg-gray-50 p-1 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">
                  Comapanies ({insuranceData?.insuranceCompanyDetails?.length})
                  :
                </h3>
                <div className="flex flex-wrap gap-3">
                  {insuranceData?.insuranceCompanyDetails.map(
                    (insuranceCompany: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm"
                      >
                        {insuranceCompany.logo?.[0] && (
                          <img
                            src={getImageUrl(insuranceCompany.logo[0])}
                            alt={insuranceCompany.companyName}
                            // className="w-6 h-6 object-contain"
                            className="h-6 object-contain"
                          />
                        )}
                        <span className="text-sm font-medium">
                          {insuranceCompany?.companyName}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
              {/* end */}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-7xl w-full m-4 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {workshopDetails?.workshopLogo?.[0] && (
                <div className="relative">
                  <div className="absolute inset-0 bg-[#241a45] rounded-lg"></div>
                  <img
                    src={getImageUrl(workshopDetails.workshopLogo[0])}
                    alt={workshopDetails?.displayName}
                    className="w-full h-16 rounded-lg object-cover relative z-10"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-sm z-20">
                    LOGO
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {workshopDetails?.displayName}
                </h2>
                <p className="text-gray-600">{workshopDetails?.address}</p>
                {/* {workshopDetails?.website && ( */}
                  <a
                    href={`https://repairs.autorox.co/workshop/gobyk-gandimaisamma-service-center-in-gandimaisamma-hyderabad`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    <span className="flex items-center gap-1 "> 
                      <ExternalLink className="h-4 w-4 text-blue-600" />
                      {"Website link"}
                    </span>
                  </a>
                {/* )} */}
              </div>
            </div>
            <button
              onClick={() => {
                setActiveSection("basic-info");
                onClose();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="text-3xl">&times;</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : !workshopDetails ? (
          <div className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              No Workshop Data Found
            </h2>
            <p className="text-gray-500 mt-2">
              The workshop details are currently unavailable In Squidex.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            <div className="w-64 border-r bg-gray-50 overflow-y-auto">
              <nav className="p-4">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg text-left mb-2 transition-colors
                      ${
                        activeSection === item.id
                          ? "bg-blue-50 text-blue-600"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {renderContent(workshop)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
    { id: "topMakeName", label: "Experts In" },
    { id: "makeWiseCount", label: "Top Make Wise Count" },
    { id: "typeOfVehicleServiced", label: "Type of vehicle serviced" },
    { id: "showSquidexData", label: "Squidex Data" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:5000/getDashboardData");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        const transformedData = transformDashboardData(result);
        setData(transformedData);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "totalVehiclesServicedCount",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageSizeOptions = [10, 25, 50, 100];

  // Add new state for visible columns
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      "WorkshopName",
      "isLive",
      "rating",
      "totalVehiclesServicedCount",
      "totalSpecializedServicesCount",
      "accidentRepairCount",
      "makeWiseCount",
      "showSquidexData",
      "topMakeName",
    ])
  );

  // Add this state near the other state declarations
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);

  // Add ref for dropdown click outside handling
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Add new state for dropdown menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Update the click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest("button")
      ) {
        setIsMenuOpen(false);
        setIsColumnSelectorOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close column selector when clicking outside
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !menuRef.current?.contains(event.target as Node)
      ) {
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
          <div className="flex items-center gap-2">
            {workshop?.workshopLogo && (
              <img
                src={`https://squidex.autorox.co:8443/api/assets/b2c/${workshop?.workshopLogo[0]}`}
                alt={workshop.WorkshopName}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span className="font-medium text-blue-600">
              {workshop[columnId]}
            </span>
          </div>
        );
      case "isLive":
        return (
          <>
            <span className="font-medium text-gray-900">
              {workshop[columnId] ? (
                <>
                  <span className="relative flex items-center">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500 mr-1"></span>
                    <span className="ml-1">Live</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="relative flex items-center">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 mr-1"></span>
                    <span className="ml-1">Not Live</span>
                  </span>
                </>
              )}  
            </span>
          </>
        );
      case "typeOfVehicleServiced":
        return (
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
        );
      case "showSquidexData":
        return (
          <>
            <button
              onClick={() => {
                setSelectedWorkshop(workshop);
                setIsModalOpen(true);
              }}
              className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
            >
              <span>Show more</span>
            </button>
          </>
        );
      case "topMakeName":
        return (
          <span className="font-medium text-blue-600">
            {workshop[columnId]}
          </span>
        );

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

  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop>(
    workshopData[0]
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        <div className="relative flex items-center gap-4">
          <ChatBot workshopData={data} className="mr-2" />

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isMenuOpen) {
                setIsMenuOpen(true);
                setIsColumnSelectorOpen(false);
              } else {
                setIsMenuOpen(false);
                setIsColumnSelectorOpen(false);
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {isMenuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-lg shadow-lg z-50"
            >
              <div className="relative">
                <button
                  onClick={() => setIsColumnSelectorOpen(!isColumnSelectorOpen)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Show/Hide Columns
                </button>

                {isColumnSelectorOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-full top-0 mr-2 w-48 bg-white border rounded-lg shadow-lg z-50 py-2 max-h-[300px] overflow-y-auto"
                  >
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
                  className="sticky top-0 bg-gray-50 z-40"
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
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                ${index + 1 === currentPage ? "bg-blue-500 text-white" : ""}`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      <WorkshopModal
        workshop={selectedWorkshop}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
