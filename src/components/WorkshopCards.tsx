import React, { useEffect, useState, useMemo } from 'react';
import { Workshop, WorkshopCardFilters } from '../types';
import { Building2, Users, MapPin, Star, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LocationFilter } from './shared/LocationFilter';
import { format } from 'date-fns';

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

const getIndivisualBookingCounts = (workshop: Workshop) => {
  // Generate random numbers if they don't exist
  if (!workshop.bookingCount) {
    const total = 0; // Between 8k-15k
    const monthly = 0; // 30-70% of total
    const daily = 0; // 2-10% of monthly

    return {
      total,
      monthly,
      daily
    };
  }

  return {
    total: workshop.bookingCount,
    monthly: workshop.monthlyBookings || 0,
    daily: workshop.todayBookings || 0
  };
};

const WorkshopCard = ({ workshop }: { workshop: Workshop }) => {
  const navigate = useNavigate();
  
  const numbers = getIndivisualBookingCounts(workshop);

  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden border border-slate-200"
      onClick={() => navigate(`/customerInfo/${workshop.workshop_id}`)}
    >
      <div className="p-3">
        {/* Header with Rating */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-1 flex-1 mr-2">
            {workshop.WorkshopName}
          </h3>
          {workshop.rating && (
            <div className="flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-600 shrink-0">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-xs font-medium">{workshop.rating}</span>
            </div>
          )}
          {/* Live Status */} 
          <div className="flex items-center gap-1.5 mb-3 pl-2">
          {workshop.isActive ? (
            <span className="flex items-center text-green-600">
              <span className="relative flex h-3 w-3 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
              </span>
              <span className="text-xs font-medium">Live</span>
            </span>
          ) : (
            <span className="flex items-center text-red-600">
              <span className="relative flex h-3 w-3 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
              </span>
              <span className="text-xs font-medium">Not Live</span>
            </span>
          )}
        </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-600 truncate">{workshop.Town}, {workshop.state}</span>
        </div>

        

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1 text-xs text-slate-600 border-t border-slate-200 pt-2">
          <div className="flex items-center">
            <Building2 className="h-3 w-3 text-indigo-600 mr-1 shrink-0" />
            <span className="font-medium">{formatNumber(numbers.total)} total</span>
          </div>
          <div className="flex items-center">
            <Users className="h-3 w-3 text-indigo-600 mr-1 shrink-0" />
            <span className="font-medium">{formatNumber(numbers.monthly)} {format(new Date(), 'MMMM')}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-3 w-3 text-emerald-600 mr-1 shrink-0" />
            <span className="font-medium">{formatNumber(numbers.daily)} today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStateBookingCounts = async (state: string, city: string) => {
  const response = await fetch('http://127.0.0.1:5000/api/dashboard/location_bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },  
    body: JSON.stringify({
      state: state,
      city: city
    })
  });   

  if (!response.ok) {
    throw new Error('Failed to fetch booking counts');
  }

  const data = await response.json();
  return data ? data : {};
};

const WorkshopCards = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<WorkshopCardFilters>({
    selectedState: "Telangana",
    selectedCity: "Hyderabad"
  });
  const [stateBookings, setStateBookings] = useState(0);
  const [cityBookings, setCityBookings] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [filteredWorkshops, setFilteredWorkshops] = useState<Workshop[]>([]);

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
      cityWorkshops: workshopsInCity.length,
      totalBookings: totalBookings,
      stateBookings: stateBookings,
      cityBookings: cityBookings
    };
  }, [workshops, filters, stateBookings, cityBookings]);

  useEffect(() => {
    const fetchStateBookings = async () => {
      if (workshops.length && filters.selectedState) {
        setBookingsLoading(true);
        try {
          const bookingsCounts = await getStateBookingCounts(filters.selectedState, filters.selectedCity);
          setStateBookings(bookingsCounts.stateBookingCounts);
          setCityBookings(bookingsCounts.cityBookingCounts);
          setTotalBookings(bookingsCounts.totalBookingCounts);
        } finally {
          setBookingsLoading(false);
        }
      }
    };
    fetchStateBookings();
  }, [workshops, filters.selectedState, filters.selectedCity]);


  const getWorkshopBookingCounts = async (workshopIds: number[]) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/dashboard/workshopBookingCounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workshopIds
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workshop booking counts');
      }

      const data = await response.json();
      return data as Array<{
        bookingCounts: number;
        workshopId: number;
      }>;

    } catch (error) {
      console.error('Error fetching workshop booking counts:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!workshops) return;

    // setFilteredWorkshops([]);
    
    const updateWorkshops = async () => {
      if(workshops.length === 0) return;
      const filtered = workshops
        .filter(workshop => {
          const stateMatch = workshop.state.toLowerCase() === filters.selectedState.toLowerCase();
          const cityMatch = workshop.Town.toLowerCase() === filters.selectedCity.toLowerCase();
          const nameMatch = searchTerm === '' || workshop.WorkshopName.toLowerCase().includes(searchTerm.toLowerCase());
          return stateMatch && cityMatch && nameMatch;
        })
        .sort((a, b) => {
          const aMonthly = a.monthlyBookings || (a.bookingCount ? Math.floor(a.bookingCount / 12) : 0);
          const bMonthly = b.monthlyBookings || (b.bookingCount ? Math.floor(b.bookingCount / 12) : 0);
          return bMonthly - aMonthly;
        });

      const workshopIds :any = filtered.map(workshop => workshop.ax_workshopId);
      
      try {
        const bookingCounts = await getWorkshopBookingCounts(workshopIds);
        
        const workshopsWithBookings = filtered.map(workshop => {
          const bookingData = bookingCounts.find(bc => bc.workshopId === workshop.ax_workshopId);
          return {
            ...workshop,
            bookingCount: bookingData?.bookingCounts || workshop.bookingCount
          };
        }).sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0));

        setFilteredWorkshops(workshopsWithBookings);
      } catch (error) {
        console.error('Error updating workshop booking counts:', error);
        setFilteredWorkshops(filtered);
      }
    };

    updateWorkshops();
  }, [workshops, filters.selectedState, filters.selectedCity, searchTerm]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
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
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[2000px] mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Stats Cards */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <div className="bg-slate-50/80 rounded-lg shadow-sm border border-slate-200 px-3 py-2 hover:bg-slate-100/80 transition-colors w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-100 p-1.5 rounded-lg">
                    <Building2 className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-bold text-slate-900">{stats.totalWorkshops}</span>
                      <span className="text-xs text-slate-500">workshops in India</span>
                    </div>
                    {bookingsLoading ? (
                      <div className="p-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                    </div>
                    ) : (
                      <p className="text-xs text-indigo-600 font-medium">{formatNumber(stats.totalBookings)} bookings</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-lg shadow-sm border border-slate-200 px-3 py-2 hover:bg-slate-100/80 transition-colors w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-100 p-1.5 rounded-lg">
                    <MapPin className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-bold text-slate-900">{stats.stateWorkshops}</span>
                      <span className="text-xs text-slate-500">in {filters.selectedState} State</span>
                    </div>
                    {bookingsLoading ? (
                      <div className="p-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                    </div>
                    ) : (
                      <p className="text-xs text-indigo-600 font-medium">{formatNumber(stats.stateBookings)} bookings</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-lg shadow-sm border border-slate-200 px-3 py-2 hover:bg-slate-100/80 transition-colors w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-100 p-1.5 rounded-lg">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-bold text-slate-900">{stats.cityWorkshops}</span>
                      <span className="text-xs text-slate-500">in {filters.selectedCity} City</span>
                    </div>
                    {bookingsLoading ? (
                       <div className="p-1">
                       <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                     </div>
                     ) : (
                      <p className="text-xs text-emerald-600 font-medium">{formatNumber(stats.cityBookings)} bookings</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search workshop..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2 pr-10 bg-slate-50/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              <LocationFilter
                filters={filters}
                onFilterChange={setFilters}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[2000px] mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Workshop Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {filteredWorkshops.map((workshop, index) => (
            <WorkshopCard key={index} workshop={workshop} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkshopCards;
