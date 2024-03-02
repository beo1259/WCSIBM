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
                console.log(data)
                setProgramInfo({
                    fname: data[0].FIRSTNAME,
                    lname: data[0].LASTNAME,
                    email: data[0].EMAIL,
                    studentid: data[0].STUDENTID,
                    year: data[0].YEAR, 
                    program: data[0].PROGRAMNAME,
                    degree: data[0].DEGREE
                });
            } catch (error) {
                console.error('Error fetching program info:', error);
            }
        };

        getProgramInfo();
    }, []);

    return(
        <div className="flex items-left justify-center min-h-screen bg-gradient-to-r from-purple-800 to-purple-500">
            <div className="fixed top-0 left-0 w-full z-50">
                <Header />
            </div>
            <div className='flex justify-center mt-20 items-center h-screen'>
                <div className='bg-white pt-32 pb-32 pr-10 pl-10 m-4 rounded-lg drop-shadow-lg mb-4'>
                    <p className='text-black text-xl mb-6'><span className='font-bold'>Name:</span> {programInfo.fname} {programInfo.lname} </p>
                    <p className='text-black text-xl mb-6'><span className='font-bold'>Email:</span> {programInfo.email}</p>
                    <p className='text-black text-xl mb-6'><span className='font-bold'>Student ID:</span> {programInfo.studentid}</p>
                    <p className='text-black text-xl mb-6'><span className='font-bold'>Undergraduate year:</span> {programInfo.year}</p>
                    <p className='text-black text-xl mb-6'><span className='font-bold'>Program:</span> {programInfo.program}</p>
                    <p className='text-black text-xl mb-6'><span className='font-bold'>Degree:</span> {programInfo.degree}</p>
                </div>
            </div>
        </div>
    );
}

export default program_status;