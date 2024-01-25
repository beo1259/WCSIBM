import ibm_db
import json

# Connection string
conn_string = (
    "DATABASE=TESTING;"
    "HOSTNAME=148.100.78.14;"
    "PORT=50000;"
    "PROTOCOL=TCPIP;"
    "UID=db2isnt1;"
    "PWD=Zmframewcs_54379@;"
)

conn = ibm_db.connect(conn_string, '', '')

json_data = """    {
      "COURSE": [
        {"NAME": "Introduction to Psychology", "CREDITS": 3, "LOCATION": "Bldg 5 Room 203"},
        {"NAME": "Advanced Calculus", "CREDITS": 4, "LOCATION": "Bldg 2 Room 310"},
        {"NAME": "Organic Chemistry", "CREDITS": 3, "LOCATION": "Bldg 8 Room 112"},
        {"NAME": "World History", "CREDITS": 3, "LOCATION": "Bldg 1 Room 103"},
        {"NAME": "Software Development Practices", "CREDITS": 3, "LOCATION": "Bldg 9 Room 208"},
        {"NAME": "Microeconomics", "CREDITS": 3, "LOCATION": "Bldg 3 Room 105"},
        {"NAME": "Molecular Biology", "CREDITS": 4, "LOCATION": "Bldg 7 Room 201"},
        {"NAME": "Classical Mechanics", "CREDITS": 4, "LOCATION": "Bldg 6 Room 307"},
        {"NAME": "Spanish Literature", "CREDITS": 3, "LOCATION": "Bldg 4 Room 104"},
        {"NAME": "Philosophy of Science", "CREDITS": 3, "LOCATION": "Bldg 5 Room 205"}
      ],
      "FACULTY": [
        {"NAME": "College of Arts and Sciences"},
        {"NAME": "College of Engineering"},
        {"NAME": "School of Business"},
        {"NAME": "College of Education"},
        {"NAME": "School of Law"},
        {"NAME": "College of Medicine"},
        {"NAME": "School of Architecture and Planning"},
        {"NAME": "School of Social Work"},
        {"NAME": "School of Music"},
        {"NAME": "College of Pharmacy"}
      ],
      "HONORSAWARDS": [
        {"TITLE": "Academic Excellence Award", "DESCRIPTION": "Awarded for achieving a 4.0 GPA in the academic year"},
        {"TITLE": "Dean's List", "DESCRIPTION": "Awarded to students who ranked top 10% in their college"},
        {"TITLE": "Research Achievement Award", "DESCRIPTION": "Given to students with outstanding undergraduate research contributions"},
        {"TITLE": "Leadership Distinction Award", "DESCRIPTION": "For students who have shown exceptional leadership abilities"},
        {"TITLE": "Community Service Award", "DESCRIPTION": "Granted to those with significant contributions to community service"},
        {"TITLE": "Athletic Scholarship", "DESCRIPTION": "For students exhibiting skill and sportsmanship in university athletics"},
        {"TITLE": "Artistic Merit Award", "DESCRIPTION": "For students displaying excellent skills and originality in the arts"},
        {"TITLE": "Innovation in Technology Award", "DESCRIPTION": "For students who show promise in technology and innovation"},
        {"TITLE": "Environmental Stewardship Award", "DESCRIPTION": "For contributions towards sustainability and environmental preservation"},
        {"TITLE": "Best Thesis Award", "DESCRIPTION": "Accorded to the student with the most compelling thesis project"}
      ],
      "PROFESSOR": [
        {"NAME": "Dr. Josephine Reid"},
        {"NAME": "Dr. Harold Freeman"},
        {"NAME": "Dr. Alice Murray"},
        {"NAME": "Dr. Raymond Holt"},
        {"NAME": "Dr. Gregory House"},
        {"NAME": "Dr. Janet Rhodes"},
        {"NAME": "Dr. Arnold Weber"},
        {"NAME": "Dr. Susan Calvin"},
        {"NAME": "Dr. Samuel Oak"},
        {"NAME": "Dr. Lisa Cuddy"}
      ],
      "SCHOLARSHIPS": [
        {"AMOUNT": 1000, "TYPE": "Merit-based"},
        {"AMOUNT": 1500, "TYPE": "Need-based"},
        {"AMOUNT": 2000, "TYPE": "Athletic"},
        {"AMOUNT": 500, "TYPE": "Community Service"},
        {"AMOUNT": 2500, "TYPE": "Academic Excellence"},
        {"AMOUNT": 3000, "TYPE": "Leadership"},
        {"AMOUNT": 1200, "TYPE": "Minority Scholarship"},
        {"AMOUNT": 1800, "TYPE": "Women in STEM"},
        {"AMOUNT": 2200, "TYPE": "Veteran Scholarship"},
        {"AMOUNT": 2000, "TYPE": "Art Scholarship"}
      ],
      "STUDENT": [
        {"NAME": "Emily Thompson", "DEGREE": "B.Sc. Computer Science", "CREDITSEARNED": 45, "CREDITSLEFT": 75, "EMAIL": "emily.thompson@email.com", "PASSWORD": "Secure*1234", "GPA": "87%"},
        {"NAME": "John Smith", "DEGREE": "B.A. English", "CREDITSEARNED": 30, "CREDITSLEFT": 90, "EMAIL": "john.smith@email.com", "PASSWORD": "Pass9876", "GPA": "76%"},      
        {"NAME": "Alberto Gomez", "DEGREE": "B.Sc. Civil Engineering", "CREDITSEARNED": 60, "CREDITSLEFT": 60, "EMAIL": "alberto.gomez@email.com", "PASSWORD": "Gomez*231", "GPA": "82%"},
        {"NAME": "Rachel Green", "DEGREE": "B.Sc. Biology", "CREDITSEARNED": 72, "CREDITSLEFT": 48, "EMAIL": "rachel.green@email.com", "PASSWORD": "GreenRachel*1995", "GPA": "89%"},
        {"NAME": "David Brown", "DEGREE": "B.Arch. Architecture", "CREDITSEARNED": 90, "CREDITSLEFT": 30, "EMAIL": "david.brown@email.com", "PASSWORD": "Brownie2023", "GPA": "92%"},
        {"NAME": "Oliver Martinez", "DEGREE": "B.F.A. Graphic Design", "CREDITSEARNED": 15, "CREDITSLEFT": 105, "EMAIL": "oliver.martinez@email.com", "PASSWORD": "Ollie*Art", "GPA": "74%"},
        {"NAME": "Sophia Lee", "DEGREE": "B.Sc. Applied Physics", "CREDITSEARNED": 90, "CREDITSLEFT": 30, "EMAIL": "sophia.lee@email.com", "PASSWORD": "PhysicistSophia", "GPA": "95%"},
        {"NAME": "Daniel Kim", "DEGREE": "B.Sc. Electrical Engineering", "CREDITSEARNED": 55, "CREDITSLEFT": 65, "EMAIL": "daniel.kim@email.com", "PASSWORD": "DanKim*4567", "GPA": "79%"},
        {"NAME": "Lily Evans", "DEGREE": "B.A. Psychology", "CREDITSEARNED": 75, "CREDITSLEFT": 45, "EMAIL": "lily.evans@email.com", "PASSWORD": "LilysFlower", "GPA": "91%"}
      ]
    }"""

# Load data from JSON string
data = json.loads(json_data)

# Function to insert records into a table
def insert_records(table_name, records):
    for record in records:
        placeholders = ', '.join(['?' for _ in record])
        columns = ', '.join(record.keys())
        values = tuple(record.values())

        # SQL insert statement
        insert_sql = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"

        # Prepare and execute the SQL statement
        stmt = ibm_db.prepare(conn, insert_sql)
        try:
            ibm_db.execute(stmt, values)
        except Exception as e:
            print(f"Error inserting into {table_name}: ", e)

# Insert data into each table
insert_records("STUSCHEMA.COURSE", data['COURSE'])
insert_records("STUSCHEMA.FACULTY", data['FACULTY'])
insert_records("STUSCHEMA.HONORSAWARDS", data['HONORSAWARDS'])
insert_records("STUSCHEMA.PROFESSOR", data['PROFESSOR'])
insert_records("STUSCHEMA.SCHOLARSHIPS", data['SCHOLARSHIPS'])
insert_records("STUSCHEMA.STUDENT", data['STUDENT'])

# Close the database connection
ibm_db.close(conn)