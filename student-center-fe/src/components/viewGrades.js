import { useEffect, useState } from 'react';
import axios from 'axios';

const GradesPage = () => {
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    const fetchGrades = async () => {
        try {
          const response = await fetch('http://localhost:3005/generate-schedule');
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

  return (
    <div>
      <h1>Student Grades</h1>
      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((grade, index) => (
            <tr key={index}>
              <td>{grade.subject}</td>
              <td>{grade.grade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GradesPage;