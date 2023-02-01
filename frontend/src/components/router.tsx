import { Routes, Route, useNavigate } from "react-router-dom";
import BookList from "../pages/bookList";
import GenreList from "../pages/genreList";
import LoginPage from "../pages/loginPage";
import NavigationBar from "./navbar";
import { Outlet } from "react-router";

const WithNavBar = () => {
  return (
    <>
      <NavigationBar />
      <Outlet />
    </>
  );
};

const WithoutNavBar = () => {
  return (
    <>
      <Outlet />
    </>
  );
};

// Don't want the navigation bar on the login page
export default function Router() {
  return (
    <Routes>
      <Route element={<WithoutNavBar />}>
        <Route path="/" element={<LoginPage navigator={useNavigate()} />} />
      </Route>
      <Route element={<WithNavBar />}>
        <Route path="books" element={<BookList />} />
        <Route path="genres" element={<GenreList />} />
      </Route>
    </Routes>
  );
}
