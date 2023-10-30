const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require("path")
const User = require('./user')

const app = express();
const DB_URL = 'mongodb://localhost:27017/online_food_delivery'
mongoose.connect(DB_URL)
    .then((result) => { console.log('DB connected') })
    .catch((err) => { console.log('error: ', err) })

app.use(express.urlencoded({ extended: 'false' }))
app.use(express.json())
app.set('view engine', 'hbs')

const publicDir = path.join(__dirname, './public')
app.use(express.static(publicDir))

app.get("/dashboard", (req, res) => {
    return res.render("index")
})
app.get("/register", (req, res) => {
    return res.render("registration")
})

app.get("/login", (req, res) => {
    return res.render("login")
})

app.post("/register", async function (req, res) {
    try {
        const { name, email, password } = req.body; 
        const oldUser = await User.findOne({ email: email })
        if (oldUser) {
            return res.render('registration', {
                message: 'This email is already in use'
            })
        }
        let hashedPassword = await bcrypt.hash(password, 8)
        const user = await User.create({ name, email, password: hashedPassword });

        return res.render('registration', {
            message: 'User registered!'
        })
    } catch (error) {
        return res.json({ error: error.message });
    }
})
app.post("/login", async function (req, res) {
    try {
        const { email, password } = req.body; 
        const oldUser = await User.findOne({ email: email })
        if (!oldUser) {
            return res.render('login', {
                message: 'Wrong Credentials'
            })
        }
        let isValid = await bcrypt.compare(password, oldUser.password)
        if (!isValid) {
            return res.render('login', {
                message: 'Wrong Credentials',
            })
        }
        return res.render('login', {
            message: 'User logged in!'
        })
    } catch (error) {
        return res.json({ error: error.message });
    }
})

app.listen(5000, () => {
    console.log('listening on port 5000')
})