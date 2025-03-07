import React from 'react';
import { ChevronDown } from 'lucide-react';
import { indianStates } from '../../data/indianStates';
import { WorkshopCardFilters } from '../../types';

interface LocationFilterProps {
  filters: WorkshopCardFilters;
  onFilterChange: (newFilters: WorkshopCardFilters) => void;
  className?: string;
}

export const LocationFilter = ({ 
  filters,
  onFilterChange,
  className = ''
}: LocationFilterProps) => {
  const cities = indianStates.find(s => s.state === filters.selectedState)?.cities || [];

  return (
    <div className={`flex gap-4 items-center ${className}`}>
      <div className="relative">
        <select
          value={filters.selectedState}
          onChange={(e) => {
            const newState = e.target.value;
            const firstCity = indianStates.find(s => s.state === newState)?.cities[0] || '';
            onFilterChange({
              selectedState: newState,
              selectedCity: firstCity
            });
          }}
          className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-gray-700 focus:outline-none focus:border-blue-500"
        >
          {indianStates.map(state => (
            <option key={state.state} value={state.state}>
              {state.state}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
      </div>
      <div className="relative">
        <select
          value={filters.selectedCity}
          onChange={(e) => onFilterChange({ ...filters, selectedCity: e.target.value })}
          className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-gray-700 focus:outline-none focus:border-blue-500"
        >
          {cities.map(city => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
};
