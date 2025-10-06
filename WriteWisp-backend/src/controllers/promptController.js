const database = require('../config/database');
const db = database.getConnection();

// Endpoint to get a random prompt by genre
app.get('/prompts/random/:genre', (req, res) => {
  const { genre } = req.params;

  // Query to get a random prompt of the specified genre
  const query = `SELECT * FROM prompts WHERE genre = ? ORDER BY RANDOM() LIMIT 1`;

  db.get(query, [genre], (err, prompt) => {
    if (err) {
      console.error('Error retrieving prompt:', err.message);
      return res.status(500).send('Internal Server Error');
    }

    if (!prompt) {
      return res.status(404).send('No prompts found for this genre');
    }

    res.status(200).json(prompt);
  });
});