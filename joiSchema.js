const Joi = require('joi')
const movieSchema = Joi.object({
    image: Joi.string().required(),
    title: Joi.string().required()
})


const reviewSchema = Joi.object({
    review: Joi.string().required(),
})

module.exports = {movieSchema,reviewSchema}

