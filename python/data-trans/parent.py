#!/usr/bin/env python3

import time
import subprocess

while True:
    subprocess.call(["/home/linux1/WCSIBM/python/data-trans/student-trans.py"])
    subprocess.call(["/home/linux1/WCSIBM/python/data-trans/proffesor-trans.py"])
    time.sleep(172800)
