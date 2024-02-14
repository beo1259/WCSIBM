import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const ScheduleGenerationCalendar = () => {
    const [lectures, setLectures] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // New loading state

    function calculateCourseTotals(courses) {
        // Initialize counts
        let breadthAHCount = 0;
        let breadthSSCount = 0;
        let breadthSTCount = 0;
        let essayCreditCount = 0;

        // Iterate over the courses and increment counts accordingly
        courses.forEach(course => {
            if (course.BREADTH === 'AH') breadthAHCount++;
            if (course.BREADTH === 'SS') breadthSSCount++;
            if (course.BREADTH === 'ST') breadthSTCount++;
            if (course.ESSAYCREDIT === 'Y') essayCreditCount++;
        });
        
        let finalAH = 2 - breadthAHCount;
        let finalSS = 2 - breadthSSCount;
        let finalST = 2 - breadthSTCount;
        let finalEssay = 4 - essayCreditCount;

        if (finalAH < 0) {
            finalAH = 0
        }
        if (finalSS < 0) {
            finalSS = 0
        }
        if (finalST < 0) {
            finalST = 0
        }
        if (finalEssay < 0){
            finalEssay = 0
        }


        return { finalAH, finalSS, finalST, finalEssay };
    }

    // Add a state to hold the course totals
    const [courseTotals, setCourseTotals] = useState({
        breadthAHCount: 0,
        breadthSSCount: 0,
        breadthSTCount: 0,
        essayCreditCount: 0,
    });

    useEffect(() => {
        let stuCalendarID = sessionStorage.getItem('studentId');
        if (stuCalendarID) {
            fetchStudentCourses(stuCalendarID);
        }
    }, []);

    async function fetchStudentCourses(stuCalendarID) {
        try {
            const url = `http://localhost:3005/course-category?studentID=${stuCalendarID}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const totals = calculateCourseTotals(data);
            // Update state with the new totals
            setCourseTotals(totals);
            console.log('Breadth and EssayCredit Data:', data);

            data.forEach(course => {
                console.log(`CourseID: ${course.CourseID}, Breadth: ${course.Breadth}, EssayCredit: ${course.EssayCredit}`);
            });
        } catch (error) {
            console.error('Error fetching student courses:', error);
        }
    }


    const scheduleInfo = async () => {
        setIsLoading(true); // Start loading
        setLectures([]); // Clear the calendar while loading
        let stuCalendarID = sessionStorage.getItem('studentId');
        try {
            const response = await fetch('http://localhost:3005/generate-schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ studentID: stuCalendarID }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
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
                step={30}
                min={minTime}
                max={maxTime}
                eventPropGetter={(event, start, end, isSelected) => ({
                    className: 'text-xs',
                })}
            />
            <div className="mt-6">
            <p>You still need <span className="font-bold">{courseTotals.finalSS} </span><span className="underline"><a href="https://www.uwo.ca/arts/counselling/your_degree/breadth_requirements.html" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:text-blue-800 visited:text-purple-600">Category A 'Social Science'</a></span> course(s) to graduate</p>

                <p>You still need <span className="font-bold">{courseTotals.finalAH} </span><span className="underline"><a href="https://www.uwo.ca/arts/counselling/your_degree/breadth_requirements.html" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:text-blue-800 visited:text-purple-600">Category B 'Arts and Humanities'</a></span>course(s) to graduate</p>

                <p>You still need <span className="font-bold">{courseTotals.finalST} </span><span className="underline"><a href="https://www.uwo.ca/arts/counselling/your_degree/breadth_requirements.html" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:text-blue-800 visited:text-purple-600">Category C 'STEM'</a></span>  course(s) to graduate</p>

                <p>You still need <span className="font-bold">{courseTotals.finalEssay} </span><span className="underline"><a href="https://www.uwo.ca/univsec/pdf/academic_policies/registration_progression_grad/coursenumbering.pdf" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:text-blue-800 visited:text-purple-600">Essay</a></span> course(s) to graduate</p>

            </div>

        </div>

    );
};

export default ScheduleGenerationCalendar;
