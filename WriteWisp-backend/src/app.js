const express = require('express')
const cors = require('cors')
const path = require('path')
const routes = require('./routes')
const errorHandler = require('./middleware/errorHandler')

const app = express()

//====== for middleware
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//====== for routes
app.use('/api', routes)

//====== for error handling middleware
app.use(errorHandler)

module.exports = app;