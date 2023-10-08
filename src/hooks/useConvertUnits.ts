import convert from "convert-units";
import { useCallback } from "react";
import useGlobalState from "./useGlobalState";
import {
  DataTableColumnOptions,
  columnOptions,
  DataTableMeta,
  getRowData,
} from "../components/DataTable";
import { FormInputOptions } from "../components/ReactHookForm";
import unitDefaults from "../config/unitDefaults";
import useDeeperMemo from "./useDeeperMemo";

const DEFAULT_MAX_DECIMAL_PLACES = 2;

const useConvertUnits = () => {
  const [globalState, dispatch] = useGlobalState();
  const deepMemoize = useDeeperMemo();

  const parseUnit = useCallback((unit: string) => {
    const units = unit.split(/[/*]/g);
    const operators = unit.split(/\w+/g).filter((x) => ["/", "*"].includes(x));
    return [units, operators];
  }, []);

  const getPreferredOrDefaultUnit = useCallback(
    (field: string, preferredUnitKey?: string) => {
      return (
        (preferredUnitKey
          ? globalState?.preferredUnits?.[preferredUnitKey]?.[field]
          : globalState?.preferredUnits?.[field]) ||
        unitDefaults[field]?.default
      );
    },
    [globalState]
  );

  //
  const createConvertFunction = useCallback(
    (target: "canonical" | "preferred", // whether to convert to canonical or preferred unit
     preferredUnitParam?: string, // unit to convert to, if not preferred
     ) =>
      (
        field: string, // name of field, used to get preferred unit
        stringOrNumber: string | number, // value to convert
        preferredUnitKey?: string // key to get preferred unit from global state
      ) => {
        const value =
          (stringOrNumber ?? "") && (Number(stringOrNumber) as number | string);
        const canonicalTarget = target === "canonical";
        const canonicalUnit = unitDefaults[field]?.canonical;
        const preferredUnit =
          preferredUnitParam ||
          getPreferredOrDefaultUnit(field, preferredUnitKey);
        if (!field || !(stringOrNumber === 0 || stringOrNumber)) {
          return {
            value,
            unit: canonicalTarget ? canonicalUnit : preferredUnit,
          };
        }
        if (!canonicalUnit) {
          return { value, unit: null };
        }
        if (!preferredUnit) {
          return { value, unit: canonicalUnit };
        }
        const [canonicalParts] = parseUnit(canonicalUnit);
        const [preferredParts, operations] = parseUnit(preferredUnit);
        const sourceUnitParts = canonicalTarget
          ? preferredParts
          : canonicalParts;
        const targetUnitParts = canonicalTarget
          ? canonicalParts
          : preferredParts;
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
          },
          value
        );
        return {
          value: result,
          unit: canonicalTarget ? canonicalUnit : preferredUnit,
        };
      },
    [parseUnit, getPreferredOrDefaultUnit]
  );

  //eslint-disable-next-line react-hooks/exhaustive-deps
  const convertToPreferredUnit = useCallback(
    createConvertFunction("preferred"),
    [createConvertFunction]
  );

  const getAltUnitSelections = useCallback(
    (unit: string, unitsToExclude: string[] = []) => {
      const [units] = parseUnit(unit);
      const safeUnits = units.map((unitPart) =>
        unitPart.toLowerCase() === "cal" ? "J" : unitPart
      );
      const selections = units.reduce(
        (map: Record<string, string[]>, unit, index) => {
          const possibilities = convert()
            .from(safeUnits[index])
            .possibilities();
          if (possibilities.includes("J") || safeUnits[index] === "J") {
            possibilities.push("cal");
          }
          map[unit] = Array.from(new Set([unit, ...possibilities.filter((x: string) => !unitsToExclude.includes(x))]));
          return map;
        },
        {}
      );
      return selections;
    },
    [parseUnit]
  );

  const setPreferredUnit = useCallback(
    (field: string, unit: string, preferredUnitKey?: string) => {
      dispatch({
        type: "SET_PREFERRED_UNIT",
        payload: {
          field,
          unit,
          preferredUnitKey,
        },
      });
    },
    [dispatch]
  );

  const renameTempPreferredUnits = useCallback(
    (key?: string) => {
      dispatch({
        type: "RENAME_TEMP_PREFERRED_UNITS",
        payload: key,
      });
    },
    [dispatch]
  );

  const createColumn = useCallback(
    ({
      name,
      label,
      options = {},
      maxDecPlaces = DEFAULT_MAX_DECIMAL_PLACES,
      preferredUnitKeyField,
    }: {
      name: string;
      label: string;
      options?: DataTableColumnOptions;
      maxDecPlaces?: number;
      preferredUnitKeyField?: string;
    }) => {
      return {
        name,
        label,
        options: {
          customBodyRender: (value: number, meta: DataTableMeta) => {
            const preferredUnitKey = getRowData(meta.rowData)[
              preferredUnitKeyField
            ];
            const { value: convertedValue, unit } = convertToPreferredUnit(
              name,
              value,
              preferredUnitKey
            );
            const roundedValue = typeof convertedValue === "number"
              ? Number(Number(convertedValue).toFixed(maxDecPlaces))
              : null;
            const output = roundedValue !== null ? `${roundedValue} (${unit})` : "";
            return output;
          },
          ...columnOptions.options,
          ...options,
        },
      };
    },
    [convertToPreferredUnit]
  );

  const generateColumnsFromInputs = useCallback(
    (inputList: FormInputOptions[]) => {
      const filteredInputs = inputList.filter(
        (input) => !input.excludeFromColumns
      );
      return filteredInputs.map((input) => {
        return input.type === "numberWithUnits"
          ? createColumn({
              name: input.name,
              label: input.label,
              maxDecPlaces: input.maxDecPlaces,
              options: input.tableOptions,
              preferredUnitKeyField: input.preferredUnitKeyField,
            })
          : {
              name: input.name,
              label: input.label,
              options: input.tableOptions,
            };
      });
    },
    [createColumn]
  );

  const memoizedPreferredUnits = deepMemoize(
    globalState?.preferredUnits,
    "preferredUnits"
  );

  return {
    parseUnit,
    createConvertFunction,
    convertToPreferredUnit,
    getPreferredOrDefaultUnit,
    getAltUnitSelections,
    setPreferredUnit,
    renameTempPreferredUnits,
    createColumn,
    generateColumnsFromInputs,
    UNIT_DEFAULTS: unitDefaults,
    preferredUnits: memoizedPreferredUnits,
  };
};

export default useConvertUnits;
