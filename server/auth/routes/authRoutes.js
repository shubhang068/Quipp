const express = require('express')
const router = express.Router()
const registerController = require('../controllers/registerController')
const resetPasswordController = require('../controllers/resetPasswordController')
const loginController = require('../controllers/loginController')

router.route('/register')
    .post(registerController.handleNewUser)

router.route('/activate')
    .post(registerController.activateNewUser)
    
router.route('/verifyUserId/:userId')
    .get(registerController.verifyUniqueUserId)
    
router.route('/forgotPassword')
    .post(resetPasswordController.handleForgotPassword)

router.route('/resetPassword')
    .post(resetPasswordController.handleResetPassword)

router.route('/login')
    .post(loginController.handleUserLogin)

router.route('/checkAuthByPass')
    .post(loginController.checkAuthByPass)    

module.exports = router