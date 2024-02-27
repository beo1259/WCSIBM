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
        console.log(data)
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
                title: `${lecture.COURSEID} - Lecture: ${lecture.ROOMID}`,
                start: lectureStartDateTime.toDate(),
                end: moment(lectureStartDateTime).add(lectureDurationHours, 'hour').toDate(),
                allDay: false,
                professor: `${lecture.FIRSTNAME} ${lecture.LASTNAME}`
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
                title: `${lab.COURSEID} - Lab: ${lab.ROOMID}`,
                start: labStartDateTime.toDate(),
                end: moment(labStartDateTime).add(labDurationHours, 'hour').toDate(),
                allDay: false,
                professor: `${lab.FIRSTNAME} ${lab.LASTNAME}`
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

  // Function to check if the date is in the current week
  const isCurrentWeek = (date) => {
    const startOfWeek = moment().startOf('week');
    const endOfWeek = moment().endOf('week');
    return moment(date).isBetween(startOfWeek, endOfWeek);
  };

  // Filter and map the events to get unique events for the current week
  const uniqueEventsForWeek = allEvents
    .filter(event => isCurrentWeek(event.start))
    .reduce((unique, event) => {
      const isDuplicate = unique.some(item => item.title === event.title);
      if (!isDuplicate) {
        unique.push(event);
      }
      return unique;
    }, []);

    uniqueEventsForWeek.sort((a, b) => {
      return moment(a.start).diff(moment(b.start));
    });
  

  // Render the unique course list
  const courseList = uniqueEventsForWeek.map((event, index) => (
    <div key={index} className="mb-2">
      <div className='font-bold'>{event.title}</div>
      <div>{moment(event.start).format('dddd, MMMM Do YYYY')}</div>
      <div>Start time: {moment(event.start).format('h:mma')}</div>
      <div>End time: {moment(event.end).format('h:mma')}</div>
      <div>Professor: {event.professor}</div> 
      <hr/>
    </div>
  ));

  return (
    <div className='h-full w-full'>
      <Calendar
        localizer={localizer}
        events={allEvents}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        step={30}
        min={minTime}
        max={maxTime}
        eventPropGetter={(event, start, end, isSelected) => ({
          className: 'text-xs',
        })}
      />
      <div className="w-full rounded-lg mt-5 bg-gray-100 p-4 overflow-y-auto h-auto">
        <h2 className='text-lg font-bold mb-4'>This Week's Courses:</h2>
        {courseList.length > 0 ? courseList : <p>No courses scheduled this week.</p>}
      </div>
    </div>
  );
};

export default MyCalendarPage;