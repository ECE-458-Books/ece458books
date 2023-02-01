import { Routes, Route, useNavigate } from "react-router-dom";
import { Outlet } from "react-router";
import NavigationBar from "./Navbar";
import BookList from "../pages/BookList";
import GenreList from "../pages/GenreList";
import LoginPage from "../pages/LoginPage";
import VendorList from "../pages/VendorList";
import SalesReconciliationList from "../pages/SalesReconciliationList";
import ModifyBook from "../pages/ModfiyBook";
import ModifyGenre from "../pages/ModifyGenre";
import ModifySR from "../pages/ModifySR";
import ModifyPO from "../pages/ModifyPO";
import ModifyVendor from "../pages/ModifyVendor";

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
