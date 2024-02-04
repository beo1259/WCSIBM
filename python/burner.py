import ibm_db
import random

dsn = (
    "DATABASE=WCS2024;"
    "HOSTNAME=148.100.78.14;"
    "PORT=50000;"
    "PROTOCOL=TCPIP;"
    "UID=db2inst1;"
    "PWD=Zmframewcs_54379@;"
)

try:
    # Create database connection
    db_connection = ibm_db.connect(dsn, "", "")
    
    # Add the 'Year' column to the table
    alter_table_sql = "ALTER TABLE STUCENTR.Student ADD COLUMN Year INT"
    ibm_db.exec_immediate(db_connection, alter_table_sql)
    
    # Generate and execute the update statement for each row
    update_sql = "UPDATE STUCENTR.Student SET Year = ? WHERE STUDENTID = ?"
    stmt_update = ibm_db.prepare(db_connection, update_sql)
    
    # Fetch the student ids to update
    select_sql = "SELECT STUDENTID FROM STUCENTR.Student"
    stmt_select = ibm_db.exec_immediate(db_connection, select_sql)
    
    # Update rows with random year
    row = ibm_db.fetch_assoc(stmt_select)
    while row:
        year = random.randint(1, 4)  # Generate a random year
        ibm_db.bind_param(stmt_update, 1, year)
        ibm_db.bind_param(stmt_update, 2, row['STUDENTID'])
        ibm_db.execute(stmt_update)
        
        row = ibm_db.fetch_assoc(stmt_select)

    print("All rows have been updated with a random Year value.")
    
except Exception as e:
    print("An error occurred: ", e)
finally:
    if db_connection:
        ibm_db.close(db_connection)
