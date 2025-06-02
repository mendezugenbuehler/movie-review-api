const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdb');
const Movie = require('../models/movie');

router.get('/popular', async (req, res) => {
    try {
        const { page } = req.query;
        const results = await tmdbService.getPopularMovies(page);
        res.json(results);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

router.get('/search', async (req, res) => {
    try {
        const { query, page } = req.query;
        const results = await tmdbService.searchMovies(query, page);
        res.json(results);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

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

router.get('/:id', async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        const movieId = req.params.id;
        const tmdbMovie = await tmdbService.getMovieDetails(movieId);

        console.log('TMDB Movie Data:', {
            id: tmdbMovie.id,
            title: tmdbMovie.title
            credits: {
                crew: tmdbMovie.credits?.crew,
                hasCrew: !!tmdbMovie.credits?.crew
            },
            genres: tmdbMovie.genres,
            rawCredits: tmdbMovie.credits,
            rawGenres: tmdbMovie.genres
        });

        const directors = tmdbMovie.credits?.crew?.filter(
            person => person.job === 'Director'
        ) || [];

        console.log('Raw crew data:', tmdbMovie.credits?.crew);
        console.log('Filtered directors:', directors);

        const director = directors.length > 0
            ? directors.map(d => d.name).join(' & ')
            : 'Unknown';

        console.log('Found Directors:', directors, 'Final director string:', director);

        const firstGenre = tmdbMovie.genres?.[0]?.name || 'Action';
        console.log('First Genre:', firstGenre, 'All genres:', tmdbMovie.genres);
  // Find existing movie or create new one
        let movie = await Movie.findOne({ tmdbId: movieId });

        if (movie) {
            movie = await Movie.findOneAndUpdate(
                { tmdbId: movieId },
                {
                    title: tmdbMovie.title,
                    overview: tmdbMovie.overview,
                    posterPath: tmdbMovie.poster_path,
                    backdropPath: tmdbMovie.backdrop_path,
                    releaseDate: tmdbMovie.release_date,
                    voteAverage: tmdbMovie.vote_average,
                    voteCount: tmdbMovie.vote_count,
                    genres: tmdbMovie.genres.map(genre => genre.name),
                    runtime: tmdbMovie.runtime,
                    director: director,
                    credits: tmdbMovie.credits
                },
                { new: true }
            );
        } else {
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
                runtime: tmdbMovie.runtime,
                director: director,
                credits: tmdbMovie.credits
            });
        }

        console.log('Saved Movie:', {
            id: movie.tmdbId,
            title: movie.title,
            director: movie.director,
            genres: movie.genres
        });

        res.json(movie);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

router.get('/test/tmdb/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        console.log('Testing TMDB API connection for movie ID:', movieId);

        const tmdbMovie = await tmdbService.getMovieDetails(movieId);

        console.log('TMDB Test Response:', {
            id: tmdbMovie.id,
            title: tmdbMovie.title,
            hasCredits: !!tmdbMovie.credits,
            credits: tmdbMovie.credits,
            genres: tmdbMovie.genres
        });

        res.json({
            success: true,
            data: tmdbMovie
        });
    } catch (err) {
        console.error('TMDB Test Error:', err);
        res.status(500).json({
            success: false,
            error: err.message,
            stack: err.stack
        });
    }
});

module.exports = router; 