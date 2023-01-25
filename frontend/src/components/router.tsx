import { Routes, Route } from "react-router-dom";
import BookList from "../pages/bookList";
import GenreList from "../pages/genreList";

export default function BaseTemplate() {
  return (
    <Routes>
      <Route path="/" element={<BookList />} />
      <Route path="books" element={<BookList />} />
      <Route path="genres" element={<GenreList />} />
    </Routes>
  );
}
