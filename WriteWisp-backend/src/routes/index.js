const express = require('express')
const authRoutes = require('./auth')
const userRoutes = require('./users')
const novelRoutes = require('./novels')
const chapterRoutes = require('./chapters')
const characterRoutes = require('./characters')
const noteRoutes = require('./notes')
// const settingRoutes = require('./settings')
// const promptRoutes = require('./prompts')

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/novels', novelRoutes)
router.use('/chapters', chapterRoutes)
router.use('/characters', characterRoutes)
router.use('/notes', noteRoutes)
// router.use('/settings', settingRoutes)
// router.use('/prompts', promptRoutes)

module.exports = router;