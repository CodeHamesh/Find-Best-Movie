const express = require('express');
const app = express()
const reviewRouter = express.Router({mergeParams:true})
const ExpressError = require('../ExpressError.js')
const Movie = require('../models/movie.js');
const Review = require('../models/review.js');
const {movieSchema,reviewSchema} = require('../joiSchema');
const { model } = require('mongoose');

app.use((req,res,next)=>{
  res.locals.userinfo = req.user
  next()
})

let userLogin = (req,res,next)=>{
    if (!req.isAuthenticated()) {
       return  res.redirect('/login')
    }
    next()
 }

let schemaMiddelware = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body)
    if (error) {
        throw new ExpressError(401, error.message) 
    } 
    next()
    
 }



reviewRouter.post('/:id',schemaMiddelware,userLogin ,async (req, res, next) => {
    try {
        const { id } = req.params
        let addReview = await new Review({
            userreview: req.body.review,
            author: req.user
        })
        let findMovie = await Movie.findById(id)
        findMovie.reviews.push(addReview)

        await addReview.save() 
        await findMovie.save()

      return  res.redirect(`/movie/${id}/overview`)
    } catch (err) {
        next(err)
    }

})

reviewRouter.delete('/:id/:reviewId',userLogin,async(req,res,next)=>{
  try {
    let {id,reviewId} = req.params
   let deleteReview =  await Review.findOneAndDelete(reviewId)
   console.log(deleteReview);
   let updateMovie =  await Movie.findByIdAndUpdate(id,{$pull:{reviews: reviewId}})
   console.log("updated movie =>",updateMovie);
  return  res.redirect(`/movie/${id}/overview`)
  } catch (err) {
    next(err)
  }
})

module.exports = reviewRouter