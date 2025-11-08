const database = require('../config/database');

//====== for creating chapters of a novel (with optional prompt data)
const createChapter = async(req, res) => {
  const { NovelID } = req.params;
  const { title, content, promptText, promptGenre } = req.body;
  const db = database.getConnection();

  if (!NovelID || !title) {
    return res.status(400).send('NovelID and Title are required');
  }

  db.run(
    `INSERT INTO Chapters (NovelID, Title, Content, PromptText, PromptGenre) VALUES (?, ?, ?, ?, ?)`,
    [NovelID, title, content, promptText || null, promptGenre || null],
    function (err) {
      if (err) {
        console.error('Error creating chapter:', err.message);
        return res.status(500).send('Internal Server Error');
      }
      
      res.status(201).json({
        ChapterID: this.lastID,
        NovelID: parseInt(NovelID),
        Title: title,
        Content: content || '',
        PromptText: promptText || null,
        PromptGenre: promptGenre || null
      });
    }
  );
};

//====== for getting all chapters of a novel
const getAllChapters = async(req, res) => {
    const { NovelID } = req.params;
    const db = database.getConnection();

  db.all(`SELECT * FROM Chapters WHERE NovelID = ?`, [NovelID], (err, rows) => {
    if (err) {
      console.error('Error retrieving chapters:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).json(rows);
    }
  });
}

//====== for getting each chapter of a novel by id
const getChapterById = async(req, res) => {
    const { ChapterID } = req.params;
    const db = database.getConnection();

    db.get(`SELECT * FROM Chapters WHERE ChapterID = ?`, [ChapterID], (err, row) => {
        if (err) {
            console.error('Error retrieving chapter:', err.message);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).json(row);
        }
  });
}

//====== for updating chapter of a novel
const updateChapter = async(req, res) => {
    const { ChapterID } = req.params;
    const { title, content } = req.body;

    const db = database.getConnection();

    db.get('SELECT * FROM Chapters WHERE ChapterID = ?', [ChapterID], (err, row) => {
    if (err) {
      console.error('Error retrieving chapter:', err.message);
      return res.status(500).send('Internal Server Error');
    }

    if (!row) {
      return res.status(404).send('Chapter not found');
    }

    const updatedTitle = title || row.Title;
    const updatedContent = content || row.Content;

    db.run(
      `UPDATE Chapters SET Title = ?, Content = ? WHERE ChapterID = ?`,
      [updatedTitle, updatedContent, ChapterID],
      function (err) {
        if (err) {
          console.error('Error updating chapter:', err.message);
          return res.status(500).send('Internal Server Error');
        }

        res.status(200).send('Chapter updated successfully');
      }
    );
  });
}

//====== for deleting chapter
const deleteChapter = async(req, res) => {
    const { ChapterID } = req.params;
    const db = database.getConnection();

    db.run(`DELETE FROM Chapters WHERE ChapterID = ?`, [ChapterID], function (err) {
    if (err) {
      console.error('Error deleting chapter:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).send('Chapter deleted successfully');
    }
  });
}

module.exports = {
    createChapter,
    getAllChapters,
    getChapterById,
    updateChapter,
    deleteChapter
}