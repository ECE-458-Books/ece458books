import { Routes, Route, useNavigate } from "react-router-dom";
import { Outlet } from "react-router";
import NavigationBar from "./Navbar";
import BookList from "../pages/list/BookList";
import GenreList from "../pages/list/GenreList";
import LoginPage from "../pages/LoginPage";
import VendorList from "../pages/list/VendorList";
import SalesReconciliationList from "../pages/list/SRList";
import ModifyBook from "../pages/detail/ModfiyBook";
import ModifyGenre from "../pages/detail/GenreDetail";
import ModifySR from "../pages/detail/SRDetail";
import ModifyPO from "../pages/detail/PODetail";
import ModifyVendor from "../pages/detail/VendorDetail";

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
        <Route path="purchase-orders" element={<GenreList />} />
        <Route
          path="sales-reconciliations"
          element={<SalesReconciliationList />}
        />
        <Route path="vendors" element={<VendorList />} />
        <Route path="books/add" element={<ModifyBook />} />
        <Route path="genres/add" element={<ModifyGenre />} />
        <Route path="purchase-orders/add" element={<ModifyPO />} />
        <Route path="sales-reconciliations/add" element={<ModifySR />} />
        <Route path="vendors/add" element={<ModifyVendor />} />
      </Route>
    </Routes>
  );
}
