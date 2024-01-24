'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 


export default function Academics() {
  const [studentData, setStudentData] = useState(null);
  const {push} = useRouter();

  useEffect(() => {
    const fetchStudentData = async () => {
      // Retrieve the student ID from localStorage
      const studentId = localStorage.getItem('id');
      console.log('Student ID from localStorage:', studentId); // For debugging

      if (studentId) {
        try {
          const response = await fetch(`http://localhost:3002/api/student/${studentId}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          console.log('Student data fetched:', data); // For debugging
          // Assuming the API returns an array and we need the first object
          setStudentData(data[0]);
        } catch (error) {
          console.error('Error fetching student data:', error);
        }
      }
    };

    fetchStudentData();
  }, []);

  if (!studentData) {
    return <div className="text-white flex justify-center align-center">Loading student information...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-purple-800 to-purple-500">
      <h1 className='text-white text-4xl p-12'>ACADEMICS</h1>
        <div className="student-info text-white p-12">
          <p>Name: {studentData.NAME}</p>
          <p>Degree: {studentData.DEGREE}</p>
          <p>Credits Earned: {studentData.CREDITSEARNED}</p>
          <p>Credits Left: {studentData.CREDITSLEFT}</p>
          <p>Transcript ID: {studentData.TRANSCRIPT}</p>
          <p>Scholarship Details: {studentData.SCHOLARSHIPDETAILS}</p>
          <p>Academic Calendar: {studentData.CURRENTACADEMICCALENDAR}</p>
          <p>Has Generated Schedule: {studentData.GENERATEDSCHEDULE ? 'Yes' : 'No'}</p>
          <p>Email: {studentData.EMAIL}</p>
          <p>Password: {studentData.PASSWORD}</p>
          <p>GPA: {studentData.GPA}</p>
        </div>
        <button className='border border-white outline-white text-white'
        onClick={() => push('/courses')}>Courses</button>
 
    </div>
  );
}
