const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdb');
const Movie = require('../models/movie');

// Get popular movies - this needs to be before the /:id route
router.get('/popular', async (req, res) => {
    try {
        const { page } = req.query;
        const results = await tmdbService.getPopularMovies(page);
        res.json(results);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// Search movies
router.get('/search', async (req, res) => {
    try {
        const { query, page } = req.query;
        const results = await tmdbService.searchMovies(query, page);
        res.json(results);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// Get movie recommendations
router.get('/:id/recommendations', async (req, res) => {
    try {
        const movieId = req.params.id;
        const { page } = req.query;
        const results = await tmdbService.getMovieRecommendations(movieId, page);
        res.json(results);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// Get movie details - this should be last since it has a parameter
router.get('/:id', async (req, res) => {
    try {
        const movieId = req.params.id;

        // First check if we have the movie in our database
        let movie = await Movie.findOne({ tmdbId: movieId });

        if (!movie) {
            // If not in database, fetch from TMDB and save
            const tmdbMovie = await tmdbService.getMovieDetails(movieId);

            movie = await Movie.create({
                tmdbId: tmdbMovie.id,
                title: tmdbMovie.title,
                overview: tmdbMovie.overview,
                posterPath: tmdbMovie.poster_path,
                backdropPath: tmdbMovie.backdrop_path,
                releaseDate: tmdbMovie.release_date,
                voteAverage: tmdbMovie.vote_average,
                voteCount: tmdbMovie.vote_count,
                genres: tmdbMovie.genres.map(genre => genre.name),
                runtime: tmdbMovie.runtime
            });
        }

        res.json(movie);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

module.exports = router; 