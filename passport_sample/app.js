const express = require('express')
const passport =require('passport')
const LocalStrategy = require('passport-local').Strategy
const bodyParser = require('body-parser')
const knex = require('knex')(require('./knexfile.js'))
const bcrypt = require('bcrypt')
const session = require('express-session')
const path = require('path')

const app = express()
app.set('view engine','ejs')
app.set('views', path.join(__dirname,'views'))

app.use(bodyParser.urlencoded({extended:true}))
app.use(session({secret:'./config',resave:false,saveUninitialized:true}))
app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy((username, password, done)=>{
    knex('users').where({username}).first()
    .then(user=>{
        if(!user){
            return done(null,false,{message:'Incorrect username.'})
        }
        bcrypt.compare(password,user.password,(err,isMatch)=>{
            if(err)return done(err)
                if(!isMatch){
                    return done(null,false,{message:'Incorrect passowrd.'})
                }
                return done(null,user)
        })
    })
    .catch(err=>done(err))
}))

passport.serializeUser((user,done)=>{
    done(null.user.id)
})

passport.deserializeUser((id,done)=>{
    knex('users').where({id}).first()
.then(user=>{
    done(null,user)
})
.catch(err=>done(err))
})

app.get('/',(req,res)=>{
    res.render('home')
})

app.get('/register',(req,res)=>{
    res.render('register')
})

app.get('/login',(req,res)=>{
    res.render('login')
})

app.post('/register',(req,res)=>{
    const{username,password} = req.bodyParserbcrypt.hash(password,10,(err,hashedPassword)=>{
        if(err){
            return res.status(500).send('Error hashing password.')
        }
        knex('users').insert({username,passowrd: hashedPassword})
        .then(()=>res.redirect('/login'))
        .catch(err=>{
            if(err.code==='23505'){
                return res.status(400).send('Username already exists.')
            }
            res.status(500).send('Error registering new user.')
        })
    })
})

app.post('/login',passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash:true
}))

// const Port=process.env.PORT || 3000;
app.list(3000,()=>{
    console.log(`Server is running on localhost:3000`)
})