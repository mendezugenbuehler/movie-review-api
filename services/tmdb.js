const axios = require('axios');

class TMDBService {
    constructor() {
        this.apiKey = process.env.TMDB_API_KEY;
        if (!this.apiKey) {
            console.error('TMDB API key is not set!');
        } else {
            console.log('TMDB API key is set:', this.apiKey.substring(0, 4) + '...');
        }
        this.baseURL = 'https://api.themoviedb.org/3';
        this.imageBaseURL = 'https://image.tmdb.org/t/p';
        this.cache = new Map();
        this.cacheTimeout = 1000 * 60 * 60; // 1 hour
    }

    getCacheKey(endpoint, params) {
        return `${endpoint}-${JSON.stringify(params)}`;
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    async searchMovies(query, page = 1) {
        try {
            const cacheKey = this.getCacheKey('search', { query, page });
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const response = await axios.get(`${this.baseURL}/search/movie`, {
                params: {
                    api_key: this.apiKey,
                    query,
                    page
                }
            });
            this.setCache(cacheKey, response.data);
            return response.data;
        } catch (error) {
            throw new Error(`Error searching movies: ${error.message}`);
        }
    }

    async getMovieDetails(movieId) {
        try {
            if (!this.apiKey) {
                throw new Error('TMDB API key is not set');
            }

            console.log('Fetching movie details from TMDB for ID:', movieId);
            const url = `${this.baseURL}/movie/${movieId}`;
            const params = {
                api_key: this.apiKey,
                append_to_response: 'credits,videos,similar',
                language: 'en-US'
            };

            console.log('TMDB API URL:', url);
            console.log('TMDB API Params:', { ...params, api_key: '***' });

            const response = await axios.get(url, { params });

            console.log('TMDB Full Response:', {
                id: response.data.id,
                title: response.data.title,
                hasCredits: !!response.data.credits,
                credits: response.data.credits,
                genres: response.data.genres,
                crew: response.data.credits?.crew,
                rawResponse: response.data
            });

            return response.data;
        } catch (error) {
            console.error('TMDB API Error:', error.message);
            if (error.response) {
                console.error('TMDB API Error Response:', error.response.data);
            }
            throw new Error(`Error fetching movie details: ${error.message}`);
        }
    }

    async getPopularMovies(page = 1) {
        try {
            const cacheKey = this.getCacheKey('popular', { page });
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const response = await axios.get(`${this.baseURL}/movie/popular`, {
                params: {
                    api_key: this.apiKey,
                    page
                }
            });
            this.setCache(cacheKey, response.data);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching popular movies: ${error.message}`);
        }
    }

    async getMovieRecommendations(movieId, page = 1) {
        try {
            const cacheKey = this.getCacheKey('recommendations', { movieId, page });
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const response = await axios.get(`${this.baseURL}/movie/${movieId}/recommendations`, {
                params: {
                    api_key: this.apiKey,
                    page
                }
            });
            this.setCache(cacheKey, response.data);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching movie recommendations: ${error.message}`);
        }
    }

    getImageUrl(path, size = 'w500') {
        if (!path) return null;
        return `${this.imageBaseURL}/${size}${path}`;
    }
}

module.exports = new TMDBService(); 