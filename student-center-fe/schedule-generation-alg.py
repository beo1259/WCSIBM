import ibm_db
from datetime import datetime
import random
import sys
import json
import requests

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
        return db_conn
    except Exception as e:
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

def fetch_requirement_courses(db_conn, student_id, scheduled_courses, catA, catB, catC, catEssay):
    essay_courses = []
    breadth_courses = {'ST': [], 'SS': [], 'AH': []}

    # Fetch essay courses with their times
    essay_query = """
    SELECT c.COURSEID, c.COURSENAME, l.ROOMID, l.STARTTIME, l.ENDTIME, l.WEEKDAY, l.STARTDATE, l.ENDDATE
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
    SELECT c.COURSEID, c.COURSENAME, c.ESSAYCREDIT, l.ROOMID, l.STARTTIME, l.ENDTIME, l.WEEKDAY, l.STARTDATE, l.ENDDATE, c.BREADTH
    FROM STUCENTR.Course c 
    JOIN STUCENTR.Lecture l ON c.COURSEID = l.COURSEID
    WHERE c.BREADTH IN ('ST', 'SS', 'AH')
    """
    
    
    
    breadth_stmt = ibm_db.exec_immediate(db_conn, breadth_query)
    breadth_row = ibm_db.fetch_assoc(breadth_stmt)
    


    while breadth_row:
        if not check_time_conflicts(breadth_row, scheduled_courses):
            
            category = breadth_row['BREADTH']
            
            #print(f"A: {catA} B: {catB} C: {catC} Essay: {catEssay}")
            # Check which course makes the most sense to add
            if (catA == True) and category == 'SS' :
                breadth_courses[category].append(breadth_row)
            if (catB == True) and category == 'AH' :
                breadth_courses[category].append(breadth_row)
            if (catC == True) and category == 'ST':
                breadth_courses[category].append(breadth_row)
            if (catEssay == True) and breadth_row['ESSAYCREDIT'] == 'Y' :
                breadth_courses[category].append(breadth_row)
            if(catA != True and catB != True and catC != True and catEssay != True) :
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
        completion_query2 = f"SELECT * FROM STUCENTR.Enrollment WHERE StudentID = '{student_id}' AND CourseID = '{prerequisite_course_id}'"
        completion_stmt = ibm_db.exec_immediate(db_conn, completion_query)
        completion_stmt2 = ibm_db.exec_immediate(db_conn, completion_query2)
        
        if not ibm_db.fetch_assoc(completion_stmt) or ibm_db.fetch_assoc(completion_stmt2): 
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
    lecture_query = f"SELECT STARTTIME, ENDTIME, WEEKDAY, STARTDATE, ENDDATE, ROOMID FROM STUCENTR.Lecture WHERE COURSEID = '{course_id}'"
    lecture_stmt = ibm_db.exec_immediate(db_conn, lecture_query)
    
    lecture_row = ibm_db.fetch_assoc(lecture_stmt)
    while True:
        lecture_row = ibm_db.fetch_assoc(lecture_stmt)
        if not lecture_row:  # If fetch_assoc returns False, break out of the loop
            break
        lecture_times.append({
            'STARTTIME': lecture_row['STARTTIME'],
            'ENDTIME': lecture_row['ENDTIME'],
            'WEEKDAY': lecture_row['WEEKDAY'],
            'STARTDATE': lecture_row['STARTDATE'],
            'ENDDATE': lecture_row['ENDDATE'],
            'ROOMID': lecture_row['ROOMID']
        })

    # SQL query to find lab times for the course
    lab_query = f"SELECT STARTTIME, ENDTIME, WEEKDAY, STARTDATE, ENDDATE, ROOMID FROM STUCENTR.Lab WHERE COURSEID = '{course_id}'"
    lab_stmt = ibm_db.exec_immediate(db_conn, lab_query)
    
    while True:
        lab_row = ibm_db.fetch_assoc(lab_stmt)
        if not lab_row:  # If fetch_assoc returns False, break out of the loop
            break
        lab_times.append({
            'STARTTIME': lab_row['STARTTIME'],
            'ENDTIME': lab_row['ENDTIME'],
            'WEEKDAY': lab_row['WEEKDAY'],
            'STARTDATE': lab_row['STARTDATE'], 
            'ENDDATE': lab_row['ENDDATE'],
            'ROOMID': lab_row['ROOMID']
        })

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
    curr_enrollment_query = f"SELECT * FROM STUCENTR.Enrollment WHERE StudentID = '{student_id}' AND COURSEID = '{course_id}'"
    stmt = ibm_db.exec_immediate(db_conn, prev_enrollment_query)
    stmt2 = ibm_db.exec_immediate(db_conn, curr_enrollment_query)
    
    if bool(ibm_db.fetch_assoc(stmt)) or bool(ibm_db.fetch_assoc(stmt2)):
        return True
    else:
        return False

    
