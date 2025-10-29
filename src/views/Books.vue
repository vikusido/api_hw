<template>
  <div class="books-page">
    <div class="books-container">
      <header class="books-header">
        <h1>📚 Поиск книг</h1>
        <p class="subtitle">Найдите информацию про любую книгу</p>
      </header>

      <div class="search-box">
        <input
          v-model="query"
          type="text"
          placeholder="Введите название книги или автора"
          @keyup.enter="searchBooks"
        />
        <select v-model="searchType">
          <option value="title">По названию</option>
          <option value="author">По автору</option>
        </select>
        <button @click="searchBooks" :disabled="!query || loading">
          Поиск
        </button>
      </div>

      <div v-if="loading" class="loading">Загрузка...</div>
      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="books.length" class="books-list">
        <div v-for="book in books" :key="book.id" class="book-card">
          <img v-if="book.cover" :src="book.cover" alt="Обложка книги" />
          <div v-else class="placeholder">Нет обложки</div>
          <h3>{{ book.title }}</h3>
          <p>Автор: {{ book.author }}</p>
          <p>Год: {{ book.year }}</p>
        </div>
      </div>

      <div v-else-if="!loading && !error" class="no-results">
        Ничего не найдено
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { searchBooks as fetchBooks } from "../services/booksAPI.js";

const query = ref("");
const searchType = ref("title");
const books = ref([]);
const loading = ref(false);
const error = ref("");

const searchBooks = async () => {
  if (!query.value.trim()) return;

  loading.value = true;
  error.value = "";
  books.value = [];

  try {
    const results = await fetchBooks(query.value, searchType.value, 20);
    books.value = results;
    if (results.length === 0) error.value = "Ничего не найдено";
  } catch (err) {
    error.value = "Ошибка при загрузке данных";
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.books-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.books-container {
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  min-height: 400px;
}

.books-header {
  text-align: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

input {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
}

select {
  width: 180px;
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
}

button {
  padding: 10px 20px;
  background: #db9af9ff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.books-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.book-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 10px;
  text-align: center;
  backdrop-filter: blur(8px);
}

.book-card img {
  width: 100px;
  height: 150px;
  object-fit: cover;
  margin-bottom: 10px;
}

.placeholder {
  width: 100px;
  height: 150px;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  font-size: 12px;
  color: #555;
}

.loading,
.error,
.no-results {
  text-align: center;
  margin: 20px 0;
  font-weight: bold;
}
</style>
