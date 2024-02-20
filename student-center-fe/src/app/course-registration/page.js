'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { useRouter } from 'next/router';
import Header from '@/components/header';
import MyCalendarPage from '@/components/calendar';
import ScheduleGenerationCalendar from '@/components/scheduleGenCalendar';

const CourseRegistration = () => {
    const [date, setDate] = useState(new Date());
    const router = useRouter();

    //Temp to display for confirmation message
    const [tempStoreLecture, setTempStoreLecture] = useState([]);
    const [tempStoreLab, setTempStoreLab] = useState([]);

    const [activeMenu, setActiveMenu] = useState('schedule');
    
    useEffect(() => {
        const menuFromSessionStorage = sessionStorage.getItem("searching");
        console.log("first checkpoint")
        console.log(sessionStorage.getItem("searching"))
        if (menuFromSessionStorage) {
            console.log("we cooking")
            console.log(menuFromSessionStorage)
          setActiveMenu(menuFromSessionStorage);
        }
      }, []);


    let [courses, setCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    
    //useState for course information
    const [isInfo, setInfo] = useState(false);
    const handleInfo = async (courseID) => {
        courseInformation(courseID);
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
            fetch(`http://localhost:3005/api/courses?studentID=${stuID}`)
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
        scheduleGeneration: 'Generate Schedule 🪄'
    };

    const onChange = (newDate) => {
        setDate(newDate);
        setCurrentWeek(getCurrentWeek(newDate));
        // Here you will eventually fetch and display the course data for the selected date
    };

    //Call API to get specific course information
    const courseInformation = async (courseID) => {
        const response = await fetch(`http://localhost:3005/api/course-information?courseID=${courseID}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        //Separate lab and lecture data
        let lectures = []; let labs = [];
        for(let i=0;i<data.length;i++){
            if(data[i].hasOwnProperty('LECTUREID'))
                lectures.push(data[i]);
            else
                labs.push(data[i]);
        }
        setTempStoreLecture(lectures);
        setTempStoreLab(labs);
    }

    return (
        <>
            <div className="fixed top-0 left-0 w-full z-50">
                <Header />
            </div>
            <div className="flex flex-row min-h-screen bg-gradient-to-r from-purple-800 to-purple-600 text-white">
                {/* Fixed Sidebar */}
                <aside className="fixed top-16 left-0 w-68 p-6 space-y-6 bg-purple-900 h-screen overflow-auto">
                    <h2 className="text-2xl font-bold">Course Actions</h2>
                    {Object.entries(menuItems).map(([key, title]) => (
                        <div
                            key={key}
                            onClick={() => setActiveMenu(key)}
                            className={`p-4 text-lg font-semibold rounded-xl cursor-pointer hover:bg-purple-700 transition ease ${activeMenu === key ? 'bg-purple-700' : ''
                                }`}
                        >
                            {title}
                        </div>
                    ))}
                </aside>

                {/* Main Content */}
                <main className="flex-1 mt-10 ml-64 p-10 bg-purple-100 text-gray-800">
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
                                            onClick={() => handleInfo(course.COURSEID)}
                                            className="block w-full text-left p-2 bg-purple-200 rounded-lg hover:bg-purple-300 focus:outline-none focus:ring focus:border-purple-300 transition duration-150 ease-in-out"
                                        >
                                            {course.COURSEID} - {course.COURSENAME}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/*Enrollment confirmation*/}
                        {activeMenu === 'addCourse' && isInfo && (
                            <div>
                                <p className='font-semibold border-b-2 border-black mb-4'>Lectures</p>
                                <table className='w-full p-6 divide-y-2'>
                                    <tr className='grid grid-cols-5'>
                                        <th>SECTION</th>
                                        <th>ROOM</th>
                                        <th>TIME</th>
                                        <th>START/END DATE</th>
                                        <th>ENROLL</th>
                                    </tr>
                                    {tempStoreLecture.map((value, key) => {
                                        return(
                                            <tr className='grid grid-cols-5 text-center'>
                                                <td key={key}>{value.LECTUREID}</td>
                                                <td key={key}>{value.ROOMID}</td>
                                                <td key={key}>{value.STARTTIME} - {value.ENDTIME}</td>
                                                <td key={key}>{value.STARTDATE} - {value.ENDDATE}</td>
                                                <input type='checkbox' className='scale-[25%]'></input>
                                            </tr>
                                        );
                                    })}
                                </table>
                                <p className='font-semibold border-b-2 border-black mb-4'>Labs</p>
                                <table className='w-full p-6 divide-y-2'>
                                    <tr className='grid grid-cols-5 pt-6'>
                                        <th>SECTION</th>
                                        <th>ROOM</th>
                                        <th>TIME</th>
                                        <th>START/END DATE</th>
                                        <th>ENROLL</th>
                                    </tr>
                                    {tempStoreLab.map((value, key) => {
                                        return(
                                            <tr className='grid grid-cols-5 text-center'>
                                                <td key={key}>{value.LABID}</td>
                                                <td key={key}>{value.ROOMID}</td>
                                                <td key={key}>{value.STARTTIME} - {value.ENDTIME}</td>
                                                <td key={key}>{value.STARTDATE} - {value.ENDDATE}</td>
                                                <input type='checkbox' className='scale-[25%]'></input>
                                            </tr>
                                        );
                                    })}
                                </table>
                                <div className='inline justify-between'>
                                    <button className='bg-purple-200 hover:bg-purple-300 rounded-lg px-4 py-2 m-6' onClick={handleInfo}>Back</button>
                                    <button className='bg-purple-200 hover:bg-purple-300 rounded-lg px-4 py-2 m-6' onClick={handleInfo}>Confirm</button>
                                </div>
                            </div>
                        )}
                        {activeMenu === 'dropCourse' && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-2">Drop Course</h2>
                                <div className="space-y-2">
                                {enrolledCourses.map((course) => (
                                    <button
                                        key={course.COURSEID}
                                        onClick={() => console.log(`Selected course: ${course.COURSEID}`)}
                                        className="block w-full text-left p-2 bg-purple-200 rounded-lg hover:bg-purple-300 focus:outline-none focus:ring focus:border-purple-300 transition duration-150 ease-in-out"
                                    >
                                        {course.COURSEID}
                                    </button>
                                ))}
                                </div>
                            </div>
                        )}
                        {activeMenu === 'swapCourses' && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-2">Swap Courses</h2>
                                <div className="space-y-2">
                                {enrolledCourses.map((course) => (
                                    <button
                                        key={course.COURSEID}
                                        onClick={() => console.log(`Selected course: ${course.COURSEID}`)}
                                        className="block w-full text-left p-2 bg-purple-200 rounded-lg hover:bg-purple-300 focus:outline-none focus:ring focus:border-purple-300 transition duration-150 ease-in-out"
                                    >
                                        {course.COURSEID}
                                    </button>
                                ))}
                                </div>
                            </div>
                        )}
                        {activeMenu === 'scheduleGeneration' && (
                            <div>
                                <ScheduleGenerationCalendar/>
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