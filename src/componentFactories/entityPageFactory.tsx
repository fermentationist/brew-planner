import EntityPage from "../components/EntityPage";
import { FormInputOptions } from "../components/FormModal";
import { ComponentType } from "react";

export interface EntityPageFactoryOptions {
  entityName: string | string[];
  inputList: FormInputOptions[];
  pluralEntityName?: string | string[];
  title?: string | string[];
  baseURL?: string;
}

// a factory to automate the creation of pages for entities like breweries or ingredients
function entityPageFactory<EntityType>(arg1: string | EntityPageFactoryOptions, arg2?: FormInputOptions[]) { // accepts either an entityName and an inputList as arguments, or else an options object
  let entityName, inputList, pluralEntityName, title, baseURL;
  if (typeof arg1 === "string") {
    ([entityName, inputList] = [arg1, arg2]);
  } else {
    ({
      entityName,
      inputList,
      pluralEntityName,
      title,
      baseURL,
    } = arg1);
  }
  return EntityPage.bind(null, {
    entityName,
    inputList,
    pluralEntityName,
    title,
    baseURL,
  }) as ComponentType<EntityType>;
}

export default entityPageFactory;
