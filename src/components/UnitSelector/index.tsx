import { useEffect, useState, memo, useCallback } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import styled from "styled-components";

export interface UnitSelectorProps {
  selections: Record<string, string[]>;
  defaultUnit: string;
  callback?: (val: any) => any;
  setPreferredUnit: (unit: string) => void;
  parseUnit: (unit: string) => string[][];
  className?: string;
  forceCollapseUnitsValue?: number | null;
}

const CHANGE_UNIT_MESSAGE = "Change units...";

const StyledSpan = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  .unit-selector-operator {
    margin: 0 0.5em;
  }
`;

const UnitSelector = ({
  selections,
  defaultUnit,
  callback,
  setPreferredUnit,
  parseUnit,
  className,
  forceCollapseUnitsValue,
}: UnitSelectorProps) => {
  const [initialParts, intialOperators] = parseUnit(defaultUnit);
  const [unitParts, setUnitParts] = useState(initialParts);
  const [operators, setOperators] = useState(intialOperators);
  const [dropdownState, setDropdownState] = useState([]);
  const [showExpandedSelector, setShowExpandedSelector] = useState(false);

  useEffect(() => {
    const [parts, ops] = parseUnit(defaultUnit);
    setDropdownState(parts);
    setOperators(ops);
    setUnitParts(parts);
  }, [defaultUnit, parseUnit]);

  const getCombinedUnit = (): string => {
    return getCombinedUnitFromNewDropdownState(dropdownState);
  };

  const getCombinedUnitFromNewDropdownState = useCallback((newDropdownState: string[]): string => 
    {
      const operatorsCopy = [...operators];
      const combined = newDropdownState.reduce((accum, unitPart, index) => {
        if (index < operatorsCopy.length) {
          return accum + unitPart + operatorsCopy[index];
        }
        return accum + unitPart;
      }, "");
      return combined;
    }, [operators]);

  // if forceCollapseUnitsValue is true, then the unit selector will be collapsed to a single select and a re-render will be forced
  useEffect(() => {
    if (forceCollapseUnitsValue) {
      setShowExpandedSelector(false);
    }
  }, [forceCollapseUnitsValue, setShowExpandedSelector]);

  
  const onExpandedUnitChange = (
    unitPartIndex: number,
    event: SelectChangeEvent
  ) => {
    const newUnit = event.target.value;
    const newDropdownState = [...dropdownState];
    newDropdownState[unitPartIndex] = newUnit;
    const newCompoundUnit = getCombinedUnitFromNewDropdownState(newDropdownState);
    setPreferredUnit(newCompoundUnit);
    setDropdownState(newDropdownState);
    callback && callback(newCompoundUnit);
  };

  


  const onCombinedUnitChange = (event: SelectChangeEvent) => {
    const selection = event.target.value;
    if (selection === CHANGE_UNIT_MESSAGE) {
      setShowExpandedSelector(true);
    }
  };

  return (
    <>
      {dropdownState.length ? (
        showExpandedSelector || dropdownState.length === 1 ? (
          unitParts.map((part: string, partIndex) => {
            return (
              <StyledSpan key={partIndex}>
                <Select
                  value={dropdownState[partIndex]}
                  onChange={onExpandedUnitChange.bind(null, partIndex)}
                  className={
                    className
                      ? `${className} expanded-unit-selector`
                      : "expanded-unit-selector"
                  }
                >
                  {selections[part]?.map((selection, index) => {
                    return (
                      <MenuItem key={index} value={selection}>
                        {selection}
                      </MenuItem>
                    );
                  })}
                </Select>
                {operators.length && partIndex < operators.length ? (
                  <span className="unit-selector-operator">
                    {operators[partIndex]}
                  </span>
                ) : null}
              </StyledSpan>
            );
          })
        ) : (
          <StyledSpan>
            <Select
              value={getCombinedUnit()}
              onChange={onCombinedUnitChange}
              className={className}
            >
              <MenuItem value={getCombinedUnit()}>{getCombinedUnit()}</MenuItem>
              <MenuItem value={CHANGE_UNIT_MESSAGE}>
                {CHANGE_UNIT_MESSAGE}
              </MenuItem>
            </Select>
          </StyledSpan>
        )
      ) : null}
    </>
  );
};

export default memo(UnitSelector, (prevProps, nextProps) => {
    return prevProps.forceCollapseUnitsValue === nextProps.forceCollapseUnitsValue;
});
