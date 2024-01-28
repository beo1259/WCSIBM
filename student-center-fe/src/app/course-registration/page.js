'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header'; // Ensure this import path is correct
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // This CSS import assumes you have the react-calendar package installed

const CourseRegistration = () => {
  const [activeMenu, setActiveMenu] = useState('schedule');
  const [date, setDate] = useState(new Date()); // For storing the selected date
  const router = useRouter();

  

  const menuItems = {
    schedule: 'Your Schedule',
    addCourse: 'Add a Course',
    dropCourse: 'Drop a Course',
    swapCourses: 'Swap Courses',
  };

  const onChange = (newDate) => {
    setDate(newDate);
    setCurrentWeek(getCurrentWeek(newDate));
    // Here you will eventually fetch and display the course data for the selected date
  };

  return (
    <>
      <Header />
      <div className="flex flex-row min-h-screen bg-gradient-to-r from-purple-800 to-purple-600 text-white">
        {/* Sidebar */}
        <aside className="w-64 p-6 space-y-6 bg-purple-900">
          <h2 className="text-2xl font-bold">Course Actions</h2>
          {Object.entries(menuItems).map(([key, title]) => (
            <div
              key={key}
              onClick={() => setActiveMenu(key)}
              className={`p-4 text-lg font-semibold rounded-md cursor-pointer hover:bg-purple-700 ${
                activeMenu === key ? 'bg-purple-700' : ''
              }`}
            >
              {title}
            </div>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10 bg-purple-100 text-gray-800">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Course Registration</h1>
            <div className="space-y-4">
              {activeMenu === 'schedule' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Your Schedule</h2>
                  <Calendar onChange={onChange} value={date} />
                  <p className="mt-4">Selected date: {date.toDateString()}</p>
                  {/* Here you can render the schedule or course data */}
                </div>
              )}
              {activeMenu === 'addCourse' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Add Course</h2>
                  <p>Select courses to add...</p>
                  {/* Example Add Course Content */}
                </div>
              )}
              {activeMenu === 'dropCourse' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Drop Course</h2>
                  <p>Select courses to drop...</p>
                  {/* Example Drop Course Content */}
                </div>
              )}
              {activeMenu === 'swapCourses' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Swap Courses</h2>
                  <p>Select courses to swap...</p>
                  {/* Example Swap Course Content */}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default CourseRegistration;
