const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 8081;


const corsOptions = {
    origin: 'http://localhost:3000', // Update this to the origin of your React app
    credentials: true,
  };
  
  app.use(cors(corsOptions));
  app.use(bodyParser.json());


// Use express-session middleware
app.use(session({
  secret: 'sportsStat',
  resave: false,
  saveUninitialized: true,
  secure: true, // Set to true if using HTTPS
  httpOnly: true,
}));


const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Hegde@123456',
  database: 'cosc625',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Middleware to check if the user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.session.userId) {
    // User is logged in, proceed to the next middleware or route
    next();
  } else {
    // User is not logged in, send an unauthorized response
    res.status(401).json({ error: 'Unauthorized' });
  }
};

app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Insert data into loginpro table
    const insertQuery = 'INSERT INTO loginpro (Name, Email, Password) VALUES (?, ?, ?)';
    const values = [name, email, password];

    // Execute the database query
    const [result] = await db.query(insertQuery, values);

    // Check if the insertion was successful
    if (result.affectedRows === 1) {
      console.log('Data inserted successfully');
      return res.status(200).json({ message: 'User registered successfully' });
    } else {
      console.error('Error inserting data:', result);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Retrieve user information from the database
    const [user] = await db.query('SELECT * FROM loginpro WHERE Email = ?', [email]);

    if (user.length === 0 || user[0].Password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set userId in the session to track the user
    
    req.session.userId = req.sessionID; // Use the correct column name


    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.get('/user', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.userId;
    const [user] = await db.query('SELECT Name FROM loginpro WHERE customerId = ?', [userId]);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    
    res.json({ name: user[0].Name });
  } catch (error) {
    console.error('Error fetching user information:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Logout endpoint
app.post('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }

    // Respond with a message indicating successful logout
    res.json({ message: 'Logout successful' });
  });
});

// Protected route that requires authentication
app.get('/protected', (req, res) => {
  res.json({ message: 'This is a protected route' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
