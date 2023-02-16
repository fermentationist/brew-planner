import convert from "convert-units";
import { useCallback, useMemo } from "react";
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
  const [globalState, setGlobalState] = useGlobalState();
  const deepMemoize = useDeeperMemo();

  const parseUnit = useCallback((unit: string) => {
    const units = unit.split(/[/*]/g);
    const operators = unit.split(/\w+/g).filter((x) => ["/", "*"].includes(x));
    return [units, operators];
  }, []);

  const getPreferredOrDefaultUnit = useCallback(
    (field: string, preferredUnitKey?: string) =>
      (preferredUnitKey
        ? globalState?.preferredUnits?.[preferredUnitKey]?.[field]
        : globalState?.preferredUnits?.[field]) || unitDefaults[field]?.default,
    [globalState]
  );

  const createConvertFunction = useCallback(
    (target: "canonical" | "preferred", preferredUnitParam?: string) =>
      (
        field: string,
        stringOrNumber: string | number,
        preferredUnitKey?: string
      ) => {
        const value =
          (stringOrNumber ?? "") && (Number(stringOrNumber) as number | "");
        const canonicalTarget = target === "canonical";
        const canonicalUnit = unitDefaults[field]?.canonical;
        const preferredUnit =
          preferredUnitParam ||
          getPreferredOrDefaultUnit(field, preferredUnitKey);
        if (!field || !(stringOrNumber ?? false)) {
          // (stringOrNumber ?? false) allows for stringOrNumber to be 0
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

  const convertToPreferredUnit = createConvertFunction("preferred");

  const getAltUnitSelections = useCallback(
    (unit: string) => {
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
          map[unit] = Array.from(new Set([unit, ...possibilities]));
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
      setGlobalState((prevState: any) => {
        let newState;
        if (preferredUnitKey) {
          newState = {
            ...prevState,
            preferredUnits: {
              ...(prevState.preferredUnits || {}),
              [preferredUnitKey]: {
                ...(prevState.preferredUnits?.[preferredUnitKey] || {}),
                [field]: unit,
              },
            },
          };
        } else {
          newState = {
            ...prevState,
            preferredUnits: {
              ...(prevState.preferredUnits || {}),
              [field]: unit,
            },
          };
        }
        console.log("\n\nnewState:", newState);
        console.log("\n");
        return newState;
      });
    },
    [setGlobalState]
  );

  const renameTempPreferredUnits = useCallback(
    (key?: string) => {
      setGlobalState((prevState: any) => {
        const newState = {
          ...prevState,
          preferredUnits: {
            ...(prevState.preferredUnits || {}),
          },
        };
        if (key) {
          newState.preferredUnits[key] = prevState.preferredUnits?.temp;
        }
        newState.preferredUnits.temp && delete newState.preferredUnits.temp;
        return newState;
      });
    },
    [setGlobalState]
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
            const roundedValue = convertedValue
              ? Number(Number(convertedValue).toFixed(maxDecPlaces))
              : null;
            return roundedValue && `${roundedValue} (${unit})`;
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
      return inputList.map((input) => {
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

  const memoizedPreferredUnits = deepMemoize(globalState?.preferredUnits, "preferredUnits");

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
    unitDefaults,
    preferredUnits: memoizedPreferredUnits,
  };
};

export default useConvertUnits;
