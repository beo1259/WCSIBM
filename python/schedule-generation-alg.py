import ibm_db
from datetime import datetime
import random

dsn = (
    "DATABASE=WCS2024;"
    "HOSTNAME=148.100.78.14;"
    "PORT=50000;"
    "PROTOCOL=TCPIP;"
    "UID=db2inst1;"
    "PWD=Zmframewcs_54379@;"
)

conn = ibm_db.connect(dsn, '', '')

def connect_to_db(dsn):
    try:
        db_conn = ibm_db.connect(dsn, "", "")
        print("Connected to the database successfully.")
        return db_conn
    except Exception as e:
        print("An error occurred while connecting to the database:", e)
        return None

def get_program_id_for_student(student_id, db_conn):
    program_id_query = f"SELECT PROGRAMID FROM STUCENTR.ProgramEnrollment WHERE StudentID = '{student_id}'"
    stmt = ibm_db.exec_immediate(db_conn, program_id_query)
    program_id_row = ibm_db.fetch_assoc(stmt)
    if program_id_row:
        return program_id_row['PROGRAMID']
    else:
        return None

def fetch_program_requirements(program_id, db_conn):
    required_courses_query = f"SELECT COURSEID FROM STUCENTR.ProgramReq WHERE ProgramID = '{program_id}'"
    stmt = ibm_db.exec_immediate(db_conn, required_courses_query)
    
    required_courses = []
    course_row = ibm_db.fetch_assoc(stmt)
    while course_row:
        required_courses.append(course_row['COURSEID'])
        course_row = ibm_db.fetch_assoc(stmt)
    
    return required_courses
def fetch_requirement_courses(db_conn, student_id, scheduled_courses):
    essay_courses = []
    breadth_courses = {'ST': [], 'SS': [], 'AH': []}

    # Fetch essay courses with their times
    essay_query = """
    SELECT c.COURSEID, l.STARTTIME, l.ENDTIME, l.WEEKDAY
    FROM STUCENTR.Course c
    JOIN STUCENTR.Lecture l ON c.COURSEID = l.COURSEID
    WHERE c.ESSAYCREDIT = 'Y'
    """
    essay_stmt = ibm_db.exec_immediate(db_conn, essay_query)
    essay_row = ibm_db.fetch_assoc(essay_stmt)
    while essay_row:
        if not check_time_conflicts(essay_row, scheduled_courses):
            essay_courses.append(essay_row)
        essay_row = ibm_db.fetch_assoc(essay_stmt)

    # Fetch breadth courses with their times
    breadth_query = """
    SELECT c.COURSEID, l.STARTTIME, l.ENDTIME, l.WEEKDAY, c.BREADTH
    FROM STUCENTR.Course c
    JOIN STUCENTR.Lecture l ON c.COURSEID = l.COURSEID
    WHERE c.BREADTH IN ('ST', 'SS', 'AH')
    """
    breadth_stmt = ibm_db.exec_immediate(db_conn, breadth_query)
    breadth_row = ibm_db.fetch_assoc(breadth_stmt)
    while breadth_row:
        if not check_time_conflicts(breadth_row, scheduled_courses):
            category = breadth_row['BREADTH']
            breadth_courses[category].append(breadth_row)
        breadth_row = ibm_db.fetch_assoc(breadth_stmt)

    return essay_courses, breadth_courses



def check_prerequisites(course_id, student_id, db_conn):
    # Query to find the prerequisite courses for the given course_id
    prerequisite_query = f"SELECT PREREQUISITEID FROM STUCENTR.Prerequisite WHERE COURSEID = '{course_id}'"
    prereq_stmt = ibm_db.exec_immediate(db_conn, prerequisite_query)
    
    prerequisites_met = True
    prereq_row = ibm_db.fetch_assoc(prereq_stmt)
    while prereq_row:
        prerequisite_course_id = prereq_row['PREREQUISITEID']
        
        # Check if the student has completed this prerequisite
        completion_query = f"SELECT * FROM STUCENTR.PrevEnrollment WHERE StudentID = '{student_id}' AND CourseID = '{prerequisite_course_id}'"
        completion_stmt = ibm_db.exec_immediate(db_conn, completion_query)
        if not ibm_db.fetch_assoc(completion_stmt):
            # If any prerequisite is not met, set prerequisites_met to False
            prerequisites_met = False
            break  # No need to check further prerequisites if one is missing
        
        prereq_row = ibm_db.fetch_assoc(prereq_stmt)
    
    return prerequisites_met

