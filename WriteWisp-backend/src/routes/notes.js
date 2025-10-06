const express = require('express');
const { createNote, getNotes, getNoteById, updateNote, deleteNote} = require('../controllers/noteController');

const authToken = require('../middleware/authToken');

const router = express.Router();
router.post('/:NovelID', authToken, createNote);
router.get('/:NovelID', authToken, getNotes);
router.get('/note/:NoteID', authToken, getNoteById);
router.put('/:NoteID', authToken, updateNote);
router.delete('/:NoteID', authToken, deleteNote);

module.exports = router;