import React from 'react';
import { Search, X } from 'lucide-react';

const TreatmentSearch = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="max-w-2xl mx-auto relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search for conditions, symptoms, or treatments..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="block w-full pl-12 pr-12 py-4 rounded-full border-none ring-1 ring-sage focus:ring-2 focus:ring-primary-600 bg-white shadow-sm text-gray-800"
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          aria-label="Clear search input"
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default TreatmentSearch;
