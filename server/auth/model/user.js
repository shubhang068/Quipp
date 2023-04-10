const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  _id: {
    type: Number,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  dob: {
    type: String,
    required: true
  },
  hashedpassword: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  registertoken: {
    type: String,
    required: false
  },
  registertokenexpirydate: {
    type: String,
    required: false
  },
  passwordtoken: {
    type: String,
    required: false
  },
  passwordtokenexpirydate: {
    type: String,
    required: false
  }
}, { versionKey: false })

module.exports = mongoose.model('User', userSchema)