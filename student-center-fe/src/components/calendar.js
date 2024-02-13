  // pages/calendar.js
  import React, { useEffect, useState } from 'react';
  import { Calendar, momentLocalizer } from 'react-big-calendar';
  import moment from 'moment';
  import 'react-big-calendar/lib/css/react-big-calendar.css';

  const localizer = momentLocalizer(moment);

  const MyCalendarPage = () => {
    const [lectures, setLectures] = useState([]);
    const [labs, setLabs] = useState([]);

    let stuCalendarID = sessionStorage.getItem('studentId')

    useEffect(() => {
      const fetchStudentLectures = async () => {
        try {
          const response = await fetch(`http://localhost:3005/api/student-lectures?studentId=${stuCalendarID}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          console.log (data)
          const lecturesArray = data.map((lecture) => {
            console.log(lecture)
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

          console.log(lecturesArray)
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

      const fetchStudentLabs = async () => {
        try {
          const response = await fetch(`http://localhost:3005/api/student-labs?studentId=${stuCalendarID}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          console.log (data)
          const labsArray = data.map((lab) => {
            console.log(lab)
            //Calculate the number of days between the start and end dates
            const daysDifference = moment(lab.ENDDATE).diff(moment(lab.STARTDATE), 'days') + 1;

            // Calculate lecture time
            const labStartTime = moment(lab.STARTTIME, 'HH:mm:ss'); // Assuming STARTTIME is in 'HH:mm:ss' format
            const labEndTime = moment(lab.ENDTIME, 'HH:mm:ss'); // Assuming ENDTIME is in 'HH:mm:ss' format

            // Calculate the difference in hours between start and end time
            const labDurationHours = labEndTime.diff(labStartTime, 'hours');

            //Create an array to store lecture events
            const labEvents = [];
            //Iterate over each day between start and end dates
            for (let i = 0; i < daysDifference; i++) {
              const currentDate = moment(lab.STARTDATE).add(i, 'days');
              //Check if the current day matches the weekday of the lab
              if (currentDate.day() === lab.WEEKDAY) {
                // Add the start time of the lecture to the current date
                const labStartDateTime = currentDate.clone().set({
                  hour: labStartTime.get('hour'),
                  minute: labStartTime.get('minute'),
                  second: labStartTime.get('second'),
                });
                labEvents.push({
                  title: lab.COURSEID,
                  start: labStartDateTime.toDate(),
                  end: moment(labStartDateTime).add(labDurationHours, 'hour').toDate(),
                  allDay: false,
                });
              }
            }
            return labEvents;
          });

          console.log(labsArray)
          //Take the N arrays of repeated lectures and make them into one array
          const temp = labsArray.reduce((accumulator, currentArray) => {
            return accumulator.concat(currentArray);
          }, []); //The [] sets accumulator to empty array
          setLabs(temp); 
        } catch (error) {
          console.error('Error fetching student labs:', error);
        }
      };
    
      fetchStudentLabs(); 
    }, [stuCalendarID]);


    const minTime = new Date();
    minTime.setHours(9, 0, 0);

    const maxTime = new Date();
    maxTime.setHours(22, 0, 0);

    const allEvents = [...lectures, ...labs];

    return (
      <div className='h-full w-full'>
        <Calendar
          localizer={localizer}
          events={allEvents} // Here you pass the lectures state to the events prop
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          style={{ height: '100%' }}
          min={minTime}
          max={maxTime}
          eventPropGetter={(event, start, end, isSelected) => ({
            className: 'text-xs', // Adjust the font size using Tailwind's text classes
          })}
        />
      </div>
    );
  };

  export default MyCalendarPage;