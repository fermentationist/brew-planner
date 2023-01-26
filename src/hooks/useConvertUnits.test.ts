import { describe, it, assert, expect } from "vitest";
import convert from "convert-units";
import volume from "convert-units/lib/definitions/volume.js";
import unitDefaults from "../config/unitDefaults.ts";

// const convert = configureMeasurements(volume);

const globalState = {
  preferredUnits: {
    batchSize: "gal",
    tunSpecificHeat: "J/kg*C",
    tunWeight: "lb",
    tunLoss: "gal",
    evaporationRate: "gal/h",
    tunVolume: "gal"
  },
};
const requiredMessage = { required: "required field" };
const formInputs = [
  {
    name: "name",
    label: "Name",
    defaultValue: "Test brewhouse",
    validation: {required: true},
    errorMessages: requiredMessage,
    width: "250px",
    convert: false
  },
  {
    name: "batchSize", 
    label: "Batch Volume",
    type: "number",
    step: "0.01",
    defaultValue: 6,
    validation: {required: true},
    errorMessages: requiredMessage,
    width: "250px",
    convert: true
  },
  {
    name: "tunVolume", 
    label: "Mash Tun Volume",
    type: "number",
    step: "0.01",
    defaultValue: 10,
    validation: {required: true},
    errorMessages: requiredMessage,
    width: "250px",
    convert: true
  },
  {
    name: "tunWeight", 
    label: "Mash Tun Weight",
    type: "number",
    step: "0.01",
    defaultValue: 15,
    validation: {required: true},
    errorMessages: requiredMessage,
    width: "250px",
    convert: true
  },
  {
    name: "tunLoss", 
    label: "Mash Tun Loss Volume",
    type: "number",
    step: "0.01",
    defaultValue: 0,
    width: "250px",
    convert: true
  },
  {
    name: "tunSpecificHeat", 
    label: "Mash Tun Specific Heat",
    type: "number",
    step: "0.01",
    defaultValue: 1,
    validation: {required: true},
    errorMessages: requiredMessage,
    width: "250px",
    convert: true
  }
//     "breweryUuid"
// "brewhouseUuid"
// "createdBy"
// "batchSize"
// "tunVolume"
// "tunWeight"
// "tunLoss"
// "tunSpecificHeat"
// "lauterDeadspace"
// "topUpWater"
// "trubChillerLoss"
// "evaporationRate"
// "kettleVol"
// "miscLoss"
// "extractEfficiency"
// "grainAbsorptionRate"
// "hopUtilization"
];

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
    return inputCopy;
  });
};

export default describe("useConvert", () => {
  it("parseUnit", () => {
    const [units, operators] = parseUnit("cal/kg*C");
    assert.equal(
      units.filter((unit) => ["cal", "kg", "C"].includes(unit)).length,
      3
    );
    assert.equal(
      operators.filter((operator) => ["/", "*"].includes(operator)).length,
      2
    );
  });

  it("convertToPreferredUnit - simple units", () => {
    const result = convertToPreferredUnit("batchSize", 10);
    assert.equal(result.value, 2.641720515625);
    assert.equal(result.unit, "gal");
  });

  it("convertToPreferredUnit - compound units", () => {
    const result = convertToPreferredUnit("tunSpecificHeat", 1);
    assert.equal(result.value, 4.184);
    assert.equal(result.unit, "J/kg*C");
  });

  it("convertToPreferredUnit - compound units", () => {
    const result = convertToPreferredUnit("evaporationRate", 0.0125);
    expect(result.value).toBeCloseTo(convert(0.0125).from("l/h").to("gal/h"), 8);
  });

  it("convertToCanonicalUnit - simple units", () => {
    const result = convertToCanonicalUnit("batchSize", 2.641720515625);
    expect(result.value).toBe(10);
    expect(result.unit).toBe("l");
  });

  it("convertToCanonicalUnit - compound units", () => {
    const result = convertToCanonicalUnit("tunSpecificHeat", 4.184);
    assert.equal(result.value, 1);
    assert.equal(result.unit, "cal/kg*C");
  });

  it("convertToCanonicalUnit - compound units", () => {
    const result = convertToCanonicalUnit("evaporationRate", 0.0125);
    expect(result.value).toBeCloseTo(convert(0.0125).from("gal/h").to("l/h"), 8);
  });

  it("convertToPreferredUnit - calories edge case", () => {
    const priorValue = globalState.preferredUnits.tunSpecificHeat;
    globalState.preferredUnits.tunSpecificHeat = "GWh/kg*C";
    const result = convertToPreferredUnit("tunSpecificHeat", 1);
    expect(result.value).toBeCloseTo(convert(1).from("J").to("GWh") * 4.184, 8);
    globalState.preferredUnits.tunSpecificHeat = priorValue;
  });

  it("applyUnitConversionsToInputList", () => {
    const inputsWithUnitConversions = applyUnitConversionsToInputList(formInputs);
    console.log("inputsWithUnitConversions:", inputsWithUnitConversions);
    for (const input of inputsWithUnitConversions) {
      if (input.convert) {
        assert(Array.isArray(input.unitSelections));
      }
    }
  })
});
