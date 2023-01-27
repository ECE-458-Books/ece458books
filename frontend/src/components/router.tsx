import { Routes, Route } from "react-router-dom";
import BookListPage from "../pages/bookList";
import GenreListPage from "../pages/genreList";
import PurchaseOrderListPage from "../pages/PurchaseOrderList";
import SalesReconciliationListPage from "../pages/SalesReconciliationList";
import VendorListPage from "../pages/VendorList";
import ModifyBook from "../pages/modfiyBook";

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
    </Routes>
  );
}
