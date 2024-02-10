'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import MyCalendarPage from '@/components/calendar';

const CourseRegistration = () => {
    const [activeMenu, setActiveMenu] = useState('schedule');
    const [date, setDate] = useState(new Date());
    const router = useRouter();

    const [courses, setCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    //useState for course information
    const [isInfo, setInfo] = useState(false);
    const handleInfo = () => {
        setInfo(!isInfo);
    }

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
    };

    // Filtered list of courses based on the search term
    const filteredCourses = courses.filter((course) =>
        course.COURSENAME.toLowerCase().includes(searchTerm) || course.COURSEID.toLowerCase().includes(searchTerm)
    );

    let stuID = sessionStorage.getItem('studentId')

    console.log(stuID)

    useEffect(() => {
        if (activeMenu === 'addCourse') {
            fetch('http://localhost:3005/api/courses')
                .then((response) => response.json())
                .then((data) => {
                    setCourses(data);
                    console.log(data);
                })
                .catch((error) => {
                    console.error('Error fetching courses:', error);
                });
        }

        const menusThatRequireEnrollmentInfo = ['dropCourse', 'swapCourses'];
        if (menusThatRequireEnrollmentInfo.includes(activeMenu) && stuID) {
            fetch(`http://localhost:3005/api/student-courses?studentId=${stuID}`)
                .then((response) => response.json())
                .then((data) => {
                    setEnrolledCourses(data); // You'll need to define this state variable
                })
                .catch((error) => {
                    console.error('Error fetching enrolled courses:', error);
                });
        }

        const fetchStudentLectures = async () => {
            try {
                const response = await fetch(`http://localhost:3005/api/student-lectures?studentId=${stuID}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                // Set state or further processing here
            } catch (error) {
                console.error('Error fetching student lectures:', error);
            }
        };

        if (activeMenu === 'schedule' && stuID) {
            fetchStudentLectures();
        }
    }, [activeMenu, stuID]);



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
            <div className="fixed top-0 left-0 w-full z-50">
                <Header />
            </div>
            <div className="flex flex-row min-h-screen bg-gradient-to-r from-purple-800 to-purple-600 text-white">
                {/* Fixed Sidebar */}
                <aside className="fixed top-16 left-0 w-54 p-6 space-y-6 bg-purple-900 h-screen overflow-auto">
                    <h2 className="text-2xl font-bold">Course Actions</h2>
                    {Object.entries(menuItems).map(([key, title]) => (
                        <div
                            key={key}
                            onClick={() => setActiveMenu(key)}
                            className={`p-4 text-lg font-semibold rounded-md cursor-pointer hover:bg-purple-700 ${activeMenu === key ? 'bg-purple-700' : ''
                                }`}
                        >
                            {title}
                        </div>
                    ))}
                </aside>

                {/* Main Content */}
                <main className="flex-1 mt-10 ml-60 p-10 bg-purple-100 text-gray-800">
                    <div className="bg-white p-6 rounded-lg shadow-lg">                        <div className="space-y-4">
                        {activeMenu === 'schedule' && (
                            <div>
                                <MyCalendarPage />
                            </div>
                        )}
                        {activeMenu === 'addCourse' && !isInfo && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-2">Add Course</h2>
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    className="mb-4 w-full p-2 border border-gray-300 rounded"
                                    onChange={handleSearchChange}
                                />
                                <div className="space-y-2">
                                    {filteredCourses.map((course) => (
                                        <button
                                            key={course.COURSEID}
                                            onClick={handleInfo}
                                            className="block w-full text-left p-2 bg-purple-200 rounded hover:bg-purple-300 focus:outline-none focus:ring focus:border-purple-300 transition duration-150 ease-in-out"
                                        >
                                            {course.COURSEID} - {course.COURSENAME}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeMenu === 'addCourse' && isInfo && (
                            <div>
                                <p className='mx-6'>hello</p>
                                <button className='bg-purple-200 hover:bg-purple-300 rounded-lg px-4 py-2 mx-6 origin-bottom-right' onClick={handleInfo}>Back</button>
                                <button className='bg-purple-200 hover:bg-purple-300 rounded-lg px-4 py-2 mx-6 origin-bottom-right' onClick={handleInfo}>Enroll</button>
                            </div>
                        )}
                        {activeMenu === 'dropCourse' && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-2">Drop Course</h2>
                                {enrolledCourses.map((course) => (
                                    <button
                                        key={course.COURSEID}
                                        onClick={() => console.log(`Selected course: ${course.COURSEID}`)}
                                        className="block w-full text-left p-2 bg-purple-200 rounded hover:bg-purple-300 focus:outline-none focus:ring focus:border-purple-300 transition duration-150 ease-in-out"
                                    >
                                        {course.COURSEID}
                                    </button>
                                ))}
                            </div>
                        )}
                        {activeMenu === 'swapCourses' && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-2">Swap Courses</h2>
                                {enrolledCourses.map((course) => (
                                    <button
                                        key={course.COURSEID}
                                        onClick={() => console.log(`Selected course: ${course.COURSEID}`)}
                                        className="block w-full text-left p-2 bg-purple-200 rounded hover:bg-purple-300 focus:outline-none focus:ring focus:border-purple-300 transition duration-150 ease-in-out"
                                    >
                                        {course.COURSEID}
                                    </button>
                                ))}
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