require('dotenv').config()

const User = require('../model/user')
const db = require('../dbconnect/quippdb')
const jwt = require('jsonwebtoken')

const handleUserLogin =
async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username })

        if (!user) {
            return res.status(400).json({ 'message': `${req.body.username} user not found` })
        }

        const password = req.body.password

        if (user.hashedpassword !== password) {
            return res.status(401).json({ 'message': `${password}` })
        } 

        const token = jwt.sign({ username: user.username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' })

        if (user.status === 'active') {
            res.cookie('auth_meta', token, { secure: false, maxAge: 168 * 360000 })
            return res.status(200).json({ 'authMeta': `${token}`})

        } else if (user.status === 'inactive') {
            user.status = 'active'
            await user.save()
            return res.status(200).json({ 'success': 'User restored successfully' })
        } else {
            if (user.registertokenexpirydate && new Date(user.registertokenexpirydate) < Date.now()) {
                await user.deleteOne()
                return res.status(498).json({'message': 'Your auth has expired. Please register again'})
            }
        }
        

    } catch (e) {
        return res.status(500).json({ 'message': JSON.stringify(e) })
    }
    
}

const checkAuthByPass =
 async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1].toString()

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            res.status(400).json({ 'error': err.toString()})
        }
        
        try {
            const user = await User.findOne( { username: decoded.username } )

            if (!user) {
                return res.status(401).json({'error': 'User not found'})
            }

            return res.status(200).json({'success': 'User has been verified'})            

        } catch (e) {
            res.status(500).json({ 'error': e.toString() })

        }
    })   
}

module.exports = { 
    handleUserLogin,
    checkAuthByPass
}