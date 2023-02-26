import { Routes, Route } from "react-router-dom";
import { Outlet } from "react-router";
import NavigationBar from "./Navbar";
import BookList from "../pages/list/BookList";
import GenreList from "../pages/list/GenreList";
import LoginPage from "../pages/auth/LoginPage";
import VendorList from "../pages/list/VendorList";
import SalesReconciliationList from "../pages/list/SRList";
import ModifyBook from "../pages/detail/BookDetail";
import ModifySR from "../pages/detail/SRDetail";
import ModifyPO from "../pages/detail/PODetail";
import BookAdd from "../pages/add/BookAdd";
import GenreAdd from "../pages/add/GenreAdd";
import GenreDetail from "../pages/detail/GenreDetail";
import VendorDetail from "../pages/detail/VendorDetail";
import PurchaseOrderList from "../pages/list/POList";
import PasswordChangePage from "../pages/auth/PasswordChange";
import SalesReportPage from "../pages/list/SalesReport";
import GoToLoginPageIfNotLoggedIn from "../util/AuthCheck";
import ShelfCalculator from "../pages/ShelfCalculator";

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

export default function Router() {
  GoToLoginPageIfNotLoggedIn();

  return (
    <Routes>
      {/* No navigation bar on login page */}
      <Route element={<WithoutNavBar />}>
        <Route path="/" element={<LoginPage />} />
      </Route>
      <Route element={<WithNavBar />}>
        <Route path="books" element={<BookList />} />
        <Route path="genres" element={<GenreList />} />
        <Route path="purchase-orders" element={<PurchaseOrderList />} />
        <Route
          path="sales-reconciliations"
          element={<SalesReconciliationList />}
        />
        <Route path="vendors" element={<VendorList />} />
        <Route path="books/add" element={<BookAdd />} />
        <Route path="books/detail/:id" element={<ModifyBook />} />
        <Route path="books/shelf-calculator" element={<ShelfCalculator />} />
        <Route path="genres/add" element={<GenreAdd />} />
        <Route path="genres/detail/:id" element={<GenreDetail />} />
        <Route path="purchase-orders/add" element={<ModifyPO />} />
        <Route path="purchase-orders/detail/:id" element={<ModifyPO />} />
        <Route path="sales-reconciliations/add" element={<ModifySR />} />
        <Route path="sales-reconciliations/detail/:id" element={<ModifySR />} />
        <Route path="vendors/add" element={<VendorDetail />} />
        <Route path="vendors/detail/:id" element={<VendorDetail />} />
        <Route path="change-password" element={<PasswordChangePage />} />
        <Route path="sales-report" element={<SalesReportPage />} />
      </Route>
    </Routes>
  );
}
