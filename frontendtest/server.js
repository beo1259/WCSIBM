const express = require('express');
const ibmdb = require('ibm_db');
const cors = require('cors');

const app = express();
const port = 3002;

app.use(cors());

// DB2 connection string
const connStr = `DATABASE=STUCENTR;HOSTNAME=localhost;PORT=25000;PROTOCOL=TCPIP;UID=db2admin;PWD=Zmframewcs_54379@;`

// get request for student info
app.get('/api/student/:id', async (req, res) => {
  try {
    const studentId = req.params.id;

    ibmdb.open(connStr, (err, conn) => {
      if (err) {
        console.error('db connection error:', err);
        return res.status(500).send('unable to connect to db');
      }

      const query = `SELECT * FROM STUSCHEMA.STUDENT WHERE STUDENTID = ?`;

      conn.query(query, [studentId], (err, data) => {
        if (err) {
          console.error('student data fetch err:', err);
          return res.status(500).send('student data fetch err');
        }
        console.log(data)
        res.status(200).json(data);
        conn.close();
      });
    });
  } catch (error) {
    console.error('server error:', error);
    res.status(500).send('server error');
  }
});

// get request for student info
app.get('/api/course', async (req, res) => {
  try {
    const studentId = req.params.id;

    ibmdb.open(connStr, (err, conn) => {
      if (err) {
        console.error('db connection error:', err);
        return res.status(500).send('unable to connect to db');
      }

      const query = `SELECT * FROM STUSCHEMA.COURSE`;

      conn.query(query, (err, data) => {
        if (err) {
          console.error('COURSE data fetch err:', err);
          return res.status(500).send('COURSE data fetch err');
        }
        console.log(data)
        res.status(200).json(data);
        conn.close();
      });
    });
  } catch (error) {
    console.error('server error:', error);
    res.status(500).send('server error');
  }
});

app.use(express.json());

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  ibmdb.open(connStr, (err, conn) => {
    if (err) {
      console.error('db connection error:', err);
      return res.status(500).send('unable to connect to db');
    }

    const query = `SELECT * FROM STUSCHEMA.STUDENT WHERE EMAIL = ? AND PASSWORD = ?`;

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
