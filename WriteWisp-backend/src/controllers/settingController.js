const database = require('../config/database');
const db = database.getConnection();

//endpoint to create a new setting
app.post('/settings', (req, res) => {
  const { novelID, name, description, details } = req.body;

  if (!novelID || !name) {
    return res.status(400).send('NovelID and Name are required');
  }

  db.run(`INSERT INTO Settings (NovelID, Name, Description, Details) VALUES (?, ?, ?, ?)`,
    [novelID, name, description, details],
    function (err) {
      if (err) {
        console.error('Error creating setting:', err.message);
        res.status(500).send('Internal Server Error');
      } else {
        res.status(201).json({ settingID: this.lastID });
      }
    });
});

//endpoint to get all settings of a novel
app.get('/settings/:novelID', (req, res) => {
  const { novelID } = req.params;

  db.all(`SELECT * FROM Settings WHERE NovelID = ?`, [novelID], (err, rows) => {
    if (err) {
      console.error('Error retrieving settings:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).json(rows);
    }
  });
});

//endpoint to get a single setting by id
app.get('/settings/setting/:settingID', (req, res) => {
  const { settingID } = req.params;

  db.get(`SELECT * FROM Settings WHERE SettingID = ?`, [settingID], (err, row) => {
    if (err) {
      console.error('Error retrieving setting:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).json(row);
    }
  });
});

//endpoint to update a setting
app.put('/settings/:settingID', (req, res) => {
  const { settingID } = req.params;
  const { name, description, details } = req.body;

  db.run(`UPDATE Settings SET Name = ?, Description = ?, Details = ? WHERE SettingID = ?`,
    [name, description, details, settingID],
    function (err) {
      if (err) {
        console.error('Error updating setting:', err.message);
        res.status(500).send('Internal Server Error');
      } else {
        res.status(200).send('Setting updated successfully');
      }
    });
});

//endpoint to delete a setting
app.delete('/settings/:settingID', (req, res) => {
  const { settingID } = req.params;

  db.run(`DELETE FROM Settings WHERE SettingID = ?`, [settingID], function (err) {
    if (err) {
      console.error('Error deleting setting:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).send('Setting deleted successfully');
    }
  });
});