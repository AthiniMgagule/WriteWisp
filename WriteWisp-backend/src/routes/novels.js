const express = require('express');
const { createNovel, getNovel, getNovelById, updateNovel, deleteNovel, getPromptJournal } = require('../controllers/novelController');

const authToken = require('../middleware/authToken');

const router = express.Router();

router.post('/:userID', authToken, createNovel);
router.get('/user/:UserID', authToken, getNovel);
router.get('/prompt-journal/:userID', authToken, getPromptJournal);
router.get('/:NovelID', authToken, getNovelById);
router.put('/:NovelID', authToken, updateNovel);
router.delete('/:NovelID', authToken, deleteNovel);

module.exports = router;