import { Routes, Route } from "react-router-dom";
import BookList from "../pages/bookList";
import GenreList from "../pages/genreList";
import LoginPage from "../pages/loginPage";
import { useNavigate } from "react-router-dom";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage navigator={useNavigate()} />} />
      <Route path="books" element={<BookList />} />
      <Route path="genres" element={<GenreList />} />
    </Routes>
  );
}
