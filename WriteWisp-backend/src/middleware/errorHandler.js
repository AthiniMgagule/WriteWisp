const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.type === 'validation') {
    return res.status(400).json({ error: err.message });
  }

  if (err.type === 'database') {
    return res.status(500).json({ error: 'Database error occurred' });
  }

  res.status(500).json({ error: 'Internal Server Error' });
};

module.exports = errorHandler;