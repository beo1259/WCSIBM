'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../header/page';

export default function Courses() {
    const [coursesData, setCoursesData] = useState(null);
    const { push } = useRouter();

    useEffect(() => {
        const fetchCourseData = async () => {

            try {
                const response = await fetch(`http://localhost:3002/api/course`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log('course data fetched:', data);
                setCoursesData(data[0]);
            } catch (error) {
                console.error('Error fetching course data:', error);
            }

        };

        fetchCourseData();
    }, []);

    if (!coursesData) {
        return <div className="text-white flex justify-center align-center">Loading course information...</div>;
    }

    return (
        <>
        <Header/>
        <div className="flex flex-col min-h-screen bg-gradient-to-r from-purple-800 to-purple-500">
            <h1 className='text-white text-4xl p-12'>COURSES</h1>
            <div className="course-info text-white p-12 text-6xl">
                <h1 className='flex justfiy-center text-white'>Available Courses</h1>

            </div>
            <div className='text-white text-xl p-8'>
                <p>CourseID (key): {coursesData.COURSEID}</p>
                <p>Course Code: {coursesData.COURSECODE}</p>
                <p>Course Name: {coursesData.COURSENAME}</p>
                <button className='border border-white outline-white text-white'>Enroll</button>
            </div>
            <button className='border border-white outline-white text-white' onClick={() => push('/academics')}>Back to Academics</button>
        </div>
        </>
    );
}
