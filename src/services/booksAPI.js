// src/services/booksAPI.js

export const booksAPI = {
  async search(query, limit = 20) {
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    return (data.docs || []).slice(0, limit).map((book) => ({
      key: book.key,
      title: book.title,
      authors: book.author_name || [],
      cover: book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : "",
      year: book.first_publish_year,
      link: `https://openlibrary.org${book.key}`,
    }));
  },
};
