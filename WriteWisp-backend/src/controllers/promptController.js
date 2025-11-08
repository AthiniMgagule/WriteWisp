const database = require('../config/database');
const OpenAI = require('openai');

// NVIDIA API configuration using OpenAI SDK
const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const MODEL = 'meta/llama-3.1-70b-instruct';

// Genre-specific system prompts
const GENRE_PROMPTS = {
  fantasy: "You are a creative writing assistant specializing in fantasy literature. Generate engaging, original writing prompts with magical elements, mythical creatures, or fantastical worlds.",
  'sci-fi': "You are a creative writing assistant specializing in science fiction. Generate engaging, original writing prompts exploring futuristic technology, space exploration, or scientific concepts.",
  mystery: "You are a creative writing assistant specializing in mystery and thriller genres. Generate engaging, original writing prompts with suspense, intrigue, and compelling puzzles.",
  romance: "You are a creative writing assistant specializing in romance. Generate engaging, original writing prompts focusing on relationships, emotions, and romantic tension.",
  horror: "You are a creative writing assistant specializing in horror. Generate engaging, original writing prompts that create tension, fear, and supernatural or psychological dread.",
  adventure: "You are a creative writing assistant specializing in adventure stories. Generate engaging, original writing prompts featuring exploration, quests, and exciting challenges.",
  historical: "You are a creative writing assistant specializing in historical fiction. Generate engaging, original writing prompts set in a specific historical period with authentic details.",
  contemporary: "You are a creative writing assistant specializing in contemporary fiction. Generate engaging, original writing prompts set in modern times with relatable, realistic situations.",
  thriller: "You are a creative writing assistant specializing in thrillers. Generate engaging, original writing prompts with high stakes, tension, and an exciting pace.",
  drama: "You are a creative writing assistant specializing in dramatic fiction. Generate engaging, original writing prompts focusing on complex emotions, relationships, and meaningful conflicts."
};

// Generate a prompt using NVIDIA API
const generatePrompt = async (req, res) => {
  const { genre } = req.params;

  if (!genre) {
    return res.status(400).json({ error: 'Genre is required' });
  }

  if (!process.env.NVIDIA_API_KEY) {
    return res.status(500).json({ 
      error: 'NVIDIA API key not configured',
      setup: 'Add NVIDIA_API_KEY to your .env file'
    });
  }

  try {
    const systemContent = GENRE_PROMPTS[genre.toLowerCase()] || 
      "You are a creative writing assistant. Generate engaging, original writing prompts.";

    // Add random tag to bypass caching and force unique outputs
    const randomTag = Math.random().toString(36).substring(2, 8);

    const completionParams = {
      model: MODEL,
      messages: [
        { role: "system", content: systemContent },
        {
          role: "user",
          content: `Generate a unique and imaginative creative writing prompt for a ${genre} story. 
          Avoid reusing earlier ideas or generic setups. 
          The prompt should be 2–3 sentences, intriguing, and provide a clear starting point for a story.
          [${randomTag}]`
        }
      ],
      temperature: 0.8 + Math.random() * 0.2, // small random variation
      top_p: 0.95,
      max_tokens: 200,
      stream: false
    };
    
    const completion = await openai.chat.completions.create(completionParams);
    const prompt = completion.choices[0].message.content.trim();

    const cleanPrompt = prompt
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/\*\*/g, '') // Remove bold markdown
      .trim();

    // Check for duplicates before saving
    const db = database.getConnection();
    db.get(
      `SELECT COUNT(*) AS count FROM Prompts WHERE Genre = ? AND PromptText = ?`,
      [genre, cleanPrompt],
      (err, row) => {
        if (err) {
          console.error('Error checking duplicates:', err.message);
          return;
        }

        if (row.count === 0) {
          db.run(
            `INSERT INTO Prompts (Genre, PromptText, CreatedAt) VALUES (?, ?, datetime('now'))`,
            [genre, cleanPrompt],
            (err) => {
              if (err) console.error('Error saving prompt:', err.message);
            }
          );
        } else {
          console.log(`Duplicate prompt detected for genre ${genre}, not saved.`);
        }
      }
    );

    res.status(200).json({
      genre: genre,
      prompt: cleanPrompt,
      generated: true,
      model: MODEL
    });

  } catch (error) {
    console.error('Error generating prompt:', error.message);

    if (error.status === 401) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'Please check your NVIDIA API key'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Please try again later'
      });
    }

    // Fallback: get random prompt from database
    const db = database.getConnection();
    db.get(
      `SELECT * FROM Prompts WHERE Genre = ? ORDER BY RANDOM() LIMIT 1`,
      [genre],
      (err, prompt) => {
        if (err || !prompt) {
          return res.status(500).json({ 
            error: 'Failed to generate prompt',
            message: error.message,
            fallback_failed: true
          });
        }

        res.status(200).json({
          genre: genre,
          prompt: prompt.PromptText,
          generated: false,
          fallback: true,
          message: 'Using cached prompt due to API unavailability'
        });
      }
    );
  }
};

