import React from 'react';

const tabs = ['All', 'Clinic', 'Treatment', 'Team', 'Events'];

const GalleryFilter = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-8">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
            activeTab === tab 
              ? 'bg-primary-700 text-white shadow-md shadow-primary-700/25' 
              : 'bg-white text-gray-700 hover:bg-sage border border-gray-200 hover:border-primary-700/20'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default GalleryFilter;
