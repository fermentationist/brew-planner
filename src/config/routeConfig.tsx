import Home from "../pages/Home";
import BrewhousesPage from "../pages/Brewhouses";
import FermentablesPage from "../pages/Fermentables";
import Users from "../pages/Users";
import withBreweryRequired from "../hoc/withBreweryRequired";

const Brewhouses = withBreweryRequired(BrewhousesPage);
const Fermentables = withBreweryRequired(FermentablesPage);

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
  "/users": {
    roles: ["admin", "manager"],
    component: <Users />
  }
}

export default routes;
