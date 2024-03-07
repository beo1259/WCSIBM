const express = require('express');
const ibmdb = require('ibm_db');
const cors = require('cors');
const { spawn } = require('child_process');
const session = require('express-session');

const app = express();
const port = 3005;

app.use(cors());
app.use(express.json());

let pythonScriptOutput = {};

const sessionConfig = {
  secret: 'Zmframewcs_54379@',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 3600000,
  }
};

const connStr =
  `DATABASE=WCS2024;HOSTNAME=148.100.78.14;PORT=50000;PROTOCOL=TCPIP;UID=db2inst1;PWD=Zmframewcs_54379@;`

app.get('/course-category', (req, res) => {
  const studentID = req.query.studentID; // Accessing the studentID sent as a query string

  if (!studentID) {
    return res.status(400).send('Student ID is required');
  }

  const sqlQuery = `
        SELECT 
            s.StudentID,
            c.CourseID,
            c.CourseName,
            c.Breadth,
            c.EssayCredit
        FROM 
            STUCENTR.Student s
        JOIN 
            STUCENTR.Enrollment e ON s.StudentID = e.StudentID
        JOIN 
            STUCENTR.Course c ON e.CourseID = c.CourseID
        WHERE 
            s.StudentID = ? AND (c.Breadth IS NOT NULL OR c.EssayCredit IS NOT NULL)
        UNION
        SELECT 
            s.StudentID,
            c.CourseID,
            c.CourseName,
            c.Breadth,
            c.EssayCredit
        FROM 
            STUCENTR.Student s
        JOIN 
            STUCENTR.PrevEnrollment pe ON s.StudentID = pe.StudentID
        JOIN 
            STUCENTR.Course c ON pe.CourseID = c.CourseID
        WHERE 
            s.StudentID = ? AND (c.Breadth IS NOT NULL OR c.EssayCredit IS NOT NULL)
        ORDER BY 
            CourseID
    `;

  ibmdb.open(connStr, (err, conn) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    conn.query(sqlQuery, [studentID, studentID], (err, data) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(data);
      }
      conn.close();
    });
  });
});

app.post('/get-average', (req, res) => {
  const { studentID, year } = req.body;
  console.log(`Received studentID: ${studentID}, year: ${year}`);

  const script = spawn('python3', ['./exec-gpa.py', studentID, year]);
  let outputData = '';

  script.stdout.on('data', (data) => {
    outputData += data.toString();
  });

  script.stderr.on('data', (data) => {
    console.error(`stderr: ${data.toString()}`);
  });

  script.on('close', (code) => {
    console.log(`Child process exited with code ${code}`);
    console.log(outputData.trim())
    if (code === 0) {
      res.send(outputData.trim());
    } else {
      res.status(500).send('Error executing script');
    }
  });

  script.on('error', (error) => {
    console.error('Failed to start script:', error);
    res.status(500).send('Error starting script');
  });
});

app.post('/api/get-studentFind', (req, res) => {
  const { courseID, studentID } = req.body;

  console.log(`Received courseID: ${courseID} studentID: ${studentID} for studentFind`);

  const script = spawn('python3', ['./exec-stuFind.py', courseID, studentID]);
  let outputData = '';

  script.stdout.on('data', (data) => {
    outputData += data.toString();
  });

  script.stderr.on('data', (data) => {
    console.error(`stderr: ${data.toString()}`);
  });

  script.on('close', (code) => {
    console.log(`Child process exited with code ${code}`);
    if (code === 0) {
      try {
        // Parse the string to a JavaScript object
        const parsedOutput = JSON.parse(outputData);
        console.log(parsedOutput)
        // Send a JSON response
        res.json(parsedOutput);
      } catch (error) {
        // Handle the case where the outputData is not valid JSON
        console.error('Failed to parse outputData:', outputData);
        res.status(500).send('Server error: Invalid output format from script');
      }
    } else {
      res.status(500).send('Error executing script');
    }
  });

  script.on('error', (error) => {
    console.error('Failed to start script:', error);
    res.status(500).send('Error starting script');
  });
});

app.post('/api/get-prereqs', (req, res) => {
  const { studentID } = req.body;
  console.log(`Received studentID: ${studentID} for prereqs`);

  const script = spawn('python3', ['./exec-prereq.py', studentID]);
  let outputData = '';

  script.stdout.on('data', (data) => {
    outputData += data.toString();
  });

  script.stderr.on('data', (data) => {
    console.error(`stderr: ${data.toString()}`);
  });

  script.on('close', (code) => {
    console.log(`Child process exited with code ${code}`);
    if (code === 0) {
      try {
        // Parse the string to a JavaScript object
        const parsedOutput = JSON.parse(outputData);
        // Send a JSON response
        res.json(parsedOutput);
      } catch (error) {
        // Handle the case where the outputData is not valid JSON
        console.error('Failed to parse outputData:', outputData);
        res.status(500).send('Server error: Invalid output format from script');
      }
    } else {
      res.status(500).send('Error executing script');
    }
  });

  script.on('error', (error) => {
    console.error('Failed to start script:', error);
    res.status(500).send('Error starting script');
  });
});


app.post('/generate-schedule', (req, res) => {
  const { studentID } = req.body;
  const { catA } = req.body;
  const { catB } = req.body;
  const { catC } = req.body;
  const { catEssay } = req.body;
  const { progAmt } = req.body;

  const script = spawn('python', ['./schedule-generation-alg.py', studentID, catA, catB, catC, catEssay, progAmt]);
  let outputData = '';

  // Listen for data from the script
  script.stdout.on('data', (data) => {
    outputData += data.toString();
    
  });

  script.on('close', (code) => {
    // Send response when the script finishes
    res.status(200).json(JSON.parse(outputData));
  });

  script.on('error', (error) => {
    console.error('Error executing script:', error);
    res.status(500).json(outputData);
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  ibmdb.open(connStr, (err, conn) => {
    if (err) {
      console.error('db connection error:', err);
      return res.status(500).send('unable to connect to db');
    }

    const query = `SELECT * FROM STUCENTR.STUDENT WHERE EMAIL = ? AND PASS = ?`;

    conn.query(query, [username, password], (err, data) => {
      if (err) {
        console.error('login error:', err);
        return res.status(500).send('login error');
      }
      if (data.length > 0) {
        res.status(200).send({ message: "Login successful", user: data[0] });

      } else {
        res.status(401).send({ message: "Invalid credentials" });
      }
      conn.close();
    });
  });
});

app.get('/api/courses', (req, res) => {
  const studentID = req.query.studentID;

  ibmdb.open(connStr, (err, conn) => {
    if (err) {
      console.error('db connection error:', err);
      return res.status(500).send('Unable to connect to the database');
    }

    const query = `SELECT C.CourseID, C.CourseName 
      FROM STUCENTR.Course C
      LEFT JOIN STUCENTR.ENROLLMENT E 
          ON E.COURSEID = C.COURSEID
          AND E.STUDENTID = '${studentID}'
      WHERE E.COURSEID IS NULL`;

    conn.query(query, (err, data) => {
      if (err) {
        console.error('query error:', err);
        return res.status(500).send('Failed to retrieve courses');
      }
      res.status(200).send(data);
      conn.close();
    });
  });
});

app.get('/api/student-courses', (req, res) => {
  const studentId = req.query.studentId;

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  ibmdb.open(connStr, (err, conn) => {
    if (err) {
      console.error('Connection error:', err);
      return res.status(500).json({ error: 'Unable to connect to the database' });
    }

    const query = `SELECT CourseID FROM STUCENTR.ENROLLMENT WHERE STUDENTID = ?`;
    conn.query(query, [studentId], (err, data) => {
      if (err) {
        console.error('Query error:', err);
        conn.close();
        return res.status(500).json({ error: 'Failed to retrieve courses' });
      }
      res.json(data); // This ensures the response is JSON-formatted
      conn.close();
    });
  });
});

app.get('/api/student-lectures', (req, res) => {
  const studentId = req.query.studentId;

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  ibmdb.open(connStr, (err, conn) => {
    if (err) {
      console.error('Connection error:', err);
      return res.status(500).json({ error: 'Unable to connect to the database' });
    }

    const query = `
        SELECT L.*
        FROM STUCENTR.Lecture L
        INNER JOIN STUCENTR.LectureEnrollment LE ON L.LectureID = LE.LectureID
        WHERE LE.StudentID = ?
      `;

    conn.query(query, [studentId], (err, data) => {
      if (err) {
        console.error('Query error:', err);
        conn.close();
        return res.status(500).json({ error: 'Failed to retrieve lecture information' });
      }
      // Process the data to fit the schedule format if needed, or send as is
      res.json(data);
      conn.close();
    });
  });
});

app.get('/api/student-labs', (req, res) => {
  const studentId = req.query.studentId;

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  ibmdb.open(connStr, (err, conn) => {
    if (err) {
      console.error('Connection error:', err);
      return res.status(500).json({ error: 'Unable to connect to the database' });
    }

    // Use the provided SQL command and modify it to use the parameterized studentId
    const query = `
        SELECT L.*
        FROM STUCENTR.Lab L
        INNER JOIN STUCENTR.LabEnrollment LE ON L.LabID = LE.LabID
        WHERE LE.StudentID = ?
      `;

    conn.query(query, [studentId], (err, data) => {
      if (err) {
        console.error('Query error:', err);
        conn.close();
        return res.status(500).json({ error: 'Failed to retrieve lab information' });
      }
      // Process the data to fit the schedule format if needed, or send as is
      res.json(data);
      conn.close();
    });
  });
});

//Get program information for a student
app.get('/api/student-program', (req, res) => {
  const studentId = req.query.studentId;

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  ibmdb.open(connStr, (err, conn) => {
    if (err) {
      console.error('Connection error:', err);
      return res.status(500).json({ error: 'Unable to connect to the database' });
    }

    const query = `
        SELECT S.YEAR, P.PROGRAMNAME, S.FIRSTNAME, S.LASTNAME, S.STUDENTID, S.EMAIL, S.DEGREE
        FROM STUCENTR.PROGRAM P
        INNER JOIN STUCENTR.PROGRAMENROLLMENT PE ON PE.PROGRAMID = P.PROGRAMID
        INNER JOIN STUCENTR.STUDENT S ON S.STUDENTID = PE.STUDENTID
        WHERE S.STUDENTID = '${studentId}';
      `;

    conn.query(query, [studentId], (err, data) => {
      if (err) {
        console.error('Query error:', err);
        conn.close();
        return res.status(500).json({ error: 'Failed to retrieve program information' });
      }
      res.json(data);
      conn.close();
    });
  });
});

//Gets grades for a specific student
app.get('/api/student-grades', (req, res) => {
  const studentId = req.query.studentID;
  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  ibmdb.open(connStr, (err, conn) => {
    if (err) {
      console.error('Connection error:', err);
      return res.status(500).json({ error: 'Unable to connect to the database' });
    }

    const query = `
      SELECT G.GRADE, C.COURSENAME, C.COURSEID, PE.YEAR
      FROM STUCENTR.GRADE G
      INNER JOIN STUCENTR.PREVENROLLMENT PE ON PE.PREVENROLLMENTID = G.PREVENROLLMENTID
      INNER JOIN STUCENTR.STUDENT S ON S.STUDENTID = PE.STUDENTID
      INNER JOIN STUCENTR.COURSE C ON C.COURSEID = PE.COURSEID
      WHERE S.STUDENTID = '${studentId}';
    `;

    conn.query(query, [studentId], (err, data) => {
      if (err) {
        console.error('Query error:', err);
        conn.close();
        return res.status(500).json({ error: 'Failed to retrieve program information' });
      }
      res.json(data);
      conn.close();
    });
  });
});
//Get all course lecture and lab information
app.get('/api/course-information', (req, res) => {
  let courseID = req.query.courseID;

  ibmdb.open(connStr, (err, conn) => {
    if (err) {
      console.error('Connection error:', err);
      return res.status(500).json({ error: 'Unable to connect to the database' });
    }

    const query = `SELECT * FROM STUCENTR.LECTURE WHERE COURSEID='${courseID}'`;
    const query2 = `SELECT * FROM STUCENTR.LAB WHERE COURSEID='${courseID}'`;
    //Query lecture data
    conn.query(query, (err, data) => {
      if (err) {
        console.error('Query error:', err);
        conn.close();
        return res.status(500).json({ error: 'Failed to retrieve program information' });
      }
      //Query lab data
      conn.query(query2, (err, data2) => {
        if (err) {
          console.error('Query error:', err);
          conn.close();
          return res.status(500).json({ error: 'Failed to retrieve program information' });
        }
        data = data.concat(data2);
        res.status(200).send(data);
        conn.close();
      });
    });
  });
});

//POST course to IBMDB2 database
app.post('/api/enroll', (req, res) => {
  const info = req.body;

  //Generate a random enrollment id
  let ENROLLMENTID = Math.random() * (999999 - 100000) + 100000;

  if (!info.STUDENTID) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  ibmdb.open(connStr, (err, conn) => {
    if (err) {
      console.error('Connection error:', err);
      return res.status(500).json({ error: 'Unable to connect to the database' });
    }

    // Use the provided SQL command and modify it to use the parameterized studentId
    const query = `INSERT INTO STUCENTR.LABENROLLMENT (LABID, COURSEID, STUDENTID, ATTENDANCESTATUS) VALUES
    (${info.LABID}, '${info.COURSEID}', '${info.STUDENTID}', 'NULL')`;

    const query2 = `INSERT INTO STUCENTR.LECTUREENROLLMENT (LECTUREID, COURSEID, STUDENTID) VALUES
    (${info.LECTUREID}, '${info.COURSEID}', '${info.STUDENTID}')`;

    const query3 = `INSERT INTO STUCENTR.ENROLLMENT (ENROLLMENTID, COURSEID, STUDENTID, YEAR) VALUES
    (${ENROLLMENTID}, '${info.COURSEID}', '${info.STUDENTID}', 2024)`;

    //Push to LABENROLLMENT
    conn.query(query, (err, data) => {
      if (err) {
        console.error('Query error:', err);
        conn.close();
        return res.status(500).json({ error: 'Failed to post to lab enrollment' });
      }
      //Push to LECTUREENROLLMENT
      conn.query(query2, (err, data2) => {
        if (err) {
          console.error('Query error:', err);
          conn.close();
          return res.status(500).json({ error: 'Failed to post to lecture enrollment' });
        }
        try {
          //Push to ENROLLMENT
          conn.query(query3, (err, data3) => {
            // Process the data to fit the schedule format if needed, or send as is
            res.status(200).send('Data added successfully');
            conn.close();
          });
        } catch (error) {
          //If throws an error, generate another enrollment id
          ENROLLMENTID = Math.random() * (999999 - 100000) + 100000;
          //Push to ENROLLMENT
          conn.query(query3, (err, data3) => {
            // Process the data to fit the schedule format if needed, or send as is
            res.status(200).send('Data added successfully');
            conn.close();
          });
        }
      });
    });
  });
});

//POST course to IBMDB2 database
app.delete('/api/unenroll', (req, res) => {
  const info = req.body;

  if (!info.STUDENTID) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  ibmdb.open(connStr, (err, conn) => {
    if (err) {
      console.error('Connection error:', err);
      return res.status(500).json({ error: 'Unable to connect to the database' });
    }

    // Use the provided SQL command and modify it to use the parameterized studentId
    const query = `DELETE FROM STUCENTR.LABENROLLMENT WHERE COURSEID = '${info.COURSEID}' AND STUDENTID = '${info.STUDENTID}'`;

    const query2 = `DELETE FROM STUCENTR.LECTUREENROLLMENT WHERE COURSEID = '${info.COURSEID}' AND STUDENTID = '${info.STUDENTID}'`;

    const query3 = `DELETE FROM STUCENTR.ENROLLMENT WHERE COURSEID = '${info.COURSEID}' AND STUDENTID = '${info.STUDENTID}'`;

    //Delete Fropm LABENROLLMENT
    conn.query(query, (err, data) => {
      if (err) {
        console.error('Query error:', err);
        conn.close();
        return res.status(500).json({ error: 'Failed to delete from lab enrollment' });
      }
      //Delete From LECTUREENROLLMENT
      conn.query(query2, (err, data2) => {
        if (err) {
          console.error('Query error:', err);
          conn.close();
          return res.status(500).json({ error: 'Failed to delete from lecture enrollment' });
        }
        //Delete From ENROLLMENT
        conn.query(query3, (err, data3) => {
          // Process the data to fit the schedule format if needed, or send as is
          res.status(200).send('Data deleted successfully');
          conn.close();
        });
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});