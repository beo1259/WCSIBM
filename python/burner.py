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
    
    # Add the 'ESSAYCREDIT' column to the table
    alter_table_sql = "ALTER TABLE STUCENTR.Course ADD COLUMN ESSAYCREDIT CHAR(1)"
    ibm_db.exec_immediate(db_connection, alter_table_sql)
    
    # Update the first 20 rows with 'N' for the 'ESSAYCREDIT' column
    update_sql_N = "UPDATE STUCENTR.Course SET ESSAYCREDIT = 'N' WHERE CourseID IN (SELECT CourseID FROM STUCENTR.Course ORDER BY CourseID FETCH FIRST 20 ROWS ONLY)"
    ibm_db.exec_immediate(db_connection, update_sql_N)
    
    # Update the last 7 rows with 'Y' for the 'ESSAYCREDIT' column
    update_sql_Y = "UPDATE STUCENTR.Course SET ESSAYCREDIT = 'Y' WHERE CourseID IN (SELECT CourseID FROM STUCENTR.Course ORDER BY CourseID DESC FETCH FIRST 7 ROWS ONLY)"
    ibm_db.exec_immediate(db_connection, update_sql_Y)

    print("Rows have been updated with 'ESSAYCREDIT' values.")
    
except Exception as e:
    print("An error occurred: ", e)
finally:
    if db_connection:
        ibm_db.close(db_connection)