const express = require('express');
const app = express()
const movieRouter = express.Router({mergeParams:true})
const ExpressError = require('../ExpressError.js')
const Movie = require('../models/movie.js');
const Review = require('../models/review.js');
const {movieSchema} = require('../joiSchema');
app.use((req,res,next)=>{
   res.locals.userinfo = req.user
   next()
})

let schemaMiddelware = (req,res,next)=>{
    let {error} = movieSchema.validate(req.body)
    if (error) {
        throw new ExpressError(401, error.message) 
    } 
    next()
    
 }

 let userLogin = (req,res,next)=>{
   req.session.saveUrl = req.originalUrl;
   res.locals.saveUrl = req.session.saveUrl;
   console.log(req.session);
   console.log(res.locals.saveUrl);
   if (!req.isAuthenticated()) {
      return  res.redirect('/login')
   }
   next()
}
    
    movieRouter.get('/',async(req,res,next)=>{
       try {
        let allMovie =  await Movie.find()
        res.render('home.ejs', {title: 'home', allMovie})
       } catch (err) {
        next(err)
       }
    })
    
    movieRouter.get('/add',userLogin,(req,res)=>{
      console.log("login ho jane ke baad req.session => ",req.session);
        res.render('movieadd.ejs',{title: 'addmovie'});

    })
    
    movieRouter.post('/',schemaMiddelware,async(req,res,next)=>{
     try{
        
        let {image , title} = req.body
        let addmovie =   await new Movie({
           image:image,
           title:title,
           userinfo: req.user._id
          })
          await addmovie.save()
       return    res.redirect('/movie')
     }catch(err){
        next(err)
     }
    })
    
    
    movieRouter.get('/:id/overview',userLogin,async(req,res,next)=>{
       try {
        let {id} = req.params
        let findMovie = await Movie.findById(id).populate({path:'reviews',populate:{path:'author'}}).populate('userinfo')
        if (!findMovie) {
         throw new ExpressError(404, 'Movie not found');
     }
        res.render('overview.ejs',{findMovie, title:'overview'})
       } catch (err) {
          next(err)
       }
    })
    
    movieRouter.get('/:id/edit',userLogin,async(req,res,next)=>{
      try {
        let findMovie =  await Movie.findById(req.params.id)
        res.render('edit.ejs',{title: 'edit', findMovie})
      } catch (err) {
        next(err)
      }
    })
    
    movieRouter.patch('/:id/edit',async(req,res,next)=>{
      try {
        let {id} = req.params;
        let {image,title} = req.body;
    let updatedMovie =    await Movie.findByIdAndUpdate(id,{
         image:image,
         title:title
        })
       return res.redirect(`/${id}/overview`)
      } catch (err) {
        next(err)
      }
    })
    
    
    movieRouter.delete('/:id/delete',userLogin,async(req,res,next)=>{
             try {
                let {id} = req.params
             await Movie.findByIdAndDelete(id)
          return  res.redirect(`/movie`)
             } catch (err) {
                next(err)
             }
    })
    
module.exports = {movieRouter}
