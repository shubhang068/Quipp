require('dotenv').config()

const User = require('../model/user')
const crypto = require('crypto')
const path = require('path')
const db = require('../dbconnect/quippdb')
const mailer = require('../utils/mailer')
const { URLSearchParams } = require('url')

const STATUS = require('../utils/constants').STATUS

const handleForgotPassword = 
async (req, res) => {

    const token = crypto.randomBytes(20).toString('hex')
    const expiryDate = new Date(Date.now() + 30 * 60 * 1000).toISOString()

    try {
        const key = req.body.key

        const user = await User.findOne({
            $or: [{ username: key }, { email: key }],
        })
        
        if (!user) {
            return res.status(400).json({ 'message': 'User not found' })
        }

        user.passwordtoken = token
        user.passwordtokenexpirydate = expiryDate
        
        await user.save()

        const activationLink = `http://localhost:3000/resetpassword/${user.username}/${user.passwordtoken}`
        mailer.sendResetPasswordMail(user.email, activationLink)        
      
        res.json({ message: 'Please check mail for reset password link' })

    } catch(e) {
        res.status(500).json({ 'message': e.message })

    }
}

const handleResetPassword = 
async (req, res) => {
    try {
        const authToken = req.body.token
        const userId = req.body.username
        const password = req.body.password

        const user = await User.findOne({ username: userId })

        if (!user) {
            return res.status(400).json({'message': 'User not found'})
        }

        if (user.passwordtoken != authToken) {
            return res.status(401).json({'message': 'Invalid token found'})
        }

        if (new Date(user.passwordtokenexpirydate) < Date.now()) {
            await user.deleteOne()
            return res.status(400).json({'message': 'This token has expired'})
        }

        user.hashedpassword = password
        user.passwordtoken = undefined
        user.passwordtokenexpirydate = undefined

        await user.save()

        return res.status(200).json({ 'success': 'Password updated successfully' })

    } catch (e) {
        res.status(500).json({'message': JSON.stringify(e)})
        console.log(e.toString())

      }
     
}

module.exports = {
    handleForgotPassword,
    handleResetPassword
}