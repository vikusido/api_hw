<template>
  <div class="movies-page">
    <div class="movies-container">
      <header class="movies-header">
        <h1>🎬 Поиск фильмов</h1>
        <p class="subtitle">Найдите информацию о любом фильме или сериале</p>
      </header>

      <!-- Поиск и фильтры -->
      <div class="search-section">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            @keyup.enter="searchMovies"
            placeholder="Введите название фильма..."
            class="search-input"
          >
          <button @click="searchMovies" class="search-btn" :disabled="loading">
            {{ loading ? 'Поиск...' : 'Найти' }}
          </button>
        </div>

        <div class="filters">
          <select v-model="searchType" class="type-filter">
            <option value="">Все</option>
            <option value="movie">Фильмы</option>
            <option value="series">Сериалы</option>
          </select>
          
          <button @click="clearSearch" class="clear-btn">
            Очистить
          </button>
        </div>
      </div>

      <!-- Состояния загрузки и ошибок -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Ищем фильмы...</p>
      </div>

      <div v-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="clearError" class="retry-btn">Попробовать снова</button>
      </div>
      <!-- Результаты поиска -->
      <div v-if="!loading && !error" class="movies-content">
        <div v-if="movies.length === 0 && searchQuery" class="no-results">
          <div class="no-results-content">
            <h3>Фильмы не найдены</h3>
            <p>Попробуйте изменить запрос или проверить написание</p>
          </div>
        </div>

        <div v-else-if="movies.length > 0" class="results-section">
          <div class="results-header">
            <h3>Найдено фильмов: {{ movies.length }}</h3>
            <div class="pagination" v-if="totalResults > 10">
              <button @click="prevPage" :disabled="currentPage === 1">← Назад</button>
              <span>Страница {{ currentPage }} из {{ Math.ceil(totalResults / 10) }}</span>
              <button @click="nextPage" :disabled="currentPage * 10 >= totalResults">Вперед →</button>
            </div>
          </div>

          <div class="movies-grid">
            <div 
              v-for="movie in movies" 
              :key="movie.id"
              class="movie-card"
              @click="showMovieDetails(movie)"
            >
              <div class="movie-poster">
                <img 
                  :src="movie.poster" 
                  :alt="movie.title"
                  @error="handleImageError"
                >
                <div class="movie-year">{{ movie.year }}</div>
              </div>
              
              <div class="movie-info">
                <h3 class="movie-title">{{ movie.title }}</h3>
                <p class="movie-type">{{ getTypeName(movie.type) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="welcome-message">
          <div class="welcome-content">
            <h3>Добро пожаловать в поиск фильмов!</h3>
            <p>Введите название фильма или сериала в поисковую строку выше</p>
          </div>
        </div>
      </div>

      <!-- Модальное окно с деталями фильма -->
      <div v-if="selectedMovie" class="modal-overlay" @click="selectedMovie = null">
        <div class="modal-content" @click.stop>
          <button class="close-btn" @click="selectedMovie = null">×</button>
          
          <div v-if="movieDetailsLoading" class="loading-details">
            <div class="spinner"></div>
            <p>Загружаем информацию...</p>
          </div>
          
          <div v-else-if="movieDetails" class="movie-details">
            <div class="details-header">
              <img 
                :src="movieDetails.poster" 
                :alt="movieDetails.title"
                class="detail-poster"
                @error="handleImageError"
              >
              <div class="details-main">
                <h2>{{ movieDetails.title }} ({{ movieDetails.year }})</h2>
                <div class="details-meta">
                  <span class="rating" v-if="movieDetails.imdbRating">
                    ⭐ {{ movieDetails.imdbRating }}/10
                  </span>
                  <span class="runtime">{{ movieDetails.runtime }}</span>
                  <span class="rated">{{ movieDetails.rated }}</span>
                </div>
                <p class="genre">{{ movieDetails.genre }}</p>
                <p class="plot">{{ movieDetails.plot }}</p>
              </div>
            </div>

            <div class="details-info">
              <div class="info-grid">
                <div class="info-item">
                  <strong>Режиссер:</strong>
                  <span>{{ movieDetails.director }}</span>
                </div>
                <div class="info-item">
                  <strong>Актеры:</strong>
                  <span>{{ movieDetails.actors }}</span>
                </div>
                <div class="info-item">
                  <strong>Страна:</strong>
                  <span>{{ movieDetails.country }}</span>
                </div>
                <div class="info-item">
                  <strong>Язык:</strong>
                  <span>{{ movieDetails.language }}</span>
                </div>
                <div class="info-item">
                  <strong>Бюджет:</strong>
                  <span>{{ formatBoxOffice(movieDetails.boxOffice) }}</span>
                </div>
                <div class="info-item">
                  <strong>Награды:</strong>
                  <span>{{ movieDetails.awards }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { movieAPI, formatBoxOffice } from '../services/movieAPI'

export default {
  name: 'Movies',
  data() {
    return {
      searchQuery: '',
      searchType: '',
      movies: [],
      selectedMovie: null,
      movieDetails: null,
      loading: false,
      movieDetailsLoading: false,
      error: '',
      currentPage: 1,
      totalResults: 0
    }
  },
  methods: {
    async searchMovies() {
      if (!this.searchQuery.trim()) return
      
      this.loading = true
      this.error = ''
      this.movies = []
      
      try {
        const results = await movieAPI.searchMovies(this.searchQuery, this.currentPage)
        this.movies = results
        
        // Сохраняем в историю поиска
        this.saveToSearchHistory(this.searchQuery)
        
      } catch (err) {
        this.error = err.message
        this.movies = []
      } finally {
        this.loading = false
      }
    },
    
    async showMovieDetails(movie) {
      this.selectedMovie = movie
      this.movieDetailsLoading = true
      this.movieDetails = null
      
      try {
        this.movieDetails = await movieAPI.getMovieDetails(movie.id)
      } catch (err) {
        console.error('Error loading movie details:', err)
      } finally {
        this.movieDetailsLoading = false
      }
    },
    
    async nextPage() {
      this.currentPage++
      await this.searchMovies()
    },
    
    async prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        await this.searchMovies()
      }
    },
    
    clearSearch() {
      this.searchQuery = ''
      this.movies = []
      this.error = ''
      this.currentPage = 1
    },
    
    clearError() {
      this.error = ''
    },
    
    setExample(example) {
      this.searchQuery = example
      this.searchMovies()
    },
    
    getTypeName(type) {
      const types = {
        movie: 'Фильм',
        series: 'Сериал'
      }
      return types[type] || type
    },
    
    handleImageError(event) {
      event.target.src = 'https://via.placeholder.com/300x450/dfe6e9/636e72?text=No+Poster'
    },
    
    saveToSearchHistory(query) {
      let history = JSON.parse(localStorage.getItem('movieSearchHistory') || '[]')
      history = history.filter(item => item !== query)
      history.unshift(query)
      history = history.slice(0, 10)
      localStorage.setItem('movieSearchHistory', JSON.stringify(history))
    },
    
    formatBoxOffice
  }
}
</script>

<style scoped>
.movies-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.movies-container {
  max-width: 1200px;
  margin: 0 auto;
}

.movies-header {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
}

.movies-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.welcome-message {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
}

.welcome-content {
  text-align: center;
  max-width: 500px;
  background: white;
  padding: 2rem 2rem;
  border-radius: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e5e9;
  backdrop-filter: blur(10px);
}

.welcome-content h3 {
 font-size: 1.8rem;
  color: #2d3436;
  margin-bottom: 1rem;
  font-weight: 600;
}

.welcome-content p {
  font-size: 1.1rem;
  color: #636e72;
  line-height: 1.6;
  margin-bottom: 1rem;
}
.results-header {
  color: white;
}
/* Стили поиска */
.search-section {
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-box {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.search-btn {
  padding: 1rem 1.5rem;
  background: #9b66eaff;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
}

.search-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.type-filter {
  padding: 0.5rem 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 5px;
  background: white;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background: #9b66eaff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* Сетка фильмов */
.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.movie-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.movie-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.movie-poster {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.movie-card:hover .movie-poster img {
  transform: scale(1.05);
}

.movie-year {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.movie-info {
  padding: 1rem;
}

.movie-title {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  line-height: 1.3;
  color: #2d3436;
}

.movie-type {
  color: #7f8c8d;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.no-results {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
}

.no-results-content {
  text-align: center;
  max-width: 500px;
  background: white;
  padding: 2rem 2rem;
  border-radius: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e5e9;
  backdrop-filter: blur(10px);
}

.no-results h3 {
  font-size: 1.8rem;
  color: #2d3436;
  margin-bottom: 1rem;
  font-weight: 600;
}

.no-results p {
  font-size: 1.1rem;
  color: #636e72;
  line-height: 1.6;
  margin-bottom: 1rem;
}


/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 15px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #7f8c8d;
  z-index: 1001;
}

.movie-details {
  padding: 2rem;
}

.details-header {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.detail-poster {
  width: 100%;
  border-radius: 10px;
}

.details-main h2 {
  margin-bottom: 1rem;
  color: #2d3436;
}

.details-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.rating {
  color: #f39c12;
  font-weight: bold;
}

.genre {
  font-style: italic;
  color: #7f8c8d;
  margin-bottom: 1rem;
}

.plot {
  line-height: 1.6;
  color: #2d3436;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item strong {
  color: #2d3436;
}

/* Адаптивность */
@media (max-width: 768px) {
  .details-header {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .search-box {
    flex-direction: column;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>