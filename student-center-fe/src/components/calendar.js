// pages/calendar.js
import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const MyCalendarPage = () => {
  const [lectures, setLectures] = useState([]);

  let stuCalendarID = sessionStorage.getItem('studentId')
  console.log(stuCalendarID)

  useEffect(() => {
    const fetchStudentLectures = async () => {
      try {
        const response = await fetch(`http://localhost:3005/api/student-lectures?studentId=${stuCalendarID}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const lecturesArray = data.map((lecture) => {
          return {
            title: lecture.COURSEID,
            start: moment(lecture.STARTDATE, 'YYYY-MM-DD').day(lecture.WEEKDAY).set({
              hour: moment(lecture.STARTTIME, 'HH:mm:ss').get('hour'),
              minute: moment(lecture.STARTTIME, 'HH:mm:ss').get('minute'),
            }).toDate(),
            end: moment(lecture.STARTDATE, 'YYYY-MM-DD').day(lecture.WEEKDAY).set({
              hour: moment(lecture.ENDTIME, 'HH:mm:ss').get('hour'),
              minute: moment(lecture.ENDTIME, 'HH:mm:ss').get('minute'),
            }).toDate(),
            allDay: false
          };
        });
  
        setLectures(lecturesArray); 
      } catch (error) {
        console.error('Error fetching student lectures:', error);
      }
    };
  
    fetchStudentLectures(); 
  }, [stuCalendarID]);

  useEffect(() => {
    if (lectures.length > 0) {
      lectures.forEach((lecture) => {
        console.log(lecture.title); // Assuming the title holds the COURSEID
        console.log(lecture.start)
      });
    }
  }, [lectures]);

  const minTime = new Date();
  minTime.setHours(9, 0, 0);

  const maxTime = new Date();
  maxTime.setHours(22, 0, 0);

  return (
    <div style={{ height: '90vh', width: '80%', margin: '0 auto' }}>
      <Calendar
        localizer={localizer}
        events={lectures} // Here you pass the lectures state to the events prop
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        style={{ height: '100%' }}
        min={minTime}
        max={maxTime}
      />
    </div>
  );
};

export default MyCalendarPage;