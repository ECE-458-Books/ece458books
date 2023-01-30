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

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<BookListPage />} />
      <Route path="books" element={<BookListPage />} />
      <Route path="genres" element={<GenreListPage />} />
      <Route path="vendors" element={<VendorListPage />} />
      <Route path="purchases" element={<PurchaseOrderListPage />} />
      <Route path="sales" element={<SalesReconciliationListPage />} />
      <Route path="modifybook" element={<ModifyBook />} />
      <Route path="modifygenre" element={<ModifyGenre />} />
      <Route path="modifypurchaseorder" element={<ModifyPO />} />
      <Route path="modifysalesreconciliation" element={<ModifySR />} />
      <Route path="modifyvendor" element={<ModifyVendor />} />
    </Routes>
  );
}
