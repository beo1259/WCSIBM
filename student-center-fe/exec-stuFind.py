import paramiko
import sys
import json

hostname = '204.90.115.200'
port = 22
username = 'z41780'
password = 'TEA03POX'
java_class_directory = '/z/z41780/WCS-IBM/java'
java_class_name = 'studentFind' 

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

def main(courseId, studentId):
    try:
        client.connect(hostname, port=port, username=username, password=password)

        stdin, stdout, stderr = client.exec_command(f'cd {java_class_directory} && /usr/lpp/java/J8.0_64/bin/java -cp . {java_class_name} {courseId} {studentId}')
        
        print(stdout.read().decode())

        sys.stdout.flush()
            
    finally:
        client.close()
        
if __name__ == "__main__":
    #823321975
    main('CS2211', "251314385")
else: 
    sys.exit(1)