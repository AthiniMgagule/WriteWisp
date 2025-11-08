const express = require('express');
const router = express.Router();
const promptController = require('../controllers/promptController');
const authToken = require('../middleware/authToken');

router.post('/public/generate/:genre', promptController.generatePrompt); //====== no authentication is required
router.post('/generate/:genre', authToken, promptController.generatePrompt);
router.get('/generate-stream/:genre', authToken, promptController.generatePromptStream);
router.post('/generate-batch', authToken, promptController.generateMultiplePrompts);
router.get('/random/:genre', authToken, promptController.getRandomPrompt);
router.get('/', authToken, promptController.getAllPrompts);

module.exports = router;