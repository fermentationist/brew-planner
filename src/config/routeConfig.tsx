import Home from "../pages/Home";
import BrewhousesPage from "../pages/Brewhouses";
import FermentablesPage from "../pages/Fermentables";
import HopsPage from "../pages/Hops";
import WatersPage from "../pages/Waters";
import YeastsPage from "../pages/Yeasts";
import Users from "../pages/Users";
import withBreweryRequired from "../hoc/withBreweryRequired";

const Brewhouses = withBreweryRequired(BrewhousesPage);
const Fermentables = withBreweryRequired(FermentablesPage);
const Hops = withBreweryRequired(HopsPage);
const Waters = withBreweryRequired(WatersPage);
const Yeasts = withBreweryRequired(YeastsPage);

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
  "/users": {
    roles: ["admin", "manager"],
    component: <Users />
  }
}

export default routes;
