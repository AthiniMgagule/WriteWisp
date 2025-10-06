const express = require('express');
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');

const authToken = require('../middleware/authToken');

const router = express.Router();
router.get('/', authToken, getUsers);
router.get('/:id', authToken, getUserById);
router.put('/:id', authToken, updateUser);
router.delete('/:id', authToken, deleteUser);

module.exports = router;