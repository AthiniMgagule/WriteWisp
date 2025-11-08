const database = require('../config/database');

// Helper function to get or create prompt journal
const getOrCreatePromptJournal = async (userID, username) => {
  const db = database.getConnection();
  
  return new Promise((resolve, reject) => {
    // Check if prompt journal exists
    db.get(
      `SELECT * FROM Novels WHERE UserID = ? AND IsPromptJournal = 1`,
      [userID],
      (err, row) => {
        if (err) {
          return reject(err);
        }
        
        if (row) {
          return resolve(row);
        }
        
        // Create new prompt journal
        const journalTitle = `${username}'s Writing Prompts`;
        db.run(
          `INSERT INTO Novels (UserID, Title, Genre, Summary, IsPromptJournal) VALUES (?, ?, ?, ?, ?)`,
          [userID, journalTitle, 'Mixed', 'A collection of daily writing prompts and responses', 1],
          function(err) {
            if (err) {
              return reject(err);
            }
            
            resolve({
              NovelID: this.lastID,
              UserID: userID,
              Title: journalTitle,
              Genre: 'Mixed',
              Summary: 'A collection of daily writing prompts and responses',
              IsPromptJournal: 1
            });
          }
        );
      }
    );
  });
};

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

//====== Get or create prompt journal
const getPromptJournal = async(req, res) => {
  const { userID } = req.params;
  const { username } = req.query;
  
  if (!userID) {
    return res.status(400).send('UserID is required');
  }

  try {
    const journal = await getOrCreatePromptJournal(userID, username || 'Writer');
    res.status(200).json(journal);
  } catch (err) {
    console.error('Error getting prompt journal:', err.message);
    res.status(500).send('Internal Server Error');
  }
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
    deleteNovel,
    getPromptJournal
}