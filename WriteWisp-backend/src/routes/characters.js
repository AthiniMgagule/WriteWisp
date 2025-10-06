const express = require('express')
const {createCharacter, getCharacters, getCharacterById, updateCharacter, deleteCharacter} = require('../controllers/characterController')

const authToken = require('../middleware/authToken');

const router = express.Router()
router.post('/:NovelID', authToken, createCharacter)
router.get('/:NovelID', authToken, getCharacters)
router.get('/character/:CharacterID', authToken, getCharacterById)
router.put('/:CharacterID', authToken, updateCharacter)
router.delete('/:CharacterID', authToken, deleteCharacter)

module.exports = router;