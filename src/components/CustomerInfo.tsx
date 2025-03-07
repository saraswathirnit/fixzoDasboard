import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Workshop } from '../types';
import { Building2, Users, Star, MapPin, ArrowLeft } from 'lucide-react';
import { transformDashboardData, workshopData } from '../data';

const CustomerInfo = () => {
  const { workshopId } = useParams();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [customerData, setCustomerData] = useState<any[]>([]);

  useEffect(() => {
    // Find the workshop from the data
    const workshops = transformDashboardData(workshopData);
    const currentWorkshop = workshops.find(w => w.workshopId === workshopId);
    setWorkshop(currentWorkshop || null);

    // TODO: Replace with actual customer data fetch
    setCustomerData([
      {
        id: 1,
        name: "John Doe",
        phone: "+1234567890",
        email: "john@example.com",
        lastVisit: "2025-02-28",
        totalVisits: 5
      },
      // Add more mock data as needed
    ]);
  }, [workshopId]);

  if (!workshop) {
    return <div className="p-6">Workshop not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Workshop Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{workshop.workshopName}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="h-5 w-5" />
              <span>Workshop ID: {workshop?.workshopId}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-5 w-5" />
              <span>Total Bookings: {workshop?.bookingCount || 0}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Star className="h-5 w-5" />
              <span>Rating: {workshop.rating || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Visit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Visits
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customerData.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.lastVisit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.totalVisits}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfo;
