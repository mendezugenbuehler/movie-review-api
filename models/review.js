const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        text: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
    {
        reviewTitle: {
            type: String,
            required: true,
        },
        movie: {
            type: String,
            required: true,
        },
        director: {
            type: String,
            required: true,
        },
        genre: {
            type: String,
            required: true,
            enum: ['Action', 'Animation', 'Comedy', 'Drama', 'Fantasy', 'Mystery', 'Science Fiction'],
        },
        rating: {
            type: String,
            required: true,
            enum: ['⭐️', '⭐️⭐️', '⭐️⭐️⭐️', '⭐️⭐️⭐️⭐️', '⭐️⭐️⭐️⭐️⭐️'],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        comments: [commentSchema], // Embedded array of comments
    },
    { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;