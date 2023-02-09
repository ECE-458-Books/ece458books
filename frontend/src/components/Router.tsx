import { Routes, Route, useNavigate } from "react-router-dom";
import { Outlet } from "react-router";
import NavigationBar from "./Navbar";
import BookList from "../pages/list/BookList";
import GenreList from "../pages/list/GenreList";
import LoginPage from "../pages/LoginPage";
import VendorList from "../pages/list/VendorList";
import SalesReconciliationList from "../pages/list/SRList";
import ModifyBook from "../pages/detail/ModfiyBook";
import ModifySR from "../pages/detail/SRDetail";
import ModifyPO from "../pages/detail/PODetail";
import BookAdd from "../pages/add/BookAdd";
import GenreAdd from "../pages/add/GenreAdd";
import VendorAdd from "../pages/add/VendorAdd";
import GenreDetail from "../pages/detail/GenreDetail";
import VendorDetail from "../pages/detail/VendorDetail";
import PurchaseOrderList from "../pages/list/POList";
import PasswordChangePage from "../pages/auth/PasswordChange";

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
  const isLoggedIn = !!sessionStorage.getItem("accessToken");
  const navigate = useNavigate();

  if (!isLoggedIn) {
    navigate("/");
    return <LoginPage />;
  }

  return (
    <Routes>
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
        <Route path="books/detail" element={<ModifyBook />} />
        <Route path="genres/add" element={<GenreAdd />} />
        <Route path="genres/detail" element={<GenreDetail />} />
        <Route path="purchase-orders/add" element={<ModifyPO />} />
        <Route path="purchase-orders/detail" element={<ModifyPO />} />
        <Route path="sales-reconciliations/add" element={<ModifySR />} />
        <Route path="sales-reconciliations/detail" element={<ModifySR />} />
        <Route path="vendors/add" element={<VendorAdd />} />
        <Route path="vendors/detail" element={<VendorDetail />} />
        <Route path="change-password" element={<PasswordChangePage />} />
      </Route>
    </Routes>
  );
}
