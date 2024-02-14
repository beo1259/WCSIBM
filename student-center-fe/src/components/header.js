// components/Header.js

import { useRouter } from 'next/navigation';
sessionStorage.setItem("searching","")
// import { useRouter } from 'next/router';
import { useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaHeart, FaClock, FaSearch } from 'react-icons/fa';
import Image from 'next/image';

const Header = () => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const { push } = useRouter();
    const [showAutoComplete, setShowAutoComplete] = useState(false);


    const autoCompleteOptions = ['Your Schedule', 'Add Course', 'Drop Course', 'Swap Course', 'Generate Schedule'];

    const searchRoutes = {
        'Your Schedule': ['/course-registration','schedule'],
        'Add Course': ['/course-registration','addCourse'],
        'Drop Course': ['/course-registration','dropCourse'],
        'Swap Course': ['/course-registration','swapCourses'],
        'Generate Schedule': ['course-registration','generateSchedule']

    };

    const filteredOptions = autoCompleteOptions.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearchSubmit = (event,searchKey) => {
        // event.preventDefault();
        // const searchKey = searchTerm.toLowerCase().trim(); // Normalize the search term
        console.log(searchKey)
        const routePath = searchRoutes[searchKey][0];
        const action = searchRoutes[searchKey][1]
        if (routePath) {
            sessionStorage.setItem("searching",action)
            console.log(sessionStorage.getItem("searching"))
            router.push(routePath);
        } else {
            console.log('No matching section found for:', searchTerm);
            // Optionally, provide user feedback
        }
    };

    const navigateTo = (path) => {
        push(path);
    };


    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };
    return (
        <div className="bg-purple-700 text-white p-0 flex items-center justify-between h-16">
            {/* Navigation Buttons */}
            <div className="flex items-center">
                <button onClick={() => router.back()} className="text-white p-2 mr-4">
                    <FaArrowLeft size={20} />
                </button>
                <button onClick={() => router.forward()} className="text-white p-2">
                    <FaArrowRight size={20} />
                </button>
            </div>

            <button
                className="relative w-32 h-28 mr-2"
                onClick={() => navigateTo('/dashboard')}
            >
                <Image
                    src="/western-crest-facebook-og1-removebg-preview.png" // Adjust the path to your image's location
                    alt="Western Logo"
                    layout="fill" // Use 'fill' for modern Next.js Image component usage
                    objectFit="contain" // This keeps the aspect ratio of the image
                />
            </button>

            {/* Search Bar and Autocomplete Container */}
            <div className="relative flex flex-1 mx-4 items-center">
                <FaSearch className="ml-2" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setShowAutoComplete(true)} // Show options when the input gains focus
                    className="w-full p-1  ml-3 shadow-md bg-slate-200 text-black rounded-md focus:outline-none"
                />
                {/* Autocomplete Dropdown */}
                {showAutoComplete && searchTerm && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-10">
                    
                        {filteredOptions.map((option, index) => (
                            <div
                                key={index}
                                onMouseDown={() => { // Use onMouseDown instead of onClick to handle focus-related issues
                                    console.log(option)
                                    setSearchTerm(option);
                                    
                                    setShowAutoComplete(false);
                                    handleSearchSubmit(option,option); // Pass the selected option to handleSearchSubmit
                                    }}
                                
                                className="p-2 hover:bg-gray-100 cursor-pointer text-black"
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Icons */}
            <div className="flex items-center">
                <button className="text-white p-2 mr-4">
                    <FaHeart size={24} />
                </button>
                <button className="text-white p-2 mr-4">
                    <FaClock size={24} />
                </button>
            </div>
        </div>
    );
}

export default Header;
