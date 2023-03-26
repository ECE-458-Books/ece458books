import { Routes, Route } from "react-router-dom";
import { Outlet } from "react-router";
import NavigationBar from "./Navbar";
import BookList from "../../pages/books/BookList";
import GenreList from "../../pages/genres/GenreList";
import VendorList from "../../pages/vendors/VendorList";
import SalesRecordList from "../../pages/sales/SRList";
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
import ShelfCalculator from "../../pages/casedesigner/ShelfCalculator";
import VendorAdd from "../../pages/vendors/VendorAdd";
import UserList from "../../pages/users/UserList";
import UserDetail from "../../pages/users/UserDetail";
import BookcaseList from "../../pages/casedesigner/BookcaseList";
import BookcaseDetail from "../../pages/casedesigner/detail/BookcaseDetail";
import { AccessType } from "../../util/auth/UserTypes";

interface RouterProps {
  onLogout: () => void;
  currentUser: AccessType | undefined;
}

export default function Router(props: RouterProps) {
  return (
    <Routes>
      {/* No navigation bar on login page */}
      <Route
        element={
          <>
            <NavigationBar
              onLogout={props.onLogout}
              currentUser={props.currentUser}
            />
            <Outlet />
          </>
        }
      >
        <Route path="books" element={<BookList />} />
        <Route path="genres" element={<GenreList />} />
        <Route path="purchase-orders" element={<PurchaseOrderList />} />
        <Route path="sales-records" element={<SalesRecordList />} />
        <Route path="vendors" element={<VendorList />} />
        <Route path="book-buybacks" element={<BuyBackList />} />
        <Route path="bookcases" element={<BookcaseList />} />
        <Route path="books/detail/:id" element={<ModifyBook />} />
        <Route path="books/shelf-calculator" element={<ShelfCalculator />} />
        <Route path="genres/detail/:id" element={<GenreDetail />} />
        <Route path="purchase-orders/detail/:id" element={<ModifyPO />} />
        <Route path="sales-records/detail/:id" element={<ModifySR />} />
        <Route path="book-buybacks/detail/:id" element={<ModifyBB />} />
        <Route path="vendors/detail/:id" element={<VendorDetail />} />
        <Route path="bookcases/add" element={<BookcaseDetail />} />
        <Route path="bookcases/detail/:id" element={<BookcaseDetail />} />
        <Route path="change-password" element={<PasswordChangePage />} />
        <Route path="sales-report" element={<SalesReportPage />} />
        {props.currentUser?.userType === "Administrator" && (
          <>
            <Route path="books/add" element={<BookAdd />} />
            <Route path="genres/add" element={<GenreAdd />} />
            <Route path="purchase-orders/add" element={<ModifyPO />} />
            <Route path="book-buybacks/add" element={<ModifyBB />} />
            <Route path="vendors/add" element={<VendorAdd />} />
            <Route path="users" element={<UserList />} />
            <Route path="users/add" element={<UserDetail />} />
            <Route path="users/detail/:id" element={<UserDetail />} />
          </>
        )}
      </Route>
    </Routes>
  );
}
