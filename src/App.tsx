import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { WorkshopTable } from './components/WorkshopTable';
import WorkshopCards from './components/WorkshopCards';
import CustomerInfo from './pages/CustomerInfo';
import { LayoutDashboard, Grid, List } from 'lucide-react';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-100">
        <div className="py-6">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <div 
                className="flex items-center space-x-3 cursor-pointer" 
                onClick={() => window.location.href = '/'}
              >
                <LayoutDashboard className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-semibold text-gray-900">Workshop Dashboard</h1>
              </div>
              <div className="flex space-x-4">
                <Link 
                  to="/" 
                  className="flex items-center space-x-2 px-4 py-2 bg-white rounded-md shadow-sm hover:bg-gray-50"
                >
                  <Grid className="h-5 w-5" />
                  <span>Card View</span>
                </Link>
                <Link 
                  to="/table" 
                  className="flex items-center space-x-2 px-4 py-2 bg-white rounded-md shadow-sm hover:bg-gray-50"
                >
                  <List className="h-5 w-5" />
                  <span>Table View</span>
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <Routes>
                <Route path="/" element={<WorkshopCards />} />
                <Route path="/table" element={<WorkshopTable />} />
                <Route path="/customerInfo/:workshopId" element={<CustomerInfo />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;