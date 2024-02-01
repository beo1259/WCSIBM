const express = require('express');
const ibmdb = require('ibm_db');
const cors = require('cors');
const session = require('express-session');

const app = express();
const port = 3005;

app.use(cors());
app.use(express.json());

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
    ibmdb.open(connStr, (err, conn) => {
        if (err) {
            console.error('db connection error:', err);
            return res.status(500).send('Unable to connect to the database');
        }

        const query = `SELECT CourseID, CourseName FROM STUCENTR.Course`;

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
  
      // Use the provided SQL command and modify it to use the parameterized studentId
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
  


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});