const express = require('express');
const app = express();
const dotEnv = require('dotenv').config()
const mongoose = require('mongoose');
let dbUrl = process.env.MONGO_URL
mongoose.connect(dbUrl).then((result) => console.log('db connect')).catch((err) => console.log(err));
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./ExpressError.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
//Express-middelwares
app.set('views', path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')
app.engine('ejs', ejsMate)
app.use(methodOverride('_method'))

// Movie model
// const Movie = require('./models/movie.js');
// const Review = require('./models/review.js');
// const { movieSchema } = require('./joiSchema.js');

const { movieRouter } = require('./router/movie.js');
const reviewRouter = require('./router/review.js');
const passport = require('passport');
const localPassport = require('passport-local')
const User = require('./models/user.js');
let secretUrl = process.env.secret
app.use(session({
    
    secret:secretUrl,
    resave:false,
    store: MongoStore.create({
        mongoUrl: dbUrl,
        crypto:{
            secret: secretUrl
        },
        touchAfter: 24 * 3600
    })     ,
    saveUninitialized: true,
    cookie:{maxAge:7 * 24 * 60 * 60 * 1000,httpOnly:true}
}))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localPassport(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
    res.locals.userinfo = req.user
    next()
})
// app routes

app.use('/movie', movieRouter)
app.use('/review', reviewRouter)

app.get('/signup',(req,res)=>{
    res.render('signup.ejs',{title: 'signup'})
})

app.post('/signup',async(req,res)=>{
    let {email,username,password} = req.body
   let newUser = await User({
      email:email,
      username:username
   })
  await User.register(newUser, password)
  return res.redirect('/movie')
})

app.get('/login',(req,res)=>{
    res.render('login.ejs',{title: 'login'})
})

app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    const redirectUrl = res.locals.saveUrl || '/movie';
    delete req.session.saveUrl;
    res.redirect(redirectUrl);
});


app.get('/logout',(req,res)=>{
    req.logOut((err)=>{
        if (err) {
            throw new ExpressError(402, 'Some Error')
        }
    })
    
 return res.redirect('/movie')
})


app.use((req, res, next) => {
    res.status(404).render('err.ejs', { title: 'Error', message: '404 Page Not Found' })
})
app.use((err, req, res, next) => {
    console.dir(err);
    if (err.name === 'ValidationError') {
        let { status = 500, message = 'Something went wrong' } = err;
        res.status(status).render('err.ejs', { title: 'Error', message: err.message })
    } else {
        let { status = 500, message = 'Something went wrong' } = err;
        res.status(status).render('err.ejs', { title: 'Error', message });
        next(err);
    }

});

app.listen(3000)