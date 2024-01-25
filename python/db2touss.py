import ibm_db
import ftplib

# Function to convert a record to a fixed-width format
def format_fixed_width(record):
    formatted_record = ''
    formatted_record += str(record['STUDENTID']).ljust(10)  # Student ID, left-justified, 10 characters
    formatted_record += record['NAME'].ljust(20)            # Name, 20 characters
    formatted_record += record['DEGREE'].ljust(30)          # Degree, 30 characters
    formatted_record += str(record['CREDITSEARNED']).rjust(5)  # Credits Earned, right-justified, 5 characters
    formatted_record += str(record['CREDITSLEFT']).rjust(5)    # Credits Left, 5 characters
    formatted_record += record['TRANSCRIPT'].ljust(40)      # Transcript, 40 characters
    formatted_record += record['SCHOLARSHIPDETAILS'].ljust(30) # Scholarship Details, 30 characters
    formatted_record += record['CURRENTACADEMICCALENDAR'].ljust(15) # Academic Calendar, 15 characters
    formatted_record += record['GENERATEDSCHEDULE'].ljust(40) # Generated Schedule, 40 characters
    formatted_record += record['EMAIL'].ljust(30)           # Email, 30 characters
    formatted_record += record['PASSWORD'].ljust(30)        # Password, 30 characters
    return formatted_record + '\n'  # Add a newline at the end of each record

# Connection string for Db2
conn_string = (
    "DATABASE=TESTING;"
    "HOSTNAME=148.100.78.14;"
    "PORT=50000;"
    "PROTOCOL=TCPIP;"
    "UID=db2inst1;"
    "PWD=Zmframewcs_54379@;"
)

# Connect to the database
conn = ibm_db.connect(conn_string, '', '')

# SQL Query
select = "SELECT * FROM stuschema.student"

# Execute the query
stmt = ibm_db.exec_immediate(conn, select)

# Local file for saving query results
local_file = 'query_results.txt'

# Open the file for writing
with open(local_file, 'w') as file:
    row = ibm_db.fetch_assoc(stmt)
    while row:
        # Convert each row to fixed-width format and write to the file
        file.write(format_fixed_width(row))
        row = ibm_db.fetch_assoc(stmt)

# Close the Db2 connection
ibm_db.close(conn)

# FTP details
ftp_hostname = '204.90.115.200'
ftp_username = 'z41780'
ftp_password = 'GEM31DUN'
remote_file_path = '/z/z41780/WCS-IBM/data/query_result.txt'

# FTP transfer
with ftplib.FTP(ftp_hostname) as ftp:
    ftp.login(ftp_username, ftp_password)
    with open(local_file, 'rb') as file:
        ftp.storbinary(f'STOR {remote_file_path}', file)

print(file)

print("File transferred successfully.")


