if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express   = require('express')
const app       = express()
const bcrypt    = require('bcrypt')
const flash     = require('express-flash')
const session   = require('express-session')

const passport  = require('passport')
const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    (email) => {
        return users.find(user => user.email === email)
    }
)

const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.get('/', checkAuthenticated, (req, res) =>{
    res.render('index.ejs', {name:'Anil'})
})

app.get('/login', checkNotAuthenticated, (req, res)=>{
    res.render('login.ejs')
})

app.get('/register',checkNotAuthenticated, (req, res)=>{
    res.render('register.ejs')
})

app.post('/login',checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))
app.post('/register', checkNotAuthenticated, async (req, res)=>{
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    console.log(hashedPassword)
    try {
        users.push({
            id:Date.now.toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch (error) {
        console.log(error)
        res.redirect('/register')
    }
    console.log(users)
})

app.delete('/logout', (req, res) => {
    req.logout()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated){
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated){
       return res.redirect('/')
    }
    next()
}

app.listen(5000, function(){
    console.log(`Server is running on port 5000`)
})