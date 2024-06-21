const User = require('../models/User.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const salt = bcrypt.genSaltSync(10)
const secret = 'asdflkjhg'

exports.register = async (req, res) => {
    try {
        const { username, password, email } = req.body
        try {
            const userDoc = await User.create({
                username,
                password: bcrypt.hashSync(password, salt),
                email
            })
            res.json(userDoc)
        } catch (err) {
            res.status(500).json({ message: 'Server error', error: err })
        }
    } catch (err) {
        console.log("Error in register controller", err.message)
        res.status(500).json({ error: "Internal Server Error" })
    }
}
exports.profile = async (req, res) => {
    try {
        const { token } = req.cookies
        if (!token) {
            return res.status(401).json({ message: 'No token provided' })
        }
        jwt.verify(token, secret, {}, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Token verification failed', error: err })
            }
            res.json(decoded)
        })
    } catch (err) {
        console.log("Error in profile controller", err.message)
        res.status(500).json({ error: "Internal Server Error" })
    }
}
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.findOne({ username });
        if (!userDoc) return res.status(400).json({ message: 'Wrong credentials' });
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
                if (err) return res.status(500).json({ message: 'Token generation failed', error: err });
                res.cookie('token', token, { httpOnly: true }).json({
                    id: userDoc._id,
                    username,
                });
            });
        } else {
            res.status(400).json({ message: 'Wrong credentials' });
        }
    } catch (err) {
        console.log("Error in login controller", err.message)
        res.status(500).json({ error: "Internal Server Error" })
    }
}
exports.logout = async (req, res) => {
    try {
        // res.cookie('token', '').json('ok')
        res.clearCookie('token').json({ message: 'Logged out successfully' });

    } catch (err) {
        console.log("Error in logout controller", err.message)
        res.status(500).json({ error: "Internal Server Error" })
    }
}




