import React from 'react';

const Header = ({ onSearch, onTabChange, activeTab }) => {
  return (
    <header className="bg-purple-900 p-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center justify-center md:justify-start">
          <h1 className="text-white text-2xl mr-4">Student Center</h1>
        </div>
        <div className="flex space-x-4">
        <div className="relative w-full md:w-64 mt-4 md:mt-0">
          <input
            type="text"
            placeholder="Search..."
            className="bg-purple-800 text-white rounded-full py-2 px-4 w-full md:w-auto focus:outline-none focus:bg-purple-700"
            onChange={onSearch}
          />
          <i className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white hover:text-yellow-400 cursor-pointer fas fa-search"></i>
        </div>
          <button
            className={`text-white ${activeTab === 'Favorites' ? 'border-b-2 border-yellow-400' : ''}`}
            onClick={() => onTabChange('Favorites')}
          >
            Favorites
          </button>
          <button
            className={`text-white ${activeTab === 'History' ? 'border-b-2 border-yellow-400' : ''}`}
            onClick={() => onTabChange('History')}
          >
            History
          </button>
        </div>
        
      </div>
    </header>
  );
};

export default Header;
