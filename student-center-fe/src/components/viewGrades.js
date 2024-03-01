'use client'

import { useEffect, useState } from 'react';
import Header from './header';

const GradesPage = () => {
  const d = new Date();
  let year = d.getFullYear();
  let currentYear = year - 1;

  const [grades, setGrades] = useState([]);
  const [chosenYear, setChosenYear] = useState(currentYear.toString());
  // Initialize yearAverages as a Map for easier access by year key
  const [yearAverages, setYearAverages] = useState(new Map());

  const handleYearChange = (event) => {
    setChosenYear(event.target.value);
  };

  useEffect(() => {
    // Retrieve the stored averages and convert back to a Map

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
        if (!response.ok) throw new Error('Failed to fetch grades');
        const data = await response.json();
        setGrades(data);

        // Extract unique years from the fetched grades
        const uniqueYears = new Set(data.map(grade => grade.YEAR));
        const yearArray = Array.from(uniqueYears);


        // Store the years in session storage
        sessionStorage.setItem('yearArray', JSON.stringify(yearArray));
      } catch (error) {
        console.error('Error fetching grades:', error);
      }
    };
    fetchGrades();
  }, []);

  const storedAverages = new Map(JSON.parse(sessionStorage.getItem('avgMapJSON') || '[]'));

  console.log(chosenYear);

  let yearChosen = parseInt(chosenYear);
  console.log(storedAverages.get(yearChosen));

  const averageValueObject = storedAverages.get(yearChosen);

  // Generate year options from grades data
  const yearOptions = Array.from(new Set(grades.map(grade => grade.YEAR)))
    .sort((a, b) => a - b)
    .map(year => <option key={year} value={year}>{year}</option>);

  return (
    <>
      <Header />
      <div className='bg-white p-6 h-screen'>
        <h1 className="text-3xl font-bold mb-6 text-purple-800">View Grades</h1>
        <div className="flex items-center bg-white mb-6">
          <label className="font-bold mr-4 text-purple-800">Select Year:</label>
          <select className="border border-purple-300 px-3 py-1 rounded-md text-black mr-4" value={chosenYear} onChange={(e) => setChosenYear(e.target.value)}>
            {yearOptions}
          </select>
          {/* Directly display the average for the selected year */}
          <span className="font-bold text-purple-800">
            Average: {averageValueObject} (mid, get better.)
          </span>
        </div>
        <table className="w-full border-collapse border border-purple-300 rounded-md">
          <thead>
            <tr className="bg-purple-200">
              <th className="border border-purple-300 text-black px-4 py-2">Subject</th>
              <th className="border border-purple-300 text-black px-4 py-2">Grade</th>
            </tr>
          </thead>
          <tbody>
            {grades.filter(grade => grade.YEAR == chosenYear).map((grade, index) => (
              <tr key={index} className="hover:bg-purple-100">
                <td className="border border-purple-300 text-black px-4 py-2">{grade.COURSENAME}</td>
                <td className="border border-purple-300 text-black px-4 py-2">{grade.GRADE}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default GradesPage;
