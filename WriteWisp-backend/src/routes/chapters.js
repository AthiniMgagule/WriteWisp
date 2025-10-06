const express = require('express');
const {createChapter, getAllChapters, getChapterById, updateChapter, deleteChapter } = require('../controllers/chapterController')

const authToken = require('../middleware/authToken');

const router = express.Router();

router.post('/:NovelID', authToken, createChapter);
router.get('/:NovelID', authToken, getAllChapters);
router.get('/chapter/:ChapterID', authToken, getChapterById);
router.put('/:ChapterID', authToken, updateChapter);
router.delete('/:ChapterID', authToken, deleteChapter);

module.exports = router;