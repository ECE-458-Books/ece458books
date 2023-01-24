import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./navbar";
import BookList from "../pages/bookList"
import GenreList from "../pages/genreList"

export default function BaseTemplate() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route index element={<BookList />} />
          <Route path="genres" element={<GenreList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}