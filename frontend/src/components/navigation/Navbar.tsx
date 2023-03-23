import { Menubar } from "primereact/menubar";
import { MenuItem } from "primereact/menuitem";
import { useNavigate } from "react-router-dom";
import IsUserLoggedIn from "../../util/auth/CheckLoginStatus";
import { AccessType } from "../../util/auth/UserTypes";
import "../../css/Navbar.css";

interface NavigationBarProps {
  onLogout: () => void;
  currentUser: AccessType | undefined;
}

function NavigationBar(props: NavigationBarProps) {
  const navigate = useNavigate();

  const navigateIfLoggedIn = (urlExtension: string) => {
    if (IsUserLoggedIn()) navigate(urlExtension);
    else navigate("/");
  };

  const items: MenuItem[] = [
    {
      label: "Books",
      id: "booksMenuitem",
      icon: "pi pi-fw pi-book",
      command: () => navigateIfLoggedIn("/books"),
    },
    {
      label: "Genres",
      id: "genresMenuitem",
      icon: "pi pi-fw pi-palette",
      command: () => navigateIfLoggedIn("/genres"),
    },
    {
      label: "Vendors",
      id: "vendorsMenuitem",
      icon: "pi pi-fw pi-building",
      command: () => navigateIfLoggedIn("/vendors"),
    },
    {
      label: "Purchase Orders",
      id: "purchaseOrdersMenuitem",
      icon: "pi pi-fw pi-credit-card",
      command: () => navigateIfLoggedIn("/purchase-orders"),
    },
    {
      label: "Sales Records",
      id: "salesRecordsMenuitem",
      icon: "pi pi-fw pi-chart-bar",
      command: () => navigateIfLoggedIn("/sales-records"),
    },
    {
      label: "Book Buybacks",
      id: "bookBuybacksMenuitem",
      icon: "pi pi-bw rotate-180 pi-sign-out",
      command: () => navigateIfLoggedIn("/book-buybacks"),
    },
    {
      label: "Sales Report",
      id: "salesReportMenuitem",
      icon: "pi pi-dollar",
      command: () => navigateIfLoggedIn("/sales-report"),
    },
    {
      label: "Bookcases",
      id: "bookcasesMenuitem",
      icon: "pi pi-table",
      command: () => navigateIfLoggedIn("/bookcases"),
    },
    {
      label: "Settings",
      icon: "pi pi-fw pi-wrench",
      items: [
        {
          label: "Users",
          id: "usersMenuitem",
          icon: "pi pi-fw pi-users",
          visible: props.currentUser?.userType === "Administrator",
          command: () => navigateIfLoggedIn("/users"),
        },
        {
          label: "Change Password",
          id: "changePasswordMenuitem",
          icon: "pi pi-fw pi-database",
          command: () => navigateIfLoggedIn("/change-password"),
        },
        {
          label: "Log Out",
          icon: "pi pi-fw pi-sign-out",
          command: props.onLogout,
        },
      ],
    },
  ];

  const start = (
    <img
      alt="logo"
      src={require("../../ImaginarySoftwareLogo.png")}
      height="35"
      className="mr-2 px-3 cursor-pointer"
      onClick={() => navigateIfLoggedIn("/books")}
    ></img>
  );

  return <Menubar model={items} start={start} className="navbarItems" />;
}

export default NavigationBar;
