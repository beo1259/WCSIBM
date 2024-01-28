// components/Header.js
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaHeart, FaClock, FaSearch } from 'react-icons/fa';
import Image from 'next/image';

const Header = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const { push } = useRouter();

  const navigateTo = (path) => {
    push(path);
  };


  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    // Implement search functionality here, e.g., navigate to a search page or filter items
    console.log('Search Term:', searchTerm);
  };

  return (
    <div className="bg-purple-700 text-white p-0 flex items-center justify-between">
      {/* Navigation Buttons */}
      <div className="flex items-center">
        <button onClick={() => router.back()} className="text-white p-2 mr-4">
          <FaArrowLeft size={24} />
        </button>
        <button onClick={() => router.forward()} className="text-white p-2">
          <FaArrowRight size={24} />
        </button>
      </div>

      <button 
      className="relative w-32 h-24 mr-2"
      onClick={() => navigateTo('/dashboard')}> {/* Adjust width and height as needed */}
          <Image
            src="/western.jpg" // Adjust the path to your image's location
            alt="Western Logo"
            fill
            objectFit="contain" // This keeps the aspect ratio of the image
          />
        </button>

      {/* Search Bar */}
      <div className="flex flex-1 mx-4 items-center bg-white text-gray-800 rounded overflow-hidden">
        <FaSearch className="ml-2" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-2 text-black focus:outline-none"
        />
      </div>

      {/* Icons */}
      <div className="flex items-center">
        <button className="text-white p-2 mr-4">
          <FaHeart size={24} />
        </button>
        <button className="text-white p-2">
          <FaClock size={24} />
        </button>
      </div>
    </div>
  );
};

export default Header;
