'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { push } = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const loginResponse = await fetch('http://localhost:3005/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!loginResponse.ok) {
        throw new Error('Login failed');
      }

      push('/dashboard');

      const loginData = await loginResponse.json();
      sessionStorage.setItem('studentId', loginData.user.STUDENTID);

      // Fetch grades and set years in session storage
      const yearArray = await fetchGradesAndSetYears();
      
      // Now, fetch averages using the yearArray
      await fetchAverages(loginData.user.STUDENTID, yearArray);

    } catch (error) {
      console.error('Login request failed:', error);
    }
  };

  const fetchGradesAndSetYears = async () => {
    let stuCalendarID = sessionStorage.getItem('studentId');
    try {
      const response = await fetch(`http://localhost:3005/api/student-grades?studentID=${stuCalendarID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch grades');
      }

      const gradesData = await response.json();
      const uniqueYears = Array.from(new Set(gradesData.map(grade => grade.YEAR)));
      sessionStorage.setItem('yearArray', JSON.stringify(uniqueYears));
      return uniqueYears; // Return this array for immediate use
    } catch (error) {
      console.error('Error fetching grades:', error);
      return []; // Return an empty array to handle error state
    }
  };

  const fetchAverages = async (studentId, yearArray) => {
    const avgMap = new Map();
    try {
      const averages = await Promise.all(
        yearArray.map(year => fetchAverageForYear(studentId, year))
      );

      averages.forEach((avg, index) => {
        avgMap.set(yearArray[index], avg);
      });

      sessionStorage.setItem('avgMapJSON', JSON.stringify(Array.from(avgMap.entries())));
    } catch (error) {
      console.error('Error fetching averages:', error);
    }
  };

  const fetchAverageForYear = async (studentId, year) => {
    try {
      const response = await fetch(`http://localhost:3005/get-average`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentID: studentId, year }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const avg = await response.json(); // Assuming the server sends JSON
      return avg; // Adjust based on the actual response structure
    } catch (error) {
      console.error(`Error fetching average for year: ${year}`, error);
      return { average: null };
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-800 to-purple-500 ">
      <div className="p-6 max-w-2xl w-full max-h-64 h-full bg-gradient-to-r from-purple-300 to-purple-100 rounded-2xl shadow-md">
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-900">Email</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 p-2 text-black block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2 text-black block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-violet-700 hover:bg-violet-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
