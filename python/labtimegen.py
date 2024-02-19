import ibm_db
import random
from datetime import time, timedelta, datetime

# Establish a connection to the DB2 database
conn_str = (
    "DATABASE=WCS2024;"
    "HOSTNAME=148.100.78.14;"
    "PORT=50000;"
    "PROTOCOL=TCPIP;"
    "UID=db2inst1;"
    "PWD=Zmframewcs_54379@;"
)

conn = ibm_db.connect(conn_str, '', '')

# Function to generate random lab times
def generate_lab_times(start_date, end_date):
    lecture_durations = [1, 2]  # durations in hours
    weekdays = range(1, 6)  # Monday to Friday
    lab_times = []
    
    earliest_start_time = time(9, 30)
    latest_start_time = time(17, 0)
    end_time_limit = time(20, 0)
    
    for weekday in weekdays:
        # Generate a random start time between 9:30 AM and 5:00 PM
        start_hour = random.randint(earliest_start_time.hour, latest_start_time.hour)
        start_minute = random.choice([0, 30]) if start_hour < latest_start_time.hour else 0
        current_start_time = time(start_hour, start_minute)
        
        duration = random.choice(lecture_durations)
        end_lab_time = (datetime.combine(datetime.today(), current_start_time) + timedelta(hours=duration)).time()
        
        if end_lab_time <= end_time_limit:
            lab_times.append((weekday, current_start_time, end_lab_time))

    return lab_times

# Get all CourseIDs and ProfessorIDs
sql_courses = "SELECT CourseID, ProfessorID FROM STUCENTR.Course"
stmt_courses = ibm_db.exec_immediate(conn, sql_courses)
courses = []
result_course = ibm_db.fetch_assoc(stmt_courses)

while result_course:
    courses.append((result_course['COURSEID'], result_course['PROFESSORID']))
    result_course = ibm_db.fetch_assoc(stmt_courses)

# Get all RoomIDs
sql_rooms = "SELECT RoomID FROM STUCENTR.Room"
stmt_rooms = ibm_db.exec_immediate(conn, sql_rooms)
room_ids = []
result_room = ibm_db.fetch_assoc(stmt_rooms)

while result_room:
    room_ids.append(result_room['ROOMID'])
    result_room = ibm_db.fetch_assoc(stmt_rooms)

# Generate lectures for each Course
start_date = '2024-01-08'
end_date = '2024-04-20'


for course_id, professor_id in courses:
    lab_times = generate_lab_times(start_date, end_date)
    
    lecture_id = random.randint(1000000, 9999999)
    
    for lab_time in lab_times:
        weekday, start, end = lab_time
        weekday = random.randint(1, 5)
        random_room_id = random.choice(room_ids)  # Select a random RoomID
        insert_sql = f"""
        INSERT INTO STUCENTR.Lab (LABID, COURSEID, PROFESSORID, ROOMID, WEEKDAY, STARTTIME, ENDTIME, STARTDATE, ENDDATE)
        VALUES ('{lecture_id}','{course_id}', '{professor_id}', '{random_room_id}', {weekday}, '{start.strftime('%H:%M:%S')}', '{end.strftime('%H:%M:%S')}', '{start_date}', '{end_date}')
        """
        try:
            insert_stmt = ibm_db.exec_immediate(conn, insert_sql)
        except Exception as e:
            print(f"An error occurred: {e}")

# Close the connection
ibm_db.close(conn)
