const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const session = require('express-session')
require('dotenv').config()

let secret = process.env.SECRET 

const app = express()
app.use(express.json())
app.use(session({secret: secret}))

let User = require('./models/user')

let db = process.env.DB_NAME
let username = process.env.DB_USER
let password = process.env.DB_PASSWORD
let port = process.env.PORT

mongoose.connect('mongodb+srv://' + username + ':' + password + '@cluster0.jnw32.mongodb.net/' + db)


app.get("/", (req, res) => {
    res.send("<h1>Home Page</h1>");
})

app.post("/register", async (req, res) => {
    console.log(req.body.password)
    const user = await User.findOne({'username': req.body.username}).exec();
    console.log(user)
    if(user != null) {
        return res.json({'result': 'error', 'message': 'username is used'})
    }
    let saltRounds = 10
    await bcrypt.genSalt(saltRounds, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hashedPassword) => {
            User.create({
                username: req.body.username,
                password: hashedPassword 
            })
            res.json({'result': 'ok'})
        })
    })
})

app.post("/login", async (req, res) => {
    const user = await User.findOne({'username': req.body.username}).exec();
    bcrypt.compare(req.body.password, user.password, (err, result) => {
        console.log(result)
        if(result == true) {
            req.session.username = req.body.username
            return res.json({'result': 'ok'})
        }
        else {
            return res.json({'result': 'wrong password'})
        }
    })
    console.log(user.password)
})

app.get("/dashboard", (req, res) => {
    if(req.session.username) {
        res.json({'result': 'ok', 'content': 'dashboard'})
    }
    else {
        res.json({'result': 'error', 'content': 'none'})
    }
})

app.get("/logout", (req, res) => {
    req.session.destroy
    res.json({'result': 'ok', 'content': 'logged out'})
})


app.listen(port, () => {
    console.log("Server started on port " + port);
})