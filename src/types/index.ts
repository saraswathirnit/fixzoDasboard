// ... (existing types)

export interface BookingPayload {
  userVehicleId: string;
  customerName: string;
  vehicleNumber: string;
  workshopName: string;
  mobileNumber: string;
  items: {
    partDisplayName: string;
    appliedPrice: {
      amount: string;
      amountAsNumber: number;
    };
  }[];
  variant: string;
  year: string;
}

export interface WorkshopBooking {
  booking_date: string;
  createdAt: string;
  id: number;
  payload: string;
  status: string;
  workshop_id: number;
}

export interface WorkshopBookingResponse {
  data: WorkshopBooking[];
  total_count: number;
}
