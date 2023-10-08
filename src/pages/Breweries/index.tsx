import entityPageFactory from "../../componentFactories/entityPageFactory";
import { ADMIN_PATH } from "../../utils/APIRequest";
import { required, requiredMessage, maxLengthErrorMessageFactory } from "../../utils/validationHelpers";

export const breweryInputs = [
  {
    name: "name",
    label: "Name",
    type: "text",
    validation: {...required, maxLength: 30},
    errorMessages: {...requiredMessage, ...maxLengthErrorMessageFactory},
    width: "250px",
  },
  {
    name: "street",
    label: "Street Address",
    type: "text",
    validation: {maxLength: 100},
    errorMessages: maxLengthErrorMessageFactory(100),
    width: "250px",
  },
  {
    name: "unit",
    label: "Unit",
    type: "text",
    validation: {maxLength: 50},
    errorMessages: maxLengthErrorMessageFactory(50),
    width: "250px",
  },
  {
    name: "city",
    label: "City",
    type: "text",
    validation: {maxLength: 50},
    errorMessages: maxLengthErrorMessageFactory(50),
    width: "250px",
  },
  {
    name: "stateOrProvince",
    label: "State",
    type: "text",
    validation: {maxLength: 2},
    errorMessages: maxLengthErrorMessageFactory(2),
    width: "250px",
  },
  {
    name: "postalCode",
    label: "Zip",
    type: "text",
    validation: {maxLength: 5},
    errorMessages: maxLengthErrorMessageFactory(5),
    width: "250px",
  },
  {
    name: "country",
    label: "Country",
    type: "text",
    validation: {maxLength: 30},
    errorMessages: maxLengthErrorMessageFactory(30),
    width: "250px",
  }
];

const Breweries = entityPageFactory({entityName: "brewery", inputList: breweryInputs, baseURL: ADMIN_PATH, pluralEntityName: "breweries"});

export default Breweries;
