const bcrypt = require('bcrypt');
const database = require('../config/database');

// ====== Get all users
const getUsers = (req, res) => {
  const db = database.getConnection();
  db.all(`SELECT id, username, email FROM Users`, [], (err, rows) => {
    if (err) {
      console.error('Error retrieving users:', err.message);
      return res.status(500).send('Internal Server Error');
    }
    res.status(200).json(rows);
  });
};

// ====== Get user by ID
const getUserById = (req, res) => {
  const { id } = req.params;
  const db = database.getConnection();

  if (!id) {
    return res.status(400).send('ID parameter is required');
  }

  const query = 'SELECT id, username, email FROM Users WHERE id = ?'; // avoid exposing password
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error retrieving user:', err.message);
      return res.status(500).send('Internal Server Error');
    }
    if (!row) {
      return res.status(404).send('User not found');
    }
    res.status(200).json(row);
  });
};

// ====== Update user details
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  const db = database.getConnection();

  // Restrict updates: user can only update their own account unless admin
  if (parseInt(id) !== req.user.id) {
    return res.status(403).send('Forbidden: you can only update your own account');
  }

  db.get('SELECT * FROM Users WHERE id = ?', [id], async (err, row) => {
    if (err) {
      console.error('Error retrieving user:', err.message);
      return res.status(500).send('Internal server error');
    }

    if (!row) {
      return res.status(404).send('User not found');
    }

    try {
      const updatedUserName = username || row.username;
      const SALT_ROUNDS = 10;

      let updatedPassword = row.password;
      if (password) {
        updatedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      }

      db.run(
        `UPDATE Users SET username = ?, password = ? WHERE id = ?`,
        [updatedUserName, updatedPassword, id],
        function (err) {
          if (err) {
            console.error('Error updating user:', err.message);
            return res.status(500).send('Internal server error');
          }

          if (this.changes === 0) {
            return res.status(400).send('No changes were made');
          }

          res.status(200).send('User updated successfully');
        }
      );
    } catch (hashErr) {
      console.error('Error hashing password:', hashErr.message);
      res.status(500).send('Internal server error');
    }
  });
};

// ====== Delete user
const deleteUser = (req, res) => {
  const { id } = req.params;
  const db = database.getConnection();

  // Restrict deletes: user can only delete their own account unless admin
  if (parseInt(id) !== req.user.id) {
    return res.status(403).send('Forbidden: you can only delete your own account');
  }

  db.run('DELETE FROM Users WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Error deleting user:', err.message);
      return res.status(500).send('Internal server error');
    }

    if (this.changes === 0) {
      return res.status(404).send('User not found');
    }

    res.status(200).send('User deleted successfully');
  });
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};