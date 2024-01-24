import ibm_db
import json

conn_string = (
    "DATABASE=TESTING;"
    "HOSTNAME=148.100.78.14;"
    "PORT=50000;"
    "PROTOCOL=TCPIP;"
    "UID=db2inst1;"
    "PWD=Zmframewcs_54379@;"
)

conn = ibm_db.connect(conn_string, '', '')

select = "SELECT * FROM testschema.student WHERE studentid = 251226514"

# executing the query
stmt = ibm_db.exec_immediate(conn, select)

# Fetching and displaying the results
row = ibm_db.fetch_assoc(stmt)
while row:
    print(json.dumps(row, indent=4))  # Convert the row to a JSON string for pretty printing
    row = ibm_db.fetch_assoc(stmt)
    
ibm_db.close(conn)
