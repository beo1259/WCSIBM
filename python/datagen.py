import ibm_db
import random
from datetime import datetime, timedelta
from faker import Faker

# Initialize Faker
fake = Faker()

conn_string = (
    "DATABASE=WCS2024;"
    "HOSTNAME=148.100.78.14;"
    "PORT=50000;"
    "PROTOCOL=TCPIP;"
    "UID=db2inst1;"
    "PWD=Zmframewcs_54379@;"
)


# Create database connection
try:
    conn = ibm_db.connect(conn_string, "", "")
    print("Connected to database")
except Exception as e:
    print("Unable to connect to database", e)
    
max_lengths = {
    'Email': 255,
    'Pass': 255,
    'Phone': 20,
    'FirstName': 100,
    'LastName': 100
}


def check_length(field_name, data):
    if len(data) > max_lengths[field_name]:
        print(f"Data too long for field {field_name}: {data}")

# **********************STUDENTS**************************

# Generate and insert data
# for _ in range(100):  # Number of records to create
#     student_id = fake.random_number(digits=9, fix_len=True)
#     first_name = fake.first_name()
#     last_name = fake.last_name()
#     random_number = random.randint(10, 99)  # Random two-digit number
#     email = f"{first_name[0].lower()}{last_name.lower()}{random_number}@uwo.ca"
    
#     password = fake.password()
#     phone = fake.phone_number()

#      # Check each field
#     check_length('Email', email)
#     check_length('Pass', password)
#     phone = fake.numerify(text="###-###-####")
#     check_length('FirstName', first_name)
#     check_length('LastName', last_name)

#     insert_query = """
#     INSERT INTO STUCENTR.Student (StudentID, Email, Pass, Phone, FirstName, LastName) 
#     VALUES (?, ?, ?, ?, ?, ?)
#     """
#     prep_stmt = ibm_db.prepare(conn, insert_query)
#     ibm_db.execute(prep_stmt, (student_id, email, password, phone, first_name, last_name))


# **********************PROFESSORS**************************

# for _ in range(20):  # Number of records to create
#     # professor_id = fake.random_number(digits=9, fix_len=True)
#     # first_name = fake.first_name()
#     # last_name = fake.last_name()
    

#     # check_length('FirstName', first_name)
#     # check_length('LastName', last_name)

#     # insert_query = """
#     # INSERT INTO STUCENTR.Professor (ProfessorID, FirstName, LastName) 
#     # VALUES (?, ?, ?)
#     # """
#     # prep_stmt = ibm_db.prepare(conn, insert_query)
#     # ibm_db.execute(prep_stmt, (professor_id, first_name, last_name))
    
#     fetch_ids_query = "SELECT ProfessorID FROM STUCENTR.Professor"

# # Query to fetch all Professor IDs
# fetch_ids_query = "SELECT ProfessorID FROM STUCENTR.Professor"

# # Prepare and execute the query
# try:
#     stmt = ibm_db.exec_immediate(conn, fetch_ids_query)
#     existing_professor_ids = []
#     result = ibm_db.fetch_tuple(stmt)
#     while result:
#         # Assuming ProfessorID is the first column in the SELECT statement
#         existing_professor_ids.append(result[0])
#         result = ibm_db.fetch_tuple(stmt)
# except Exception as e:
#     print(f"Error fetching Professor IDs: {e}")
#     existing_professor_ids = []

# # Check if we got any IDs
# if not existing_professor_ids:
#     print("No Professor IDs found.")
# else:
#     arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
#     update_query = """
#     UPDATE STUCENTR.Professor SET ProgramID = ? WHERE ProfessorID = ?
#     """

#     for professor_id in existing_professor_ids:
#         progid = random.choice(arr)  # Randomly select a ProgramID from the list
#         prep_stmt = ibm_db.prepare(conn, update_query)
#         try:
#             ibm_db.execute(prep_stmt, (progid, professor_id))
#             print(f"Updated Professor ID: {professor_id} with ProgramID: {progid}")
#         except Exception as e:
#             print(f"Error updating Professor ID {professor_id} with ProgramID {progid}: {e}")

# **********************COURSES**************************


courses = {
    "CS1026": "Computer Science Fundamentals I",
    "CS1027": "Computer Science Fundamentals II",
    "CS2208": "Introduction to Computer Organization and Architecture",
    "CS2209": "Applied Logic for Computer Science",
    "CS2210": "Data Structures and Algorithms",
    "CS2211": "Software Tools and Systems Programming",
    "CS2212": "Introduction to Software Engineering",
    "CS2214": "Discrete Structures for Computing",
    "CS3305": "Operating Systems",
    "CS3307": "Object-Oriented Design and Analysis",
    "CS3319": "Databases I",
    "CS3331": "Foundations of Computer Science I",
    "CS3340": "Analysis of Algorithms I",
    "CS3342": "Organization of Programming Languages",
    "CS3346": "Artificial Intelligence I",
    "CS3350": "Computer Architecture",
    "CS3357": "Computer Networks I",
    "CS3377": "Software Project Management"
}

program_id = 1 
professor_ids = [128416350, 605165100, 269129914]
credit = 1  # Assuming credit for all courses is 1

for course_id, course_name in courses.items():
    professor_id = random.choice(professor_ids)
    weekday = random.randint(1, 5)
    start_hour = random.randint(9, 21)
    start_minute = 30 if random.random() < 0.5 else 0
    duration_hours = 1 if random.random() < 0.5 else 2

    start_time = datetime(2023, 1, 1, start_hour, start_minute)
    end_time = start_time + timedelta(hours=duration_hours)

    sql_command = f"""
    INSERT INTO STUCENTR.Course (CourseID, ProgramID, ProfessorID, CourseName, Credit, Weekday, StartTime, EndTime)
    VALUES ('{course_id}', {program_id}, {professor_id}, '{course_name}', {credit});
    """
    
    try:
        ibm_db.exec_immediate(conn, sql_command)
    except Exception as exec_err:
        print(f"An error occurred while executing the SQL command: {exec_err}")

# Close the connection
ibm_db.close(conn)