def find_course_times(course_id, db_conn):
    # Initialize lists to hold lecture and lab times
    lecture_times = []
    lab_times = []

    # SQL query to find lecture times for the course
    lecture_query = f"SELECT STARTTIME, ENDTIME, WEEKDAY FROM STUCENTR.Lecture WHERE COURSEID = '{course_id}'"
    lecture_stmt = ibm_db.exec_immediate(db_conn, lecture_query)
    
    lecture_row = ibm_db.fetch_assoc(lecture_stmt)
    while lecture_row:
        # Append each found lecture time to the lecture_times list
        lecture_times.append({
            'STARTTIME': lecture_row['STARTTIME'],
            'ENDTIME': lecture_row['ENDTIME'],
            'WEEKDAY': lecture_row['WEEKDAY']
        })
        lecture_row = ibm_db.fetch_assoc(lecture_stmt)

    # SQL query to find lab times for the course
    lab_query = f"SELECT STARTTIME, ENDTIME, WEEKDAY FROM STUCENTR.Lab WHERE COURSEID = '{course_id}'"
    lab_stmt = ibm_db.exec_immediate(db_conn, lab_query)
    
    lab_row = ibm_db.fetch_assoc(lab_stmt)
    while lab_row:
        # Append each found lab time to the lab_times list
        lab_times.append({
            'STARTTIME': lab_row['STARTTIME'],
            'ENDTIME': lab_row['ENDTIME'],
            'WEEKDAY': lab_row['WEEKDAY']
        })
        lab_row = ibm_db.fetch_assoc(lab_stmt)

    return lecture_times, lab_times


def check_time_conflicts(new_time, scheduled_times):
    # Parse the 'HH:MM:SS' strings into datetime.time objects for comparison
    if isinstance(new_time['STARTTIME'], str):
        new_start = datetime.strptime(new_time['STARTTIME'], '%H:%M:%S').time()
        new_end = datetime.strptime(new_time['ENDTIME'], '%H:%M:%S').time()
    else:
        new_start = new_time['STARTTIME']
        new_end = new_time['ENDTIME']
    new_weekday = new_time['WEEKDAY']

    for scheduled_time in scheduled_times:
        if isinstance(scheduled_time['STARTTIME'], str):
            scheduled_start = datetime.strptime(scheduled_time['STARTTIME'], '%H:%M:%S').time()
            scheduled_end = datetime.strptime(scheduled_time['ENDTIME'], '%H:%M:%S').time()
        else:
            scheduled_start = scheduled_time['STARTTIME']
            scheduled_end = scheduled_time['ENDTIME']
            
        scheduled_weekday = scheduled_time['WEEKDAY']
        
        # Check if the new time is on the same day as the scheduled time
        if new_weekday == scheduled_weekday:
            # Time overlap occurs if the new start time is before the scheduled end time
            # and the new end time is after the scheduled start time
            if (new_start < scheduled_end and new_end > scheduled_start) or (scheduled_start < new_end and scheduled_end > new_start):
                return True  # Conflict exists

    # If no conflicts are found, return False
    return False

def has_taken_course(student_id, course_id, db_conn):
    prev_enrollment_query = f"SELECT * FROM STUCENTR.PrevEnrollment WHERE StudentID = '{student_id}' AND COURSEID = '{course_id}'"
    stmt = ibm_db.exec_immediate(db_conn, prev_enrollment_query)
    return bool(ibm_db.fetch_assoc(stmt))

def add_course_to_schedule(course, schedule):
    # Check for conflicts with lecture time
    lecture_conflict = check_time_conflicts(course['LectureTime'], schedule)
    if lecture_conflict:
        print(f"Conflict detected for lecture of course {course['COURSEID']}. Cannot add to schedule.")
        return False  # Indicates the course was not added due to conflict

    # Check for conflicts with lab time
    lab_conflict = check_time_conflicts(course['LabTime'], schedule)
    if lab_conflict:
        print(f"Conflict detected for lab of course {course['COURSEID']}. Cannot add to schedule.")
        return False  # Indicates the course was not added due to conflict

    # If no conflicts, add lecture and lab to schedule
    schedule.append({'CourseID': course['COURSEID'], 'Type': 'Lecture', **course['LectureTime']})
    schedule.append({'CourseID': course['COURSEID'], 'Type': 'Lab', **course['LabTime']})

    print(f"Course {course['COURSEID']} added to schedule.")
    return True  # Indicates the course was successfully added

