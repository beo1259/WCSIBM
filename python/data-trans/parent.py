#!/usr/bin/env python3

import time
import subprocess

while True:
    subprocess.call(["/home/linux1/WCSIBM/python/data-trans/student-trans.py"])
    subprocess.call(["/home/linux1/WCSIBM/python/data-trans/proffesor-trans.py"])
    subprocess.call(["/home/linux1/WCSIBM/python/data-trans/course-trans.py"])
    subprocess.call(["/home/linux1/WCSIBM/python/data-trans/enrollment-trans.py"])
    subprocess.call(["/home/linux1/WCSIBM/python/data-trans/grade-trans.py"])
    subprocess.call(["/home/linux1/WCSIBM/python/data-trans/lab-trans.py"])
    subprocess.call(["/home/linux1/WCSIBM/python/data-trans/labenroll-trans.py"])
    subprocess.call(["/home/linux1/WCSIBM/python/data-trans/lecenroll-trans.py"])
    subprocess.call(["/home/linux1/WCSIBM/python/data-trans/lecture-trans.py"])
    subprocess.call(["/home/linux1/WCSIBM/python/data-trans/location-trans.py"])
    subprocess.call(["/home/linux1/WCSIBM/python/data-trans/prerequisite-trans.py"])
    subprocess.call(["/home/linux1/WCSIBM/python/data-trans/prevenrollment-trans.py"])
    subprocess.call(["/home/linux1/WCSIBM/python/data-trans/progenroll-trans.py"])
    subprocess.call(["/home/linux1/WCSIBM/python/data-trans/program-trans.py"])
    subprocess.call(["/home/linux1/WCSIBM/python/data-trans/programreq-trans.py"])
    subprocess.call(["/home/linux1/WCSIBM/python/data-trans/room-trans.py"])
    time.sleep(172800)