// Generate a prompt with streaming (for real-time display)
const generatePromptStream = async (req, res) => {
  const { genre } = req.params;

  if (!genre) {
    return res.status(400).json({ error: 'Genre is required' });
  }

  if (!process.env.NVIDIA_API_KEY) {
    return res.status(500).json({ error: 'NVIDIA API key not configured' });
  }

  try {
    const systemContent = GENRE_PROMPTS[genre.toLowerCase()] ||
      "You are a creative writing assistant. Generate engaging, original writing prompts.";

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Connection', 'keep-alive');

    const randomTag = Math.random().toString(36).substring(2, 8);

    const completionParams = {
      model: MODEL,
      messages: [
        { role: "system", content: systemContent },
        {
          role: "user",
          content: `Generate a unique, creative writing prompt for a ${genre} story. 
          Make sure it's distinct from earlier ideas. 
          The prompt should be 2–3 sentences, intriguing, and clear.
          [${randomTag}]`
        }
      ],
      temperature: 0.98,
      top_p: 0.95,
      max_tokens: 200,
      stream: true
    };
    
    const completion = await openai.chat.completions.create(completionParams);
    let fullPrompt = '';

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullPrompt += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);

    const cleanPrompt = fullPrompt.trim().replace(/^["']|["']$/g, '').replace(/\*\*/g, '');
    const db = database.getConnection();

    db.run(
      `INSERT INTO Prompts (Genre, PromptText, CreatedAt) VALUES (?, ?, datetime('now'))`,
      [genre, cleanPrompt],
      (err) => {
        if (err) console.error('Error saving prompt:', err.message);
      }
    );

    res.end();

  } catch (error) {
    console.error('Error generating prompt (stream):', error.message);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

// Generate multiple prompts at once (batch generation)
const generateMultiplePrompts = async (req, res) => {
  const { genre, count = 3 } = req.body;

  if (!genre) {
    return res.status(400).json({ error: 'Genre is required' });
  }

  if (!process.env.NVIDIA_API_KEY) {
    return res.status(500).json({ error: 'NVIDIA API key not configured' });
  }

  try {
    const systemContent = GENRE_PROMPTS[genre.toLowerCase()] ||
      "You are a creative writing assistant. Generate engaging, original writing prompts.";

    const randomTag = Math.random().toString(36).substring(2, 8);

    const completionParams = {
      model: MODEL,
      messages: [
        { role: "system", content: systemContent },
        {
          role: "user",
          content: `Generate ${count} unique creative writing prompts for ${genre} stories. 
          Each prompt should be 2–3 sentences, distinct, and intriguing. 
          Number them 1, 2, 3, etc. [${randomTag}]`
        }
      ],
      temperature: 0.9,
      top_p: 0.95,
      max_tokens: 500,
      stream: false
    };
    
    const completion = await openai.chat.completions.create(completionParams);
    const content = completion.choices[0].message.content.trim();

    const prompts = content
      .split(/\d+\.\s+/)
      .filter(p => p.trim().length > 0)
      .map(p => p.trim().replace(/^["']|["']$/g, ''));

    const db = database.getConnection();
    prompts.forEach(prompt => {
      db.run(
        `INSERT INTO Prompts (Genre, PromptText, CreatedAt) VALUES (?, ?, datetime('now'))`,
        [genre, prompt],
        (err) => {
          if (err) console.error('Error saving prompt:', err.message);
        }
      );
    });

    res.status(200).json({
      genre: genre,
      prompts: prompts,
      count: prompts.length,
      generated: true,
      model: MODEL
    });

  } catch (error) {
    console.error('Error generating prompts:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate prompts',
      message: error.message 
    });
  }
};

// Get a random prompt by genre
const getRandomPrompt = (req, res) => {
  const { genre } = req.params;

  const db = database.getConnection();
  db.get(
    `SELECT * FROM Prompts WHERE Genre = ? ORDER BY RANDOM() LIMIT 1`,
    [genre],
    (err, prompt) => {
      if (err) {
        console.error('Error retrieving prompt:', err.message);
        return res.status(500).send('Internal Server Error');
      }

      if (!prompt) {
        return res.status(404).json({
          error: 'No prompts found for this genre',
          suggestion: 'Try generating a new prompt first'
        });
      }

      res.status(200).json(prompt);
    }
  );
};

// Get all prompts (optionally filtered by genre)
const getAllPrompts = (req, res) => {
  const { genre } = req.query;
  const db = database.getConnection();

  let query = 'SELECT * FROM Prompts';
  const params = [];

  if (genre) {
    query += ' WHERE Genre = ?';
    params.push(genre);
  }

  query += ' ORDER BY CreatedAt DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error retrieving prompts:', err.message);
      return res.status(500).send('Internal Server Error');
    }

    res.status(200).json({
      prompts: rows,
      count: rows.length
    });
  });
};

module.exports = {
  generatePrompt,
  generatePromptStream,
  generateMultiplePrompts,
  getRandomPrompt,
  getAllPrompts
};
