import React, { useEffect, useState, useMemo } from 'react';
import { Workshop, WorkshopCardFilters, MakeWiseCount } from '../types';
import { Building2, Users, Link as LinkIcon, MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LocationFilter } from './shared/LocationFilter';

const WorkshopCard = ({ workshop }: { workshop: Workshop }) => {
  const navigate = useNavigate();
  const makeWiseData = workshop.make_wise_count ? JSON.parse(workshop.make_wise_count).results : [];
  const topMake = makeWiseData[0] as MakeWiseCount;
  const totalVehicles = workshop.total_vehicles_serviced_count ? 
    JSON.parse(workshop.total_vehicles_serviced_count).results[0].totalVehiclesServiced : 0;

  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 hover:border-blue-200 transform hover:-translate-y-1"
      onClick={() => navigate(`/customerInfo/${workshop.workshop_id}`)}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-gray-800 line-clamp-1 hover:text-blue-600 transition-colors">
              {workshop.WorkshopName}
            </h3>
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full w-fit">
              <MapPin className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-gray-600">{workshop.Town}, {workshop.state}</span>
            </div>
          </div>
          {workshop.rating && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-xs font-medium">{workshop.rating}</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2 rounded-lg">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="bg-blue-100 p-1.5 rounded-md">
              <Building2 className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium">{workshop.bookingCount || 0}</span>
              <span className="text-[10px] text-gray-500">Total</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <div className="bg-blue-100 p-1.5 rounded-md">
              <Users className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium">{workshop.monthlyBookings || (workshop.bookingCount ? Math.floor(workshop.bookingCount / 12) : 0)}</span>
              <span className="text-[10px] text-gray-500">March</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <div className="bg-green-100 p-1.5 rounded-md">
              <Users className="h-3.5 w-3.5 text-green-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium">{workshop.todayBookings || (workshop.bookingCount ? Math.floor(workshop.bookingCount / 365) : 0)}</span>
              <span className="text-[10px] text-gray-500">Today</span>
            </div>
          </div>
        </div>

        {/* Location and Website */}
        {workshop.squidexUrl && (
          <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2 py-1.5 rounded-md hover:bg-blue-50 transition-colors group">
            <LinkIcon className="h-3 w-3 text-blue-500" />
            <a 
              href={workshop.squidexUrl}
              className="text-xs text-blue-600 group-hover:text-blue-700 font-medium hover:underline truncate"
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Website
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

const WorkshopCards = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WorkshopCardFilters>({
    selectedState: "Telangana",
    selectedCity: "Hyderabad"
  });

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/getDashboardData');
        if (!response.ok) {
          throw new Error('Failed to fetch workshops');
        }
        const data = await response.json();
        setWorkshops(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch workshops');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  const stats = useMemo(() => {
    const workshopsInState = workshops.filter(w => 
      w.state.toLowerCase() === filters.selectedState.toLowerCase()
    );
    
    const workshopsInCity = workshops.filter(w => 
      w.state.toLowerCase() === filters.selectedState.toLowerCase() &&
      w.Town.toLowerCase() === filters.selectedCity.toLowerCase()
    );

    return {
      totalWorkshops: workshops.length,
      stateWorkshops: workshopsInState.length,
      cityWorkshops: workshopsInCity.length
    };
  }, [workshops, filters]);

  const filteredWorkshops = workshops
    .filter(workshop => {
      const stateMatch = workshop.state.toLowerCase() === filters.selectedState.toLowerCase();
      const cityMatch = workshop.Town.toLowerCase() === filters.selectedCity.toLowerCase();
      return stateMatch && cityMatch;
    })
    .sort((a, b) => {
      const aMonthly = a.monthlyBookings || (a.bookingCount ? Math.floor(a.bookingCount / 12) : 0);
      const bMonthly = b.monthlyBookings || (b.bookingCount ? Math.floor(b.bookingCount / 12) : 0);
      return bMonthly - aMonthly;
    });

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading workshops...</p>
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
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Workshop Dashboard</h2>
          <LocationFilter
            filters={filters}
            onFilterChange={setFilters}
          />
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalWorkshops}</h3>
                <p className="text-gray-600">Total Workshops</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.stateWorkshops}</h3>
                <p className="text-gray-600">Workshops in {filters.selectedState}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.cityWorkshops}</h3>
                <p className="text-gray-600">Workshops in {filters.selectedCity}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredWorkshops.map((workshop) => (
          <WorkshopCard key={workshop.workshop_id} workshop={workshop} />
        ))}
      </div>
    </div>
  );
};

export default WorkshopCards;
