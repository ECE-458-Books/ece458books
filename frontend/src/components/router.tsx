<<<<<<< HEAD
import { Routes, Route } from "react-router-dom";
import BookListPage from "../pages/bookList";
import GenreListPage from "../pages/genreList";
import PurchaseOrderListPage from "../pages/PurchaseOrderList";
import SalesReconciliationListPage from "../pages/SalesReconciliationList";
import VendorListPage from "../pages/VendorList";
import ModifyBook from "../pages/modfiyBook";
import ModifyGenre from "../pages/modifyGenre";
import ModifyPO from "../pages/modifyPO";
import ModifySR from "../pages/modifySR";
import ModifyVendor from "../pages/modifyVendor";
=======
import { Routes, Route, useNavigate } from "react-router-dom";
import { Outlet } from "react-router";
import NavigationBar from "./navbar";
import BookList from "../pages/BookList";
import GenreList from "../pages/GenreList";
import LoginPage from "../pages/loginPage";
import VendorList from "../pages/VendorList";
import SalesReconciliationList from "../pages/SalesReconciliationList";
>>>>>>> list-view

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
        <Route path="modifybook" element={<ModifyBook />} />
      <Route path="modifygenre" element={<ModifyGenre />} />
      <Route path="modifypurchaseorder" element={<ModifyPO />} />
      <Route path="modifysalesreconciliation" element={<ModifySR />} />
      <Route path="modifyvendor" element={<ModifyVendor />} />
      </Route>
    </Routes>
  );
}