def schedule_remaining_courses(db_conn, student_id, scheduled_courses):
    # Assume scheduled_courses is updated with program requirements
    num_program_courses = len(scheduled_courses)
    slots_left = 5 - num_program_courses  # Assuming a total of 5 courses needed

    essay_courses, breadth_courses = fetch_requirement_courses(db_conn, student_id, scheduled_courses)

    # Schedule essay courses if needed
    for _ in range(min(4, slots_left)):  # Assuming 4 essay courses are needed
        if essay_courses:
            course = essay_courses.pop(0)  # Select the first available essay course
            add_course_to_schedule(course, scheduled_courses)
            slots_left -= 1

    # Schedule breadth courses if needed, ensuring 2 courses from the breadth categories are selected
    breadth_needed = 2  # Assuming 2 breadth courses are needed
    for category in ['ST', 'SS', 'AH']:
        while breadth_courses[category] and breadth_needed > 0 and slots_left > 0:
            course = breadth_courses[category].pop(0)  # Select the first available course in the category
            if add_course_to_schedule(course, scheduled_courses):
                slots_left -= 1
                breadth_needed -= 1

    # Add logic if additional elective courses are needed to fill the schedule,
    # ensuring no time conflicts and meeting any remaining graduation requirements.


def generate_schedule(student_id):
    db_conn = connect_to_db(dsn)
    if not db_conn:
        print("Failed to connect to the database.")
        return

    program_id = get_program_id_for_student(student_id, db_conn)
    if not program_id:
        print(f"No program found for student ID {student_id}.")
        return

    required_courses = fetch_program_requirements(program_id, db_conn)
    max_required_courses = random.choice([3, 4])
    scheduled_courses = []  # To store scheduled course details
    scheduled_times = []  # To store only the times for conflict checking
    num_courses_scheduled = 0  # Track the number of scheduled courses

    # Schedule required program courses
    for course_id in required_courses:
        if num_courses_scheduled >= max_required_courses:
            # If 4 courses have already been scheduled, break out of the loop
            break

        if has_taken_course(student_id, course_id, db_conn):
            print(f"Student {student_id} has already taken course {course_id}. Skipping.")
            continue

        if not check_prerequisites(course_id, student_id, db_conn):
            print(f"Prerequisites for course {course_id} not met by student {student_id}. Skipping.")
            continue

        lecture_times, lab_times = find_course_times(course_id, db_conn)
        for lecture_time, lab_time in zip(lecture_times, lab_times):
            # Assuming that lecture_times and lab_times are aligned and both exist for each course
            if not check_time_conflicts(lecture_time, scheduled_times) and not check_time_conflicts(lab_time, scheduled_times):
                scheduled_courses.append({'COURSEID': course_id, 'Type': 'Lecture', **lecture_time})
                scheduled_courses.append({'COURSEID': course_id, 'Type': 'Lab', **lab_time})
                scheduled_times.append(lecture_time)
                scheduled_times.append(lab_time)
                num_courses_scheduled += 1
                print(f"Course {course_id} added to schedule with lecture and lab.")
                break  # Found a non-conflicting time, move to the next course

    # Fetch and schedule essay and breadth requirement courses if needed
    if num_courses_scheduled < 5:
        essay_courses, breadth_courses = fetch_requirement_courses(db_conn, student_id, scheduled_courses)
        # Try to add essay and breadth courses to fill the schedule up to 5 courses
        for course_list in [essay_courses] + list(breadth_courses.values()):
            for course in course_list:
                if num_courses_scheduled >= 5:
                    break  # Schedule is full
                if not check_time_conflicts(course, scheduled_times):
                    scheduled_courses.append(course)
                    scheduled_times.append(course)
                    num_courses_scheduled += 1
                    print(f"Course {course['COURSEID']} added to fulfill breadth/essay requirement.")

    counter = 0

    # Print the final schedule
    print('\nSCHEDULE INFO:\n')
    for course in scheduled_courses:
        
        if 'Type' in course:
            print(f"COURSEID: {course['COURSEID']}, Type: {course['Type']}, StartTime: {course['STARTTIME']}, EndTime: {course['ENDTIME']}")
        else:
            
            print(f"COURSEID: {course['COURSEID']}, StartTime: {course['STARTTIME']}, EndTime: {course['ENDTIME']}")
            print('\n')
        
        counter += 1
        if counter % 2 == 0:
            print('\n')
    
    ibm_db.close(db_conn)

# Example call to generate_schedule
generate_schedule('823321975')
