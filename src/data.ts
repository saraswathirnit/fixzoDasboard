import { Workshop } from "./types";

export const workshopData: Workshop[] = [
  {
    WorkshopName: "penna",
    isLive: true,
    location: "location",
    Town: "town",
    state: "state",
    countryCode: "IN",
    bookingCount: 5555,
    totalSpecializedServicesCount: 4455,
    totalVehiclesServicedCount: 5433432,
    accidentRepairCount: 444,
    makeWiseCount: 434343,
    dumpDate: null,
    foundYear: "02-02-2020", // MM-DD-YYYY
    rating: "2",
    workshopId: 1212,
    yearOfExperience:10,
    typeOfVehicleServiced: ["pasanger","2w","HCV"],
    showSquidexData : "",
    squidexWorkshopWebsiteLink: "https://repairs.autorox.co/workshop/vasant2-motors-service-center-in-madhapur-hyderabad",
    topMakeName:"",
    squidexData : {}
  }
];

// Function to transform API response to table format
export function transformDashboardData(apiResponse: any[]): Workshop[] {
  return apiResponse.map(workshop => {
    try {
      return {
        WorkshopName: workshop.WorkshopName || "",
        isLive: workshop.isActive === 1,
        location: workshop.location || "",
        Town: workshop.Town || "",
        state: workshop.state || "",
        countryCode: workshop.countryCode || "",
        bookingCount: 0,
        totalSpecializedServicesCount: workshop.total_specialized_services_count ? 
          Number(JSON.parse(workshop.total_specialized_services_count)?.results?.[0]?.totalSpecializedServicesCount || 0) : 0,
        totalVehiclesServicedCount: workshop.total_vehicles_serviced_count ? 
          Number(JSON.parse(workshop.total_vehicles_serviced_count)?.results?.[0]?.totalVehiclesServiced || 0) : 0,
        accidentRepairCount: workshop.accident_repair_count ? 
          Number((JSON.parse(workshop.accident_repair_count)?.results?.[0]?.accident_repair_count || 0)) : 0,
        makeWiseCount: workshop.make_wise_count ? 
          Number((JSON.parse(workshop.make_wise_count)?.results?.[0]?.total_make_count || 0)) : 0,
        dumpDate: workshop.dumpDate ? new Date(workshop.dumpDate).toISOString() : null,
        foundYear: workshop.foundYear ? 
          new Date(workshop.foundYear).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
          }).replace(/\//g, '-') : "",
        rating: workshop.rating?.toString() || "",
        workshopId: workshop.ax_workshopId || null,
        yearOfExperience: calculateYearsOfExperience(workshop.foundYear),
        typeOfVehicleServiced: [],
        showSquidexData: "",
        squidexWorkshopWebsiteLink: workshop.squidexUrl || "",
        topMakeName: workshop?.make_wise_count && JSON.parse(workshop?.make_wise_count)?.results?.[0]?.make_name || "No make",
        squidexData : {}
      };
    } catch (error) {
      console.error(`Error processing workshop: ${workshop.WorkshopName || 'Unknown'}`, error);
      throw error; // Re-throw the error after logging
    }
  });
}

// Helper function to calculate years of experience
const calculateYearsOfExperience = (foundYear: string | null): number => {
  if (!foundYear) return 0;
  const foundDate = new Date(foundYear);
  const today = new Date();
  return Math.floor((today.getTime() - foundDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
};
