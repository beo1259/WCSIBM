  // pages/calendar.js
  import React, { useEffect, useState } from 'react';
  import { Calendar, momentLocalizer } from 'react-big-calendar';
  import moment from 'moment';
  import 'react-big-calendar/lib/css/react-big-calendar.css';

  const localizer = momentLocalizer(moment);

  const MyCalendarPage = () => {
    const [lectures, setLectures] = useState([]);

    let stuCalendarID = sessionStorage.getItem('studentId')

    useEffect(() => {
      const fetchStudentLectures = async () => {
        try {
          const response = await fetch(`http://localhost:3005/api/student-lectures?studentId=${stuCalendarID}`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          const lecturesArray = data.map((lecture) => {
            //Calculate the number of days between the start and end dates
            const daysDifference = moment(lecture.ENDDATE).diff(moment(lecture.STARTDATE), 'days') + 1;

            // Calculate lecture time
            const lectureStartTime = moment(lecture.STARTTIME, 'HH:mm:ss'); // Assuming STARTTIME is in 'HH:mm:ss' format
            const lectureEndTime = moment(lecture.ENDTIME, 'HH:mm:ss'); // Assuming ENDTIME is in 'HH:mm:ss' format

            // Calculate the difference in hours between start and end time
            const lectureDurationHours = lectureEndTime.diff(lectureStartTime, 'hours');

            //Create an array to store lecture events
            const lectureEvents = [];
            //Iterate over each day between start and end dates
            for (let i = 0; i < daysDifference; i++) {
              const currentDate = moment(lecture.STARTDATE).add(i, 'days');
              //Check if the current day matches the weekday of the lecture
              if (currentDate.day() === lecture.WEEKDAY) {
                // Add the start time of the lecture to the current date
                const lectureStartDateTime = currentDate.clone().set({
                  hour: lectureStartTime.get('hour'),
                  minute: lectureStartTime.get('minute'),
                  second: lectureStartTime.get('second'),
                });
                lectureEvents.push({
                  title: lecture.COURSEID,
                  start: lectureStartDateTime.toDate(),
                  end: moment(lectureStartDateTime).add(lectureDurationHours, 'hour').toDate(),
                  allDay: false,
                });
              }
            }
            return lectureEvents;
          });
          //Take the N arrays of repeated lectures and make them into one array
          const temp = lecturesArray.reduce((accumulator, currentArray) => {
            return accumulator.concat(currentArray);
          }, []); //The [] sets accumulator to empty array
          setLectures(temp); 
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