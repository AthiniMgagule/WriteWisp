const database = require('../config/database')
const db = database.getConnection();

//====== for creating notes
const createNote = async(req, res) => {
  const { NovelID } = req.params;
  const { title, content } = req.body;
  const db = database.getConnection();

  if (!NovelID) {
    return res.status(400).send('NovelID is required');
  }

  db.run(
    `INSERT INTO Notes (NovelID, Title, Content) VALUES (?, ?, ?)`,
    [NovelID, title, content],
    function (err) {
      if (err) {
        console.error('Error creating note:', err.message);
        return res.status(500).send('Internal Server Error');
      }
      
      res.status(201).json({
        NoteID: this.lastID,
        NovelID: parseInt(NovelID),
        Title: title || '',
        Content: content || ''
      });
    }
  );
};

//====== for getting notes
const getNotes = async(req, res) => {
    const {NovelID} = req.params;

    db.all(`SELECT * FROM Notes WHERE NovelID = ?`, [NovelID], (err, rows) => {
    if (err) {
      console.error('Error retrieving notes:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).json(rows);
    }
  });
}

//====== for getting each note
const getNoteById = async(req, res) => {
    const {NoteID} = req.params;

    db.get(`SELECT * FROM Notes WHERE NoteID = ?`, [NoteID], (err, row) => {
    if (err) {
      console.error('Error retrieving note:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).json(row);
    }
  });
}

//====== for updating notes
const updateNote = async(req, res) => {
    const { NoteID } = req.params;
    const { title, content } = req.body;
    const db = database.getConnection(); // Fixed: was missing database.getConnection()

    db.get('SELECT * FROM Notes WHERE NoteID = ?', [NoteID], (err, row) => {
        if (err) {
            console.error('Error retrieving note:', err.message);
            return res.status(500).send('Internal Server Error');
        }

        if (!row) {
            return res.status(404).send('Note not found'); // Fixed: was saying "Character not found"
        }

        const updatedTitle = title || row.Title;
        const updatedContent = content || row.Content;

        db.run(
            `UPDATE Notes SET Title = ?, Content = ? WHERE NoteID = ?`,
            [updatedTitle, updatedContent, NoteID],
            function (err) {
                if (err) {
                    console.error('Error updating note:', err.message);
                    return res.status(500).send('Internal Server Error');
                }

                res.status(200).send('Note updated successfully');
            }
        );
    });
};

//====== for deleting notes
const deleteNote = async(req, res) => {
    const { NoteID } = req.params;

  db.run(`DELETE FROM Notes WHERE NoteID = ?`, [NoteID], function (err) {
    if (err) {
      console.error('Error deleting note:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).send('Note deleted successfully');
    }
  });
}

module.exports = {
    createNote,
    getNotes,
    getNoteById,
    updateNote,
    deleteNote
}