import convert from "convert-units";
import { useCallback } from "react";
import useGlobalState from "./useGlobalState.ts";
import unitDefaults from "../config/unitDefaults.ts";

const useConvert = () => {
  const [globalState] = useGlobalState();

  const parseUnit = (unit) => {
    const units = unit.split(/[/*]/g);
    const operators = unit.split(/\w+/g).filter((x) => x);
    return [units, operators];
  };

  const createConvertFunction = (target) => (field, value) => {
    const canonicalUnit = unitDefaults[field]?.canonical;
    const preferredUnit = globalState?.preferredUnits?.[field];
    if (!canonicalUnit) {
      return { value, unit: null };
    }
    if (!preferredUnit) {
      return { value, unit: canonicalUnit};
    }
    const [canonicalParts] = parseUnit(canonicalUnit);
    const [preferredParts, operations] = parseUnit(preferredUnit);
    const canonicalTarget = target === "canonical";
    const sourceUnitParts = canonicalTarget ? preferredParts : canonicalParts;
    const targetUnitParts = canonicalTarget ? canonicalParts : preferredParts;

    const result = sourceUnitParts.reduce((output, part, index) => {
      const targetUnit = targetUnitParts[index];
      // convert-units conversion library does not include calories, so handling manually
      if (part === "cal") {
        // convert to Joules
        output = output * 4.184;
        part = "J";
      }
      if (targetUnit === "cal") {
        // convert from Joules
        output = convert(output).from(part).to("J") / 4.184;
        part = "J";
        if (index === 0) {
          return output;
        }
      }
      if (index === 0) {
        output = convert(output).from(part).to(targetUnit);
      } else {
        const operation = operations.shift();
        const operand = convert(1).from(part).to(targetUnit);
        switch (operation) {
          case "*":
            output = output * operand;
            break;
          case "/":
            output = output / operand;
            break;
          default:
          // do nothing
        }
      }
      return output;
    }, value);

    return {
      value: result,
      unit: canonicalTarget ? canonicalUnit : preferredUnit,
    };
  };

  const convertToPreferredUnit = createConvertFunction("preferred");
  const convertToCanonicalUnit = createConvertFunction("canonical");

  const getAltUnitSelections = (unit) => {
    const [units] = parseUnit(unit);
    const safeUnits = units.map((unit) =>
      unit.toLowerCase() === "cal" ? "J" : unit
    );
    const selections = safeUnits.reduce((map, unit) => {
      map[unit] = convert().from(unit).possibilities();
      return map;
    }, {});
    return selections;
  };

  const applyUnitConversionsToInputList = (inputList) => {
    return inputList.map((input) => {
      const inputCopy = { ...input };
      if (input.convert) {
        const convertResult = (x) =>
          convertToCanonicalUnit(input.name, x)?.value;
        const { value, unit } = convertToPreferredUnit(
          input.name,
          input.defaultValue
        );
        inputCopy.defaultValue = value;
        inputCopy.callback = convertResult;
        inputCopy.unit = unit;
        inputCopy.label += ` (${unit})`;
        inputCopy.unitSelections = getAltUnitSelections(unit);
      }
      console.log("inputCopy after:", inputCopy);
      return inputCopy;
    });
  };

  return {
    parseUnit: useCallback(parseUnit, []),
    convertToPreferredUnit: useCallback(convertToPreferredUnit, []),
    convertToCanonicalUnit: useCallback(convertToCanonicalUnit, []),
    applyUnitConversionsToInputList: useCallback(applyUnitConversionsToInputList, []),
    unitDefaults,
  };
};

export default useConvert;
