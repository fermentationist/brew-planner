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
    title: "Users",
    link: "/users"
  },
  {
    title: "Breweries",
    link: "/breweries"
  },
  {
    title: "Brewhouses",
    link: "/brewhouses"
  },
  {
    title: "Ingredients",
    subMenu: [
      {
        title: "Fermentables",
        link: "/ingredients/fermentables"
      },
      {
        title: "Hops",
        link: "/ingredients/hops"
      },
      {
        title: "Mash Profiles",
        link: "/ingredients/mash_profiles"
      },
      {
        title: "Yeasts",
        link: "/ingredients/yeasts"
      },
      {
        title: "Water Profiles",
        link: "/ingredients/water_profiles"
      },
      {
        title: "Miscellaneous Additions",
        link: "/ingredients/misc_additions"
      }
    ]
  }
];

export default menuItems;
