require('dotenv').config()

const User = require('../model/user')
const crypto = require('crypto')
const path = require('path')
const db = require('../dbconnect/quippdb')
const mailer = require('../utils/mailer')
const { URLSearchParams } = require('url')

const { STATUS } = require('../utils/constants')

const verifyUniqueUserId =
async (req, res) => {
  const username = req.params.userId

  try {
    const user = await User.findOne({ username: username })
  
  if (!user) {
    res.status(200).json({'isUnique': true})
  } else {
    res.status(200).json({'isUnique': false})
  }
  } catch (err) {
    res.status(500).json({'error': err.message})
  }
  
}

const handleNewUser = 
async (req, res) => {
    const token = crypto.randomBytes(20).toString('hex')
    const expiryDate = new Date(Date.now() + 30 * 60 * 1000).toISOString()

    const count = await User.countDocuments({})
    
    const user = new User({
        _id: count + 1,
        username: req.body.username,
        email: req.body.email,
        dob: req.body.dob,
        hashedpassword: req.body.hashedpassword,
        status: STATUS.PENDING,
        registertoken: token,
        registertokenexpirydate: expiryDate.toLocaleString()
    })

    try {    
        await user.save()

        const activationLink = `http://localhost:3000/activate/${user.username}/${user.registertoken}`

        mailer.sendActivationMail(user.email, activationLink)
      
        res.json({ message: 'Please check mail for activation link' })

    } catch(e) {
        if (e.code === 11000) {
          res.status(409).json({'message': 'User with the same email already exists'})
        } else {
          res.status(500).json({'message': e})
        }
    }
}

const activateNewUser = 
async (req, res) => {

  try {
    const key = req.body.username
    const authToken = req.body.token

    const user = await User.findOne({ username: key })

    if (!user) {
      res.status(400).json({'message': 'User not found'})
    }

    if (new Date(user.registertokenexpirydate) < Date.now()) {
      await user.deleteOne()
      return res.status(400).json({'message': 'This token has expired'})
    }

    if (user.status != STATUS.PENDING) {
      res.status(401)
    }

    if (user.registertoken !== authToken) {
      return res.status(401).json({ 'message': 'Invalid token received' })
    }
      
    user.registertokenexpirydate = undefined
    user.registertoken = undefined
    user.status = STATUS.ACTIVE

    await user.save()

    res.status(200).json({'success': 'User has been registered'})
    
  } catch (e) {
    res.status(400).json({'message': JSON.stringify(e)})
    console.log(e.toString())
  }
}

module.exports = {
    handleNewUser,
    activateNewUser,
    verifyUniqueUserId
}