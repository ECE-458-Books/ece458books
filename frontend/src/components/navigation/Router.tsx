import { Routes, Route } from "react-router-dom";
import { Outlet } from "react-router";
import NavigationBar from "./Navbar";
import BookList from "../../pages/books/BookList";
import GenreList from "../../pages/genres/GenreList";
import LoginPage from "../../pages/auth/LoginPage";
import VendorList from "../../pages/vendors/VendorList";
import SalesReconciliationList from "../../pages/sales/SRList";
import ModifyBook from "../../pages/books/BookDetail";
import ModifySR from "../../pages/sales/SRDetail";
import ModifyPO from "../../pages/purchases/PODetail";
import ModifyBB from "../../pages/buybacks/BBDetail";
import BookAdd from "../../pages/books/BookAdd";
import GenreAdd from "../../pages/genres/GenreAdd";
import GenreDetail from "../../pages/genres/GenreDetail";
import VendorDetail from "../../pages/vendors/VendorDetail";
import PurchaseOrderList from "../../pages/purchases/POList";
import PasswordChangePage from "../../pages/auth/PasswordChange";
import SalesReportPage from "../../pages/sales/SalesReport";
import BuyBackList from "../../pages/buybacks/BuyBackList";
import GoToLoginPageIfNotLoggedIn from "../../util/AuthCheck";
import ShelfCalculator from "../../pages/storeplanner/ShelfCalculator";
import VendorAdd from "../../pages/vendors/VendorAdd";
import UserAdd from "../../pages/users/UserAdd";
import UserList from "../../pages/users/UserList";

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
        <Route path="book-buybacks" element={<BuyBackList />} />
        <Route path="books/add" element={<BookAdd />} />
        <Route path="books/detail/:id" element={<ModifyBook />} />
        <Route path="books/shelf-calculator" element={<ShelfCalculator />} />
        <Route path="genres/add" element={<GenreAdd />} />
        <Route path="genres/detail/:id" element={<GenreDetail />} />
        <Route path="purchase-orders/add" element={<ModifyPO />} />
        <Route path="purchase-orders/detail/:id" element={<ModifyPO />} />
        <Route path="sales-reconciliations/add" element={<ModifySR />} />
        <Route path="sales-reconciliations/detail/:id" element={<ModifySR />} />
        <Route path="vendors/add" element={<VendorAdd />} />
        <Route path="book-buybacks/add" element={<ModifyBB />} />
        <Route path="book-buybacks/detail/:id" element={<ModifyBB />} />
        <Route path="vendors/detail/:id" element={<VendorDetail />} />
        <Route path="change-password" element={<PasswordChangePage />} />
        <Route path="sales-report" element={<SalesReportPage />} />
        <Route path="users" element={<UserList />} />
        <Route path="users/add" element={<UserAdd />} />
        <Route path="users/detail/:id" element={<UserAdd />} />
      </Route>
    </Routes>
  );
}
