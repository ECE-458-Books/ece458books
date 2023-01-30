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
  ];

  return <Menubar model={items} />;
}

export default NavigationBar;
