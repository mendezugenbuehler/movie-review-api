const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    tmdbId: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    overview: String,
    posterPath: String,
    backdropPath: String,
    releaseDate: Date,
    voteAverage: Number,
    voteCount: Number,
    genres: [String],
    runtime: Number,
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema); 