export interface IMenuItem {
  title: string;
  link?: string;
  subMenu?: IMenuItem[];
}

const menuItems: IMenuItem[] = [
  {
    title: "Home",
    link: "/home"
  },
  {
    title: "Variants",
    link: "/variants"
  },
  {
    title: "Warehouse",
    subMenu: [
      {
        title: "Inventory",
        link: "/inventory"
      },
      {
        title: "Fulfillment",
        subMenu: [
          // {
          //   title: "Orders",
          //   link: "/orders"
          // },
          {
            title: "Shipments",
            link: "/shipments"
          }
        ]
      }
    ]
  },
  {
    title: "Users",
    link: "/users"
  }
];

export default menuItems;
