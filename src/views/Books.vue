<template>
  <div class="books-page">
    <header>
      <h1>Поиск книг (Open Library)</h1>
      <div class="search-bar">
        <input
          v-model="q"
          @keyup.enter="searchBooks"
          placeholder="Введите название или авторa"
        />
        <button @click="searchBooks">Найти</button>
      </div>
    </header>

    <div v-if="loading">Загрузка...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="books.length > 0" class="books-grid">
      <div v-for="book in books" :key="book.key" class="book-card">
        <img :src="coverUrl(book.cover_i)" alt="" v-if="book.cover_i" />
        <h3>{{ book.title }}</h3>
        <p>{{ (book.author_name || []).join(", ") }}</p>
        <p>{{ book.first_publish_year }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BooksPage",
  data() {
    return {
      q: "",
      books: [],
      loading: false,
      error: null,
    };
  },
  methods: {
    async searchBooks() {
      if (!this.q) {
        return;
      }
      this.loading = true;
      this.error = null;
      this.books = [];
      try {
        const res = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(this.q)}`
        );
        const data = await res.json();
        this.books = data.docs.slice(0, 20); // взять первые 20
      } catch (err) {
        this.error = "Ошибка загрузки данных";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.books-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.book-card {
  width: 180px;
  text-align: center;
}
.book-card img {
  width: 100%;
  height: auto;
}
</style>
