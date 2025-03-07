export interface Workshop {
  WorkshopName: string;
  Pincode?: number;
  Town: string;
  ax_workshopId?: number;
  countryCode: string;
  dumpDate: string | null;
  foundYear: string;
  id?: number;
  isActive?: number;
  location: string;
  make_wise_count?: string;
  noOfServiceSinceFoundDate?: number;
  noOfServicesDays?: number;
  rating: string;
  service_wise_count?: string;
  squidexUrl?: string | null;
  state: string;
  total_specialized_services_count?: string;
  total_vehicles_serviced_count?: string;
  workshop_id?: number;
  accident_repair_count?: string;
  isLive: boolean;
  bookingCount: number;
  monthlyBookings?: number;
  todayBookings?: number;
  totalSpecializedServicesCount: number;
  totalVehiclesServicedCount: number;
  accidentRepairCount: number;
  makeWiseCount: number;
  yearOfExperience: number;
  typeOfVehicleServiced: string[];
  showSquidexData: string;
  squidexWorkshopWebsiteLink: string;
  topMakeName: string;
  squidexData: any;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: keyof Workshop;
  direction: SortDirection;
}

export interface Column {
  id: keyof Workshop;
  label: string;
}

export interface MakeWiseCount {
  make_name: string;
  total_make_count: string;
}

export interface ServiceWiseCount {
  repareCategory: string;
  service_count: string;
}

export interface WorkshopCardFilters {
  selectedState: string;
  selectedCity: string;
}

export interface WorkshopBooking {
  id: number;
  booking_date: string;
  status: string;
  payload: string;
}

export interface WorkshopBookingResponse {
  data: WorkshopBooking[];
  total_count: number;
}