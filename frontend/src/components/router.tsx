import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavigationBar from "./navbar";
import BookList from "../pages/bookList"
import GenreList from "../pages/genreList"

export default function BaseTemplate() {
  return (
    <Router>
      <NavigationBar></NavigationBar>
      <Routes>
        <Route path="/" element={<BookList />} />
        <Route path="books" element={<BookList />} />
        <Route path="genres" element={<GenreList />} />
      </Routes>
    </Router>
  );
}