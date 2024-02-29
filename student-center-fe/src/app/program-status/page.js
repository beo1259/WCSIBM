'use client'

import {React, useState, useEffect} from 'react';
import Header from '@/components/header';

const program_status = () => {
    //Empty information to place data
    const [programInfo, setProgramInfo] = useState({
        year: '',
        program: '',
        degree: ''
    });

    // API call to get program info
    useEffect(() => {
        //Get ID from session storage
        let stuID = sessionStorage.getItem('studentId');

        const getProgramInfo = async () => {
            try {
                const response = await fetch(`http://localhost:3005/api/student-program?studentId=${stuID}`);
                const data = await response.json();
                // Update state with program information
                setProgramInfo({
                    year: data[0].YEAR,
                    program: data[0].PROGRAMNAME,
                    degree: 'Bsc in Computer Science'
                });
            } catch (error) {
                console.error('Error fetching program info:', error);
            }
        };

        getProgramInfo();
    }, []);

    return(
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-800 to-purple-500">
            <div className="fixed top-0 left-0 w-full z-50">
                <Header />
            </div>
            <div className='flex justify-center items-center h-screen'>
                <div className='bg-white p-48 m-192 rounded-lg drop-shadow-lg'>
                    <p className='text-black'>Name: {programInfo.year}</p>
                    <p className='text-black'>Email: {programInfo.year}</p>
                    <p className='text-black'>StudentID: {programInfo.year}</p>
                    <p className='text-black'>Year: Undergraduate Year {programInfo.year}</p>
                    <p className='text-black'>Program: {programInfo.program}</p>
                    <p className='text-black'>Degree: {programInfo.degree}</p>
                </div>
            </div>
        </div>
    );
}

export default program_status;