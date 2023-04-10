require('dotenv').config()

const mongoose = require('mongoose')

const dbUrl = process.env.AUTH_DB_URL

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

module.exports = db