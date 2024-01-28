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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});