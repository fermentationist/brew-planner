import useConvertUnits from "./useConvertUnits";
import { DataTableColumnOptions, columnOptions, DataTableMeta, getRowData } from "../components/DataTable";
import { FormInputOptions } from "../components/FormModal";

const DEFAULT_MAX_DECIMAL_PLACES = 2;

const useCreateColumnsWithUnitConversion = () => {
  const { convertToPreferredUnit } =
    useConvertUnits();

  const createColumn = ({
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
          const preferredUnitKey = getRowData(meta.rowData)[preferredUnitKeyField];
          const { value: convertedValue, unit } = convertToPreferredUnit(name, value, preferredUnitKey);
          const roundedValue = convertedValue ? Number(Number(convertedValue).toFixed(maxDecPlaces)) : null;
          return roundedValue && `${roundedValue} (${unit})`;
        },
        ...columnOptions.options,
        ...options,
      },
    };
  };

  const generateColumnsFromInputs = (inputList: FormInputOptions[]) => {
    return inputList.map((input) => {
      return input.type === "numberWithUnits"
        ? createColumn({
            name: input.name,
            label: input.label,
            maxDecPlaces: input.maxDecPlaces,
            options: input.tableOptions,
            preferredUnitKeyField: input.preferredUnitKeyField
          })
        : { name: input.name, label: input.label, options: input.tableOptions };
    });
  };
  return { createColumn, generateColumnsFromInputs };
};

export default useCreateColumnsWithUnitConversion;
