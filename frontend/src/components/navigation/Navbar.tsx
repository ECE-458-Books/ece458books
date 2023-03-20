import { Menubar } from "primereact/menubar";
import { MenuItem } from "primereact/menuitem";
import { useNavigate } from "react-router-dom";
import IsUserLoggedIn from "../../util/auth/CheckLoginStatus";
import { AccessType } from "../../util/auth/UserTypes";

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
      icon: "pi pi-fw pi-book",
      command: () => navigateIfLoggedIn("/books"),
    },
    {
      label: "Genres",
      icon: "pi pi-fw pi-palette",
      command: () => navigateIfLoggedIn("/genres"),
    },
    {
      label: "Vendors",
      icon: "pi pi-fw pi-building",
      command: () => navigateIfLoggedIn("/vendors"),
    },
    {
      label: "Purchase Orders",
      icon: "pi pi-fw pi-credit-card",
      command: () => navigateIfLoggedIn("/purchase-orders"),
    },
    {
      label: "Sales Reconciliations",
      icon: "pi pi-fw pi-chart-bar",
      command: () => navigateIfLoggedIn("/sales-reconciliations"),
    },
    {
      label: "Book Buybacks",
      icon: "pi pi-bw rotate-180 pi-sign-out",
      command: () => navigateIfLoggedIn("/book-buybacks"),
    },
    {
      label: "Sales Report",
      icon: "pi pi-dollar",
      command: () => navigateIfLoggedIn("/sales-report"),
    },
    {
      label: "Settings",
      icon: "pi pi-fw pi-wrench",
      items: [
        {
          label: "Users",
          icon: "pi pi-fw pi-users",
          visible: props.currentUser?.userType === "Administrator",
          command: () => navigateIfLoggedIn("/users"),
        },
        {
          label: "Change Password",
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
      height="50"
      className="mr-2 px-3 cursor-pointer"
      onClick={() => navigateIfLoggedIn("/books")}
    ></img>
  );

  return <Menubar model={items} start={start} />;
}

export default NavigationBar;
