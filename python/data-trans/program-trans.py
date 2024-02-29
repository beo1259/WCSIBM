#!/usr/bin/env python3

import ibm_db
import ftplib

# Function to convert a record to a fixed-width format
def format_fixed_width(record):
    formatted_record = ''                                  # RECTIFY CHAR COUNT IN THE COMMENTS 
    formatted_record += str(record['PROGRAMID']).ljust(4)  # LocationID, left-justified, 15 characters
    formatted_record += str(record['PROGRAMNAME']).ljust(1)            # LocationName, 19 characters

    return formatted_record + '\n'  # Add a newline at the end of each record

# Connection string for Db2
conn_string = (
    "DATABASE=WCS2024;"
    "HOSTNAME=localhost;"
    "PORT=50000;"
    "PROTOCOL=TCPIP;"
    "UID=db2inst1;"
    "PWD=Zmframewcs_54379@;"
)

# Connect to the database
conn = ibm_db.connect(conn_string, '', '')

# SQL Query
select = "SELECT * FROM STUCENTR.PROGRAM"

# Execute the query
stmt = ibm_db.exec_immediate(conn, select)

# Local file for saving query results
local_file = '/home/linux1/WCSIBM/python/data-trans/output/program_data.txt'

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
ftp_password = 'TEA03POX'
remote_file_path = '/z/z41780/WCS-IBM/data/program_data.txt'

# FTP transfer
with ftplib.FTP(ftp_hostname) as ftp:
    ftp.login(ftp_username, ftp_password)
    with open(local_file, 'rb') as file:
        ftp.storbinary(f'STOR {remote_file_path}', file)

print(file)

print("File transferred successfully.")