def add_course_to_schedule(course, schedule):
    # Check for conflicts with lecture time
    lecture_conflict = check_time_conflicts(course['LectureTime'], schedule)
    if lecture_conflict:
        return False  # Indicates the course was not added due to conflict

    # Check for conflicts with lab time
    lab_conflict = check_time_conflicts(course['LabTime'], schedule)
    if lab_conflict:
        return False  # Indicates the course was not added due to conflict

    # If no conflicts, add lecture and lab to schedule
    schedule.append({'CourseID': course['COURSEID'], 'CourseName': course['COURSENAME'], 'Location': course['ROOMID'], 'Type': 'Lecture', **course['LectureTime']})
    schedule.append({'CourseID': course['COURSEID'], 'CourseName': course['COURSENAME'], 'Location': course['ROOMID'], 'Type': 'Lab', **course['LabTime']})

    return True  # Indicates the course was successfully added

def schedule_remaining_courses(db_conn, student_id, scheduled_courses, catA, catB, catC, catEssay):
    # Assume scheduled_courses is updated with program requirements
    num_program_courses = len(scheduled_courses)
    slots_left = 5 - num_program_courses  # Assuming a total of 5 courses needed

    essay_courses, breadth_courses = fetch_requirement_courses(db_conn, student_id, scheduled_courses, catA, catB, catC, catEssay)

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


