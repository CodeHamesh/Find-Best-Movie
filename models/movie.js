const mongoose = require('mongoose');
const {Schema} = mongoose;
const Review = require('./review.js');
const movieSchema = new Schema({
    image:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    reviews:[{type: Schema.Types.ObjectId, ref:'Review'}],
    userinfo:{type: Schema.Types.ObjectId, ref: 'User'}
})

movieSchema.post('findOneAndDelete',async(data)=>{
     await Review.deleteMany({_id: {$in: data.reviews}})
})


const Movie = mongoose.model('Movie', movieSchema)

module.exports = Movie