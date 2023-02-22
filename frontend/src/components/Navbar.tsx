import { Menubar } from "primereact/menubar";
import { MenuItem } from "primereact/menuitem";
import { useNavigate } from "react-router-dom";

function NavigationBar() {
  const navigate = useNavigate();

  const items: MenuItem[] = [
    {
      label: "Books",
      icon: "pi pi-fw pi-book",
      items: [
        {
          label: "List",
          icon: "pi pi-fw pi-list",
          command: () => navigate("/books"),
        },
        {
          label: "Add",
          icon: "pi pi-fw pi-plus",
          command: () => navigate("/books/add"),
        },
      ],
    },
    {
      label: "Genres",
      icon: "pi pi-fw pi-palette",
      items: [
        {
          label: "List",
          icon: "pi pi-fw pi-list",
          command: () => navigate("/genres"),
        },
        {
          label: "Add",
          icon: "pi pi-fw pi-plus",
          command: () => navigate("/genres/add"),
        },
      ],
    },
    {
      label: "Vendors",
      icon: "pi pi-fw pi-building",
      items: [
        {
          label: "List",
          icon: "pi pi-fw pi-list",
          command: () => navigate("/vendors"),
        },
        {
          label: "Add",
          icon: "pi pi-fw pi-plus",
          command: () => navigate("/vendors/add"),
        },
      ],
    },
    {
      label: "Purchase Orders",
      icon: "pi pi-fw pi-credit-card",
      items: [
        {
          label: "List",
          icon: "pi pi-fw pi-list",
          command: () => navigate("/purchase-orders"),
        },
        {
          label: "Add",
          icon: "pi pi-fw pi-plus",
          command: () => navigate("/purchase-orders/add"),
        },
      ],
    },
    {
      label: "Sales Reconciliations",
      icon: "pi pi-fw pi-chart-bar",
      items: [
        {
          label: "List",
          icon: "pi pi-fw pi-list",
          command: () => navigate("/sales-reconciliations"),
        },
        {
          label: "Add",
          icon: "pi pi-fw pi-plus",
          command: () => navigate("/sales-reconciliations/add"),
        },
      ],
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
          label: "Change Password",
          icon: "pi pi-fw pi-database",
          command: () => navigate("/change-password"),
        },
      ],
    },
  ];

  const start = (
    <img
      alt="logo"
      src={require("../ImaginarySoftwareLogo.jpeg")}
      height="50"
      className="mr-2 px-3"
    ></img>
  );

  return <Menubar model={items} start={start} />;
}

export default NavigationBar;