def generate_schedule(student_id, catA, catB, catC, catEssay, progAmt):
    db_conn = connect_to_db(dsn)
    if not db_conn:
        return

    program_id = get_program_id_for_student(student_id, db_conn)
    if not program_id:
        return

    required_courses = fetch_program_requirements(program_id, db_conn)
    
    
    potential_courses = []
    
    scheduled_courses = []  # To store scheduled course details
    scheduled_times = []  # To store only the times for conflict checking
    num_courses_scheduled = 0  # Track the number of scheduled courses

    # Schedule required program courses
    for course_id in required_courses:
        if num_courses_scheduled >= progAmt:
            # If 4 courses have already been scheduled, break out of the loop
            break

        if has_taken_course(student_id, course_id, db_conn):
            continue

        if not check_prerequisites(course_id, student_id, db_conn):
            continue
        
        

        lecture_times, lab_times = find_course_times(course_id, db_conn)
        
        for lecture_time, lab_time in zip(lecture_times, lab_times):
            if not check_time_conflicts(lecture_time, potential_courses) and not check_time_conflicts(lab_time, potential_courses):
                potential_courses.append({'COURSEID': course_id, 'Type': 'Lecture', **lecture_time})
                potential_courses.append({'COURSEID': course_id, 'Type': 'Lab', **lab_time})

    courseids_selected = []
    scheduled_courses = []
    
    counter = 0
    while len(scheduled_courses) < progAmt*2 and potential_courses:
        # Select a course
        chosen_course = random.choice([course for course in potential_courses if course['Type'] == 'Lecture' and course['COURSEID'] not in courseids_selected])

        # Schedule the chosen lecture
        scheduled_courses.append(chosen_course)
        courseids_selected.append(chosen_course['COURSEID'])

        # Find and schedule the corresponding lab, if it exists
        corresponding_lab = next((lab for lab in potential_courses if lab['COURSEID'] == chosen_course['COURSEID'] and lab['Type'] == 'Lab'), None)
        if corresponding_lab:
            scheduled_courses.append(corresponding_lab)
            num_courses_scheduled += 1

        # Remove the chosen lecture and lab from potential courses
        potential_courses = [course for course in potential_courses if course['COURSEID'] != chosen_course['COURSEID']]
      
        counter += 1 
        
    if num_courses_scheduled < 5:
        essay_courses, breadth_courses = fetch_requirement_courses(db_conn, student_id, scheduled_courses, catA, catB, catC, catEssay)
        
        # Combine essay and breadth courses into a single list for random selection
        combined_courses = essay_courses + [course for sublist in breadth_courses.values() for course in sublist]
        
        # Shuffle the combined list to ensure random selection
        random.shuffle(combined_courses)
        
        while num_courses_scheduled < 5 and combined_courses:
            
            # Select a course from the combined list
            chosen_course = combined_courses.pop()
            if has_taken_course(student_id, chosen_course['COURSEID'], db_conn):
                continue
            # Check for time conflicts with already scheduled courses
            if not check_time_conflicts(chosen_course, scheduled_courses):
                # Add the chosen course to the schedule
                scheduled_courses.append(chosen_course)
                # Add the time of the chosen course to scheduled_times for future conflict checks
                scheduled_times.append({
                    'STARTTIME': chosen_course['STARTTIME'], 
                    'ENDTIME': chosen_course['ENDTIME'], 
                    'WEEKDAY': chosen_course['WEEKDAY'], 
                    })
                num_courses_scheduled += 1
                

    all_courses_data = []

    for course in scheduled_courses:
        # Prepare the course data dictionary
        course_data = {
            "COURSEID": course['COURSEID'],
            "TYPE": course.get('Type', 'Lecture'),  # Use .get() to handle missing 'Type' key gracefully
            "STARTTIME": course['STARTTIME'].strftime('%H:%M:%S') if hasattr(course['STARTTIME'], 'strftime') else course['STARTTIME'],
            "ENDTIME": course['ENDTIME'].strftime('%H:%M:%S') if hasattr(course['ENDTIME'], 'strftime') else course['ENDTIME'],
            "WEEKDAY": course['WEEKDAY'],
            "STARTDATE": course['STARTDATE'].isoformat() if hasattr(course['STARTDATE'], 'isoformat') else course['STARTDATE'],
            "ENDDATE": course['ENDDATE'].isoformat() if hasattr(course['ENDDATE'], 'isoformat') else course['ENDDATE'],
            "LOCATION": course['ROOMID']
        }
        
        all_courses_data.append(course_data)

    # Convert the list of all course data dictionaries to a JSON string
    final_json_output = json.dumps(all_courses_data, indent=4)
    
    print(final_json_output)
    
    ibm_db.close(db_conn)
        
def main(studentID, catA, catB, catC, catEssay, progAmt):
    generate_schedule(studentID, catA, catB, catC, catEssay, progAmt)


#generate_schedule('823321975', False, False, False, True, 4)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        studentID = sys.argv[1]
        if(sys.argv[2] == 'true'):
            catA = True
        else:
            catA = False
        if(sys.argv[3] == 'true'):
            catB = True
        else:
            catB = False
        if(sys.argv[4] == 'true'):
            catC = True
        else:
            catC = False
        if(sys.argv[5] == 'true'):
            catEssay = True
        else:
            catEssay = False
        3
        progAmt = int(sys.argv[6])
        main(studentID, catA, catB, catC, catEssay, progAmt)
    else:
        sys.exit(1)

