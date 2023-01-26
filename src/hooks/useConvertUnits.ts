import convert from "convert-units";
import { useCallback } from "react";
import useGlobalState from "./useGlobalState";
import unitDefaults from "../config/unitDefaults";

const useConvertUnits = () => {
  const [globalState, setGlobalState] = useGlobalState();

  const parseUnit = (unit: string) => {
    const units = unit.split(/[/*]/g);
    const operators = unit.split(/\w+/g).filter((x) => x);
    return [units, operators];
  };

  const getPreferredOrDefaultUnit = (field: string) => globalState?.preferredUnits?.[field] || unitDefaults[field]?.default;

  const createConvertFunction =
    (target: "canonical" | "preferred", preferredUnitParam: string = null) => (field: string, stringOrNumber: string | number) => {
      const value = Number(stringOrNumber);
      const canonicalTarget = target === "canonical";
      console.log("canonicalTarget:", canonicalTarget);
      const canonicalUnit = unitDefaults[field]?.canonical;
      const preferredUnit = preferredUnitParam ||
        getPreferredOrDefaultUnit(field);
      if (!canonicalUnit) {
        return { value, unit: null };
      }
      if (!preferredUnit) {
        return { value, unit: canonicalUnit };
      }
      const [canonicalParts] = parseUnit(canonicalUnit);
      const [preferredParts, operations] = parseUnit(preferredUnit);
      console.log("preferredParts:", preferredParts);
      const sourceUnitParts = canonicalTarget ? preferredParts : canonicalParts;
      console.log("sourceUnitParts:", sourceUnitParts);
      const targetUnitParts = canonicalTarget ? canonicalParts : preferredParts;
      const result = sourceUnitParts.reduce(
        (output: number, part: string, index: number) => {
          const targetUnit = targetUnitParts[index];
          if (part === targetUnit) {
            return output;
          }
          // convert-units conversion library does not include calories, so handling manually
          if (part === "cal") {
            // convert to Joules
            output = output * 4.184;
            part = "J";
          }
          if (targetUnit === "cal") {
            // convert to Joules, then convert to cal
            output = convert(output).from(part).to("J") / 4.184;
            part = "J";
            if (index === 0) {
              return output;
            }
          }
          if (index === 0) {
            output = convert(output).from(part).to(targetUnit);
            if (canonicalUnit) console.log(`convert from ${part} to ${targetUnit}:`, output);
          } else {
            const operation = operations.shift();
            const operand = convert(1).from(part).to(targetUnit);
            if (canonicalUnit) console.log(`convert from ${part} to ${targetUnit}:`, output);
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
        },
        value
      );
      if (canonicalTarget) console.log("result:", result);
      return {
        value: result,
        unit: canonicalTarget ? canonicalUnit : preferredUnit,
      };
    };

  const convertToPreferredUnit = createConvertFunction("preferred");

  const getAltUnitSelections = (unit: string) => {
    const [units] = parseUnit(unit);
    const safeUnits = units.map((unitPart) =>
      unitPart.toLowerCase() === "cal" ? "J" : unitPart
    );
    const selections = units.reduce((map: {[key: string]: string[]}, unit, index) => {
      const possibilities = convert().from(safeUnits[index]).possibilities();
      if (possibilities.includes("J") || safeUnits[index] === "J") {
        possibilities.push("cal");
      }
      map[unit] = [unit, ...possibilities];
      return map;
    }, {});
    return selections;
  };

  const getConversionFunction = (inputName: string, preferredUnitParam: string  = null) => {
    const preferredUnit = preferredUnitParam ||
        globalState?.preferredUnits?.[inputName] || unitDefaults[inputName]?.default;
    console.log("creating function to convert to canonical from", preferredUnit);
    const conversionFunction =  (x: string | number) => {
      const convertToCanonicalUnit = createConvertFunction("canonical", preferredUnit);
      console.log("calling conversionFunction to convert to canonical from", preferredUnit)
      return convertToCanonicalUnit(inputName, x)?.value;
    }
    return conversionFunction;
  }

  const setPreferredUnit = (field: string, unit: string) => {
    setGlobalState({
      ...globalState,
      preferredUnits: {
        ...globalState.preferredUnits,
        [field]: unit
      }
    })
  }

  return {
    parseUnit: useCallback(parseUnit, []),
    convertToPreferredUnit,
    getConversionFunction,
    getPreferredOrDefaultUnit,
    getAltUnitSelections,
    setPreferredUnit,
    unitDefaults,
    preferredUnits: globalState?.preferredUnits,

  };
};

export default useConvertUnits;
