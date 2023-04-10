require('dotenv').config()

const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_PASSWORD
    }
  })

const sendActivationMail = 
async(email, activationLink) => 
await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: 'Activate your account',
    html: `Click <a href="${activationLink}">here</a> to activate your account.`
})

const sendResetPasswordMail = 
async(email, activationLink) => 
await transporter.sendMail({
    from: process.env.SENDER_EMAIL,      
    to: email,
    subject: 'Reset your account password',
    html: `Click <a href="${activationLink}">here</a> to reset your password.`
})

module.exports = { 
    sendActivationMail,
    sendResetPasswordMail 
}