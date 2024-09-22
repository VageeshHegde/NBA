const cors = require('cors');
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Hegde@123456",
    database: "cosc625"
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to database');
    }
});

app.get("/contactus", (req, res) => {
    const sql = "SELECT * FROM contactus";
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(data);
        }
    });
});

app.post('/insertData', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Invalid request. Missing required fields.' });
    }

    // Retrieve customerId based on email from loginpro table
    const getCustomerIdQuery = 'SELECT customerId FROM loginpro WHERE email = ?';
    db.query(getCustomerIdQuery, [email], (err, result) => {
        if (err) {
            console.error('Error fetching customerId:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'User not found with the provided email.' });
        }

        const customerId = result[0].customerId;

        // Insert data into contactus table
        const insertQuery = 'INSERT INTO contactus (name, email, message, Login_id) VALUES (?, ?, ?, ?)';
        const values = [name, email, message, customerId];

        db.query(insertQuery, values, (err, insertResult) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            console.log('Data inserted successfully');
            return res.status(200).json({ message: 'Data inserted successfully' });
        });
    });
});


//try
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      // Execute the query and get the result
    //   const [rows, fields] = await db.query('SELECT * FROM loginpro WHERE email = ?', [email]);
  
    //   // Check if any rows are returned
    //   if (rows.length > 0) {
    //     return res.status(400).json({ error: 'User already exists' });
    //   }
  
      // Insert a new user into the database with plain text password
      await db.query('INSERT INTO loginpro (Name, Email, Password) VALUES (?, ?, ?)', [name, email, password]);
  
      res.json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
//try

app.listen(8081, () => {
    console.log("Listening on port 8081...");
});
