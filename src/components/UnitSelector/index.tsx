import { useEffect, useState, memo } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";

const UnitSelector = ({
  selections,
  defaultUnit,
  callback,
  setPreferredUnit,
  parseUnit
}: {
  selections: {[key: string]: string[]};
  defaultUnit: string;
  callback: () => any;
  setPreferredUnit: (unit: string) => void;
  parseUnit: (unit: string) => string[][];
}) => {
  const [initialParts, intialOperators] = parseUnit(defaultUnit);
  const [unitParts, setUnitParts] = useState(initialParts);
  const [operators, setOperators] = useState(intialOperators);
  const [dropdownState, setDropdownState] = useState([]);

  useEffect(() => {
    const [parts, ops] = parseUnit(defaultUnit);
    setDropdownState(parts);
    setOperators([...ops, ""]);
    setUnitParts(parts);
  }, [defaultUnit, parseUnit]);

  const onUnitChange = (unitPartIndex: number, event: SelectChangeEvent) => {
    const newUnit = event.target.value;
    const newDropdownState = [...dropdownState];
    newDropdownState[unitPartIndex] = newUnit;
    const newCompoundUnit = newDropdownState.reduce(
      (newUnit, unitPart, index) => {
        return newUnit + unitPart + operators[index];
      },
      ""
    );
    setPreferredUnit(newCompoundUnit);
    setDropdownState(newDropdownState);
    return callback();
  };
  return (
    <>
      {dropdownState.length
        ? unitParts.map((part: string, partIndex) => {
            return (
              <span key={partIndex}>
                <Select
                  value={dropdownState[partIndex]}
                  onChange={onUnitChange.bind(null, partIndex)}
                >
                  {selections[part]?.map((selection, index) => {
                    return (
                      <MenuItem key={index} value={selection}>
                        {selection}
                      </MenuItem>
                    );
                  })}
                </Select>
                {operators[partIndex]}
              </span>
            );
          })
        : null}
    </>
  );
};

export default memo(UnitSelector, () => true);
