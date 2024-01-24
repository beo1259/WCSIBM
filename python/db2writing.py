import ibm_db

conn_string = (
    "DATABASE=TESTING;"
    "HOSTNAME=148.100.78.14;"
    "PORT=50000;"
    "PROTOCOL=TCPIP;"
    "UID=db2inst1;"
    "PWD=Zmframewcs_54379@;"
)

# Establish the connection
connection = ibm_db.connect(conn_string, '', '')

# Function to execute SQL queries
def execute_sql(connection, sql):
    try:
        ibm_db.exec_immediate(connection, sql)
    except Exception as e:
        print(f"An error occurred: {e}")
        ibm_db.rollback(connection)  # Rolling back in case of error
        return False
    return True

# Check if the connection is successful
if connection:
    try:
        # Create the 'Faculty' table
        sql_faculty = """
        CREATE TABLE STUSCHEMA.Faculty (
            FacultyID INT PRIMARY KEY NOT NULL,
            Name VARCHAR(255) NOT NULL
        )
        """
        execute_sql(connection, sql_faculty)

        # Create the 'Course' table
        sql_course = """
        CREATE TABLE STUSCHEMA.Course (
            CourseID INT PRIMARY KEY NOT NULL,
            Name VARCHAR(255) NOT NULL,
            Credits INT NOT NULL,
            Location VARCHAR(255),
            FacultyID INT,
            FOREIGN KEY (FacultyID) REFERENCES Faculty(FacultyID)
        )
        """
        execute_sql(connection, sql_course)

        # Create the 'Professor' table
        sql_professor = """
        CREATE TABLE STUSCHEMA.Professor (
            ProfessorID INT PRIMARY KEY NOT NULL,
            Name VARCHAR(255) NOT NULL,
            Location VARCHAR(255),
            FacultyID INT,
            FOREIGN KEY (FacultyID) REFERENCES Faculty(FacultyID)
        )
        """
        execute_sql(connection, sql_professor)

        # Create the 'Student' table
        sql_student = """
        CREATE TABLE STUSCHEMA.Student (
            StudentID INT PRIMARY KEY NOT NULL,
            Name VARCHAR(255) NOT NULL,
            Degree VARCHAR(255),
            CreditsEarned INT,
            CreditsLeft INT,
            Transcript CLOB,
            ScholarshipDetails CLOB,
            CurrentAcademicCalendar CLOB,
            GeneratedSchedule CLOB,
            EMAIL VARCHAR(255),
            PASSWORD VARCHAR(255)
        )
        """
        execute_sql(connection, sql_student)

        # Create the 'StudentGrades' table
        sql_grades = """
        CREATE TABLE STUSCHEMA.StudentGrades (
            StudentID INT NOT NULL,
            CourseID INT NOT NULL,
            Grade CHAR(2),
            PRIMARY KEY (StudentID, CourseID),
            FOREIGN KEY (StudentID) REFERENCES Student(StudentID),
            FOREIGN KEY (CourseID) REFERENCES Course(CourseID)
        )
        """
        execute_sql(connection, sql_grades)

        # Create the 'Scholarships' table
        sql_scholarships = """
        CREATE TABLE STUSCHEMA.Scholarships (
            ScholarshipID INT PRIMARY KEY NOT NULL,
            Amount DECIMAL(10, 2) NOT NULL,
            Type VARCHAR(100),
            StudentID INT,
            FOREIGN KEY (StudentID) REFERENCES Student(StudentID)
        )
        """
        execute_sql(connection, sql_scholarships)

        # Create the 'HonorsAwards' table
        sql_honors_awards = """
        CREATE TABLE STUSCHEMA.HonorsAwards (
            AwardID INT PRIMARY KEY NOT NULL,
            Title VARCHAR(255) NOT NULL,
            Description CLOB,
            StudentID INT,
            FOREIGN KEY (StudentID) REFERENCES Student(StudentID)
        )
        """
        execute_sql(connection, sql_honors_awards)

        # Create the 'Transcript' table
        sql_transcript = """
        CREATE TABLE STUSCHEMA.Transcript (
            TranscriptID INT PRIMARY KEY NOT NULL,
            StudentID INT NOT NULL,
            Details CLOB,
            FOREIGN KEY (StudentID) REFERENCES Student(StudentID)
        )
        """
        execute_sql(connection, sql_transcript)

        # Commit the transaction if everything is fine
        ibm_db.commit(connection)
        print("All tables created successfully.")
    except Exception as e:
        print("An error occurred during table creation: ", e)
        # If an error occurs, rollback the transaction
        ibm_db.rollback(connection)
    finally:
        # Close the connection
        ibm_db.close(connection)
else:
    print("Unable to connect to the database")
