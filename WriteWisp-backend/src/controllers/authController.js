const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const database = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET;

const signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const db = database.getConnection();
    db.run(
      `INSERT INTO Users (username, email, password) VALUES (?, ?, ?)`,
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          console.error('Error creating user:', err.message);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          res.status(201).json({ message: 'User created successfully' });
        }
      }
    );
  } catch (err) {
    console.error('Error creating user:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const login = (req, res) => {
  const { email, password } = req.body;
  const db = database.getConnection();

  db.get(`SELECT * FROM Users WHERE email = ?`, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      userID: user.id,
      username: user.username,
      email: user.email
    });
  });
};

module.exports = {
  signup,
  login
};