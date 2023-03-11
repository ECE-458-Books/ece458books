import { Menubar } from "primereact/menubar";
import { MenuItem } from "primereact/menuitem";
import { useNavigate } from "react-router-dom";
import { AccessType } from "../../util/UserTypes";
import { LogoutUser } from "../../util/NavbarFunctions";

interface NavigationBarProps {
  onLogout: (user: AccessType | undefined) => void;
  currentUser: AccessType | undefined;
}

function NavigationBar(props: NavigationBarProps) {
  const navigate = useNavigate();

  const items: MenuItem[] = [
    {
      label: "Books",
      icon: "pi pi-fw pi-book",
      command: () => navigate("/books"),
    },
    {
      label: "Genres",
      icon: "pi pi-fw pi-palette",
      command: () => navigate("/genres"),
    },
    {
      label: "Vendors",
      icon: "pi pi-fw pi-building",
      command: () => navigate("/vendors"),
    },
    {
      label: "Purchase Orders",
      icon: "pi pi-fw pi-credit-card",
      command: () => navigate("/purchase-orders"),
    },
    {
      label: "Sales Reconciliations",
      icon: "pi pi-fw pi-chart-bar",
      command: () => navigate("/sales-reconciliations"),
    },
    {
      label: "Book Buybacks",
      icon: "pi pi-bw rotate-180 pi-sign-out",
      command: () => navigate("/book-buybacks"),
    },
    {
      label: "Sales Report",
      icon: "pi pi-dollar",
      command: () => navigate("/sales-report"),
    },
    {
      label: "Settings",
      icon: "pi pi-fw pi-wrench",
      items: [
        {
          label: "Users",
          icon: "pi pi-fw pi-users",
          visible: props.currentUser?.userType === "Administrator",
          command: () => navigate("/users"),
        },
        {
          label: "Change Password",
          icon: "pi pi-fw pi-database",
          command: () => navigate("/change-password"),
        },
        {
          label: "Log Out",
          icon: "pi pi-fw pi-sign-out",
          command: () => {
            LogoutUser(props.onLogout);
          },
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
      onClick={() => navigate("/books")}
    ></img>
  );

  return <Menubar model={items} start={start} />;
}

export default NavigationBar;
