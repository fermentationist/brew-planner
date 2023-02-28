import Home from "../pages/Home";
import BrewhousesPage from "../pages/Brewhouses";
import FermentablesPage from "../pages/Fermentables";
import HopsPage from "../pages/Hops";
import WatersPage from "../pages/Waters";
import YeastsPage from "../pages/Yeasts";
import MiscsPage from "../pages/Miscs";
import Users from "../pages/Users";
import Breweries from "../pages/Breweries";
import withBreweryRequired from "../hoc/withBreweryRequired";

const Brewhouses = withBreweryRequired(BrewhousesPage);
const Fermentables = withBreweryRequired(FermentablesPage);
const Hops = withBreweryRequired(HopsPage);
const Waters = withBreweryRequired(WatersPage);
const Yeasts = withBreweryRequired(YeastsPage);
const Miscs = withBreweryRequired(MiscsPage);

export interface Routes {
  [route: string]: {
    roles: string[];
    component: JSX.Element;
  }
}

const routes: Routes = {
  "/": {
    roles: ["user", "manager", "admin"],
    component: <Home />
  },
  "/home": {
    roles: ["user", "manager", "admin"],
    component: <Home />
  },
  "/breweries": {
    roles: ["admin"],
    component: <Breweries />
  },
  "/brewhouses": {
    roles: ["user", "manager", "admin"],
    component: <Brewhouses />
  },
  "/ingredients/fermentables": {
    roles: ["user", "manager", "admin"],
    component: <Fermentables />
  },
  "/ingredients/hops": {
    roles: ["user", "manager", "admin"],
    component: <Hops />
  },
  "/ingredients/water_profiles": {
    roles: ["user", "manager", "admin"],
    component: <Waters />
  },
  "/ingredients/yeasts": {
    roles: ["user", "manager", "admin"],
    component: <Yeasts />
  },
  "/ingredients/misc_additions": {
    roles: ["user", "manager", "admin"],
    component: <Miscs />
  },
  "/users": {
    roles: ["admin", "manager"],
    component: <Users />
  }
}

export default routes;
