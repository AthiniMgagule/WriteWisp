const database = require('../config/database');

//====== for creating a new novel
const createNovel = async(req, res) => {
  const { userID } = req.params;
  const { title, genre, summary } = req.body;
  const db = database.getConnection();

  if (!userID || !title) {
    return res.status(400).send('UserID and Title are required');
  }

  db.run(
    `INSERT INTO Novels (UserID, Title, Genre, Summary) VALUES (?, ?, ?, ?)`,
    [userID, title, genre, summary],
    function (err) {
      if (err) {
        console.error('Error creating novel:', err.message);
        return res.status(500).send('Internal Server Error');
      }
      
      // ✅ Return complete novel object
      res.status(201).json({
        NovelID: this.lastID,
        UserID: userID,
        Title: title,
        Genre: genre,
        Summary: summary
      });
    }
  );
};

//====== for getting novels of a user   
const getNovel = async(req,res) => {
  const { UserID } = req.params;
  const db = database.getConnection();

  db.all(`SELECT * FROM Novels WHERE UserID = ?`, [UserID], (err, rows) => {
    if (err) {
      console.error('Error retrieving novels:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).json(rows);
    }
  });
};

//====== for getting novel by its id
const getNovelById = async(req, res) => {
  const { NovelID } = req.params;
  const db = database.getConnection();

  if (!NovelID) {
    return res.status(400).send('NovelID parameter is required');
  }

  const query = 'SELECT * FROM Novels WHERE NovelID = ?';
  db.get(query, [NovelID], (err, row) => {
    if (err) {
      console.error('Error retrieving novel:', err.message);
      return res.status(500).send('Internal Server Error');
    }

    if (!row) {
      return res.status(404).send('Novel not found');
    }

    res.status(200).json(row);
  });
}
//====== for updating novel details
const updateNovel = async(req, res) => {
    const {NovelID} = req.params;
  const { userID, title, genre, summary } = req.body;
  const db = database.getConnection();

  db.get('SELECT * FROM Novels WHERE NovelID = ?', [NovelID], (err, row) => {
    if (err) {
      console.error('Error retrieving novel:', err.message);
      return res.status(500).send('Internal Server Error');
    }

    if (!row) {
      return res.status(404).send('Novel not found');
    }

    const updatedUserID = userID || row.UserID;
    const updatedTitle = title || row.Title;
    const updatedGenre = genre || row.Genre;
    const updatedSummary = summary || row.Summary;

    db.run(
      `UPDATE Novels SET UserID = ?, Title = ?, Genre = ?, Summary = ? WHERE NovelID = ?`,
      [updatedUserID, updatedTitle, updatedGenre, updatedSummary, NovelID],
      function (err) {
        if (err) {
          console.error('Error updating novel:', err.message);
          return res.status(500).send('Internal Server Error');
        }

        res.status(200).send('Novel updated successfully');
      }
    );
  });
}
//====== for deleting novel
const deleteNovel = async(req, res) => {
  const { NovelID } = req.params;
  const db = database.getConnection();

  db.run(`DELETE FROM Novels WHERE NovelID = ?`, [NovelID], function (err) {
    if (err) {
      console.error('Error deleting novel:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).send('Novel deleted successfully');
    }
  });
}

module.exports = {
    createNovel,
    getNovel,
    getNovelById,
    updateNovel,
    deleteNovel
}