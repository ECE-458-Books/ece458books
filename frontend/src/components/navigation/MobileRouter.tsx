import { Routes, Route, Outlet, useNavigate } from "react-router-dom";
import { AccessType } from "../../util/auth/UserTypes";
import BookLookup from "../../pages/books/mobile/BookLookup";
import { MenuItem } from "primereact/menuitem";
import { Menubar } from "primereact/menubar";
import IsUserLoggedIn from "../../util/auth/CheckLoginStatus";
import { Button } from "primereact/button";
import BookDetailMobile from "../../pages/books/mobile/BookDetailMobile";

interface RouterProps {
  onLogout: () => void;
  currentUser: AccessType | undefined;
}

export default function Router(props: RouterProps) {
  const navigate = useNavigate();

  const navigateIfLoggedIn = (urlExtension: string) => {
    if (IsUserLoggedIn()) navigate(urlExtension);
    else navigate("/");
  };

  const items: MenuItem[] = [];

  const start = (
    <img
      alt="logo"
      src={require("../../ImaginarySoftwareLogo.png")}
      height="35"
      className="mr-2 px-3 cursor-pointer"
      onClick={() => navigateIfLoggedIn("/books/lookup")}
    ></img>
  );

  const end = (
    <div className="flex">
      <div>
        <div className="font-bold">{props.currentUser?.userType}</div>
        <div>{localStorage.getItem("currentUsername")}</div>
      </div>
      <div>
        <Button
          label="Log Out"
          className="p-button-info p-button-outlined p-button-sm ml-3"
          onClick={props.onLogout}
        />
      </div>
    </div>
  );

  return (
    <Routes>
      {/* No navigation bar on login page */}
      <Route
        element={
          <>
            <Menubar
              model={items}
              start={start}
              end={end}
              className="navbarItems"
            />
            <Outlet />
          </>
        }
      >
        <Route path="books/lookup" element={<BookLookup />} />
        <Route path="books/detail/:id" element={<BookDetailMobile />} />
      </Route>
    </Routes>
  );
}
