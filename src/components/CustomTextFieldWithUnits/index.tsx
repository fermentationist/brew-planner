import UnitSelector from "../UnitSelector";
import CustomNumberField, {CustomNumberFieldProps} from "../CustomNumberField";
import { ChangeEvent, useRef, memo, useMemo } from "react";
import useConvertUnits from "../../hooks/useConvertUnits";

export interface CustomTextFieldWithUnitsProps extends CustomNumberFieldProps {
  callback?: (value: any) => any;
}

const CustomTextFieldWithUnits = (props: CustomTextFieldWithUnitsProps) => {
  const {
    setPreferredUnit,
    convertToPreferredUnit,
    getConversionFunction,
    parseUnit,
    getAltUnitSelections,
    preferredUnits,
  } = useConvertUnits();
  const { value: initialDefaultValue, unit: initialDefaultUnit } =
    convertToPreferredUnit(props.name, props.defaultValue);
  const memoizedInitialDefaultValue = useMemo(() => initialDefaultValue, []);
  const defaultValue = memoizedInitialDefaultValue;
  const defaultUnit = initialDefaultUnit;
  const unitSelections = useMemo(
    () => getAltUnitSelections(initialDefaultUnit),
    []
  );
  const label = `${
    props.internalLabel || props.label || props.name
  } (${initialDefaultUnit})`;
  const valueRef = useRef(memoizedInitialDefaultValue);
  const unitRef = useRef(preferredUnits[props.name]);

  const callOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const conversionFn = getConversionFunction(props.name);
    const convertedValue = conversionFn(value);
    valueRef.current = Number(value);
    props.callback && props.callback(convertedValue);
    return props.onChange && props.onChange(event);
  };

  const callSetPreferredUnit = (unit: string) => {
    unitRef.current = unit;
    setPreferredUnit(props.name, unit);
  };

  return (
    <>
      <CustomNumberField
        internalLabel={label}
        name={props.name}
        step={props.step}
        width={props.width}
        defaultValue={defaultValue}
        onChange={callOnChange}
        onBlur={props.onBlur}
        id={`field-with-units-${props.name}`}
      />
      &nbsp;
      <UnitSelector
        selections={unitSelections}
        defaultUnit={defaultUnit}
        setPreferredUnit={callSetPreferredUnit}
        parseUnit={parseUnit}
        callback={() => {
          const conversionFn = getConversionFunction(
            props.name,
            unitRef?.current
          );
          const convertedValue = conversionFn(valueRef?.current);
          console.log(`convertedValue for ${props.name}`, convertedValue);
          return props.callback && props.callback(convertedValue);
        }}
      />
    </>
  );
};

export default memo(CustomTextFieldWithUnits, () => true);
