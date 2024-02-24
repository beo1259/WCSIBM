'use client'

import { useEffect, useState } from 'react';

const GradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [chosenYear, setChosenYear] = useState('');

  const handleYearChange = (event) => {
    setChosenYear(event.target.value);
  };

  useEffect(() => {
    const fetchGrades = async () => {
      let stuCalendarID = sessionStorage.getItem('studentId');
      try {
        const url = `http://localhost:3005/api/student-grades?studentID=${stuCalendarID}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch grades');
        }
        const data = await response.json();
        setGrades(data);
      } catch (error) {
        console.error('Error fetching grades:', error);
      }
    };
    fetchGrades();
  }, []);

  const minYear = Math.min(...grades.map((grade) => parseInt(grade.YEAR)));
  const maxYear = Math.max(...grades.map((grade) => parseInt(grade.YEAR)));
  const yearOptions = [];
  for (let year = minYear; year <= maxYear; year++) {
    yearOptions.push(<option key={year} value={year}>{year}</option>);
  }

  return (
    <div className='bg-white p-6'>
      <h1 className="text-3xl font-bold mb-6 text-purple-800">View Grades</h1>
      <div className="flex items-center mb-6">
        <label className="font-bold mr-4 text-purple-800">Select Year:</label>
        <select className="border border-purple-300 px-3 py-1 rounded-md text-black" value={chosenYear} onChange={handleYearChange}>
          {yearOptions}
        </select>
      </div>
      <table className="w-full border-collapse border border-purple-300 rounded-md">
        <thead>
          <tr className="bg-purple-200">
            <th className="border border-purple-300 text-black px-4 py-2">Subject</th>
            <th className="border border-purple-300 text-black px-4 py-2">Grade</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((grade, index) => {
            if (grade.YEAR == chosenYear) {
              return (
                <tr key={index} className="hover:bg-purple-100">
                  <td className="border border-purple-300 text-black px-4 py-2">{grade.COURSENAME}</td>
                  <td className="border border-purple-300 text-black px-4 py-2">{grade.GRADE}</td>
                </tr>
              );
            }
          })}
        </tbody>
      </table>
    </div>
  );
};

export default GradesPage;
