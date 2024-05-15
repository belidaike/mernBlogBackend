const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/User')
const Post = require('./models/Post')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const uploadMiddleware = multer({ dest: 'uploads/' })
const fs = require('fs')

const app = express()

const salt = bcrypt.genSaltSync(10)
const secret = 'asdflkjhg'

app.use(cors({ credentials: true, origin: 'https://rtblog-com.onrender.com' }))
app.use(express.json())
app.use(cookieParser())
app.use('/uploads', express.static(__dirname + '/uploads'))

mongoose.connect('mongodb+srv://ikebelida539:09109672506@cluster0.mre8jcv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

app.post('/register', async (req, res) => {
    const { username, password, email } = req.body
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt),
            email
        })
        res.json(userDoc)
    } catch (err) {
        res.status(409).json(err)
    }
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body
    const userDoc = await User.findOne({ username })
    const passOk = bcrypt.compareSync(password, userDoc.password)
    // res.json(passOk)
    if (passOk) {
        //logged in
        jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
            if (err) throw err
            res.cookie('token', token).json({
                id: userDoc._id,
                username,
            })
        })
    } else {
        res.status(400).json('wrong credentials')
    }
})

app.get('/profile', (req, res) => {
    const { token } = req.cookies
    if (token) {
        jwt.verify(token, secret, {}, (err, info) => {
            if (err) {
                console.log('')
            }
            res.json(info)
        })
    } else {
        return null
    }

})

app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok')
})

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    const { originalname, path } = req.file
    const parts = originalname.split('.')
    const ext = parts[parts.length - 1]
    const newPath = path + '.' + ext
    fs.renameSync(path, newPath)

    const { token } = req.cookies
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) {
            console.log(err)
        }

        const { title, summary, content, category } = req.body

        const postDoc = await Post.create({
            title,
            summary,
            content,
            category,
            cover: newPath,
            author: info.id
        })

        // res.json(info)
        res.json(postDoc)

    })
})

app.get('/post', async (req, res) => {
    // const posts = await Post.find()
    //  res.json(posts)
    // informal res.json(await Post.find())
    res.json(await Post.find()
        .populate('author', ['username'])
        .sort({ createdAt: -1 })
        .limit(20)
    )
})

app.get('/post/:id', async (req, res) => {
    const { id } = req.params
    const postDoc = await Post.findById(id)
        .populate('author', ['username'])
    res.json(postDoc)
})

app.listen(4000, () => {
    console.log('listening to port 4000')
})

