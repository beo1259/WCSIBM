import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const ScheduleGenerationCalendar = () => {
    const [lectures, setLectures] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // New loading state

    const scheduleInfo = async () => {
        setIsLoading(true); // Start loading
        setLectures([]); // Clear the calendar while loading
        let stuCalendarID = sessionStorage.getItem('studentId');
        try {
            const response = await fetch(`http://localhost:3005/generate-schedule?studentID=${stuCalendarID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const data = await response.json();
            const lecturesArray = data.map((lecture) => {
                const daysDifference = moment(lecture.ENDDATE).diff(moment(lecture.STARTDATE), 'days') + 1;
                const lectureStartTime = moment(lecture.STARTTIME, 'HH:mm:ss');
                const lectureEndTime = moment(lecture.ENDTIME, 'HH:mm:ss');
                const lectureEvents = [];

                for (let i = 0; i < daysDifference; i++) {
                    const currentDate = moment(lecture.STARTDATE).add(i, 'days');
                    if (currentDate.day() === lecture.WEEKDAY) {
                        const lectureStartDateTime = currentDate.clone().set({
                            hour: lectureStartTime.get('hour'),
                            minute: lectureStartTime.get('minute'),
                            second: lectureStartTime.get('second'),
                        });
                        lectureEvents.push({
                            title: lecture.COURSEID,
                            start: lectureStartDateTime.toDate(),
                            end: moment(lectureStartDateTime).add(lectureEndTime.diff(lectureStartTime, 'hours'), 'hour').toDate(),
                            allDay: false,
                        });
                    }
                }
                return lectureEvents;
            });

            const temp = lecturesArray.reduce((accumulator, currentArray) => accumulator.concat(currentArray), []);
            setLectures(temp);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false); // End loading
        }
    };

    const minTime = new Date();
    minTime.setHours(9, 0, 0);

    const maxTime = new Date();
    maxTime.setHours(22, 0, 0);

    return (
        <div className='h-full w-full relative'>
            {isLoading && (
                <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-center z-10 bg-white bg-opacity-75">
                    <div className="spinner border-t-8 border-b-8 border-purple-500 rounded-full w-20 h-20 animate-spin mb-4"></div>
                    <div className="text-purple-500 font-bold">Loading... ✨</div>
                </div>
            )}
            <button
                className="p-2 bg-purple-600 shadow-md text-white rounded-lg shadow-md hover:bg-violet-700 hover:shadow-xl transition duration-300 mb-4"

                onClick={scheduleInfo}>
                Generate Schedule
            </button>
            <Calendar
                localizer={localizer}
                events={lectures}
                startAccessor="start"
                endAccessor="end"
                defaultView="week"
                style={{ height: '100%' }}
                min={minTime}
                max={maxTime}
                eventPropGetter={(event, start, end, isSelected) => ({
                    className: 'text-xs',
                })}
            />
        </div>
    );
};

export default ScheduleGenerationCalendar;
