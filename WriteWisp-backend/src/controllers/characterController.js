const database = require('../config/database')
//====== for creating new character
const createCharacter = async(req, res) => {
  const { NovelID } = req.params;
  const { name, description, role } = req.body;
  const db = database.getConnection();

  if (!NovelID || !name) {
    return res.status(400).send('Novel ID and name are required');
  }

  db.run(
    `INSERT INTO Characters (NovelID, Name, Description, Role) VALUES (?, ?, ?, ?)`,
    [NovelID, name, description, role],
    function (err) {
      if (err) {
        console.error('Error creating character:', err.message);
        return res.status(500).send('Internal Server Error');
      }
      
      // Return complete character object (note: CharacterID not characterID)
      res.status(201).json({
        CharacterID: this.lastID,
        NovelID: parseInt(NovelID),
        Name: name,
        Description: description || '',
        Role: role || ''
      });
    }
  );
};

//====== for getting characters of a novel
const getCharacters = async(req, res) => {
    const { NovelID } = req.params;
    const db = database.getConnection();

    db.all(`SELECT * FROM Characters WHERE NovelID = ?`, [NovelID], (err, rows) => {
    if (err) {
      console.error('Error retrieving characters:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).json(rows);
    }
  });
}

//====== for getting each character by id
const getCharacterById = async(req, res) => {
    const { CharacterID } = req.params;
    const db = database.getConnection();

    db.all(`SELECT * FROM Characters WHERE CharacterID = ?`, [CharacterID], (err, rows) => {
    if (err) {
      console.error('Error retrieving characters:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).json(rows);
    }
  });
}

//====== for updating characters
const updateCharacter = async(req, res) => {
    const { CharacterID } = req.params;
    const { name, description, role } = req.body;
    const db = database.getConnection();

    db.get('SELECT * FROM Characters WHERE CharacterID = ?', [CharacterID], (err, row) => {
        if (err) {
            console.error('Error retrieving character:', err.message);
            return res.status(500).send('Internal Server Error');
        }

        if (!row) {
            return res.status(404).send('Character not found');
        }

        const updatedName = name || row.Name;
        const updatedDescription = description || row.Description;
        const updatedRole = role || row.Role;

        db.run(
            `UPDATE Characters SET Name = ?, Description = ?, Role = ? WHERE CharacterID = ?`,
            [updatedName, updatedDescription, updatedRole, CharacterID],
            function (err) {
                if (err) {
                    console.error('Error updating character:', err.message);
                    return res.status(500).send('Internal Server Error');
                }

                res.status(200).send('Character updated successfully');
            }
        );
    });
};

//====== for deleting characters
const deleteCharacter = async(req, res) => {
    const { CharacterID } = req.params;
    const db = database.getConnection();

    db.run(`DELETE FROM Characters WHERE CharacterID = ?`, [CharacterID], function (err) {
    if (err) {
      console.error('Error deleting character:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).send('Character deleted successfully');
    }
  });
}

module.exports = {
    createCharacter,
    getCharacters,
    getCharacterById,
    updateCharacter,
    deleteCharacter
}