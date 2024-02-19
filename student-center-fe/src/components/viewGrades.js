import { useEffect, useState } from 'react';
import axios from 'axios';

const GradesPage = () => {
  const [grades, setGrades] = useState([]);

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

  return (
    <div>
      <h1>Student Grades</h1>
      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Grade</th>
            <th>Semester</th>
          </tr>
        </thead>
        <tbody>
        {/* mapping function to iterate through each course and perform get name, grade and semester.  */}
          {grades.map((grade, index) => {
            {/* Found out you gotta use curly brackets with return statement if you use an if statement within. Used to filter by year*/}
            if(grade.GRADE>80){
            return(
            <tr key={index}>
              <td>{grade.COURSENAME}</td>
              <td>{grade.GRADE}</td>
              <td>{grade.GRADE}</td>
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