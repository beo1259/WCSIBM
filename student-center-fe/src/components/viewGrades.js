import { useEffect, useState } from 'react';
import axios from 'axios';

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
          console.log(data)
          setGrades(data);
          console.log("bye")
        } catch (error) {
          console.error('Error fetching grades:', error);
        }
      };
    
      fetchGrades();
  }, []);

// Getting the min and max year of the student to create the list for grades they can visit
const minYear = Math.min(...grades.map(grade => parseInt(grade.YEAR)));
const maxYear = Math.max(...grades.map(grade => parseInt(grade.YEAR)));
const yearOptions = [];

for (let year = minYear; year <= maxYear; year++) {
  yearOptions.push(<option key={year} value={year}>{year}</option>);
}

  return (
    <div>
      <h1>View Grades</h1>
        <div className="mt-6">
                <label className='font-bold' id="cata">Select Term: </label>
                <select id="yearReqs"  onChange={handleYearChange}>
                    {yearOptions}
                </select>
        </div>
      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Grade</th>
            {/* <th>Semester</th> */}
          </tr>
        </thead>
        <tbody>
        {/* mapping function to iterate through each course and perform get name, grade and semester.  */}
          {grades.map((grade, index) => {
            {/* Found out you gotta use curly brackets with return statement if you use an if statement within. Used to filter by year*/}
            if(grade.YEAR==chosenYear){
            return(
            <tr key={index}>
              <td>{grade.COURSENAME}</td>
              <td>{grade.GRADE}</td>
              {/* <td>{grade.SEMESTER}</td> */}
            </tr>
          )
            }}
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GradesPage;