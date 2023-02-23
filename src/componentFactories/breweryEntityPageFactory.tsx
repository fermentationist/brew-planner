import EntityPage from "../pages/EntityPage";
import { FormInputOptions } from "../components/FormModal";
import { ComponentType } from "react";

// a factory to automate the creation of pages for brewery-defined entities like ingredients
function breweryEntityPageFactory<EntityType>(entityName: string, inputList: FormInputOptions[], title?: string) {
  return EntityPage.bind(null, {entityName, inputList, title}) as ComponentType<EntityType>;
}

export default breweryEntityPageFactory;
