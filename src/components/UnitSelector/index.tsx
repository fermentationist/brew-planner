import { useEffect, useState, memo } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";

export interface UnitSelectorProps {
  selections: Record<string, string[]>;
  defaultUnit: string;
  callback?: (val: any) => any;
  setPreferredUnit: (unit: string) => void;
  parseUnit: (unit: string) => string[][];
  className?: string;
}

const UnitSelector = ({
  selections,
  defaultUnit,
  callback,
  setPreferredUnit,
  parseUnit,
  className
}: UnitSelectorProps) => {
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
    callback && callback(newCompoundUnit);
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
                  className={className}
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
