import {useState} from "react";
import UnitSelector from "../UnitSelector";
import CustomNumberField, {
  CustomNumberFieldProps,
} from "../CustomNumberField";
import { ChangeEvent, useRef, useMemo } from "react";
import useConvertUnits from "../../hooks/useConvertUnits";

export interface CustomNumberFieldWithUnitsProps
  extends CustomNumberFieldProps {
  callback?: (value: any) => any;
  convertOnUnitChange?: boolean;
  maxDecPlaces?: number;
}

const CustomNumberFieldWithUnits = (props: CustomNumberFieldWithUnitsProps) => {
  const {
    setPreferredUnit,
    convertToPreferredUnit,
    createConvertFunction,
    parseUnit,
    getAltUnitSelections,
    preferredUnits,
  } = useConvertUnits();

  const { value: initialDefaultValue, unit: initialDefaultUnit } =
  convertToPreferredUnit(props.name, props.defaultValue ?? props.value);

  const memoizedInitialDefaultValue = useMemo(() => {
    return initialDefaultValue && (props.maxDecPlaces ?? null) ? Number(initialDefaultValue.toFixed(props.maxDecPlaces)) : initialDefaultValue;
  }, []);

  const [controlledValue, setControlledValue] = useState(memoizedInitialDefaultValue);

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
    const value = Number(target.value);
    const convertFn = createConvertFunction("canonical", unitRef?.current);
    const { value: convertedValue } = convertFn(props.name, value);
    const newValue = (props.maxDecPlaces ?? null) ? Number(convertedValue.toFixed(props.maxDecPlaces)) : convertedValue;
    valueRef.current = value;
    setControlledValue(value);
    props.callback && props.callback(newValue);
    return props.onChange && props.onChange(event);
  };

  const callSetPreferredUnit = (unit: string) => {
    const convertToCanonical = createConvertFunction(
      "canonical",
      unitRef.current // previous unit
    );
    const { value: canonicalValue } = convertToCanonical(
      props.name,
      valueRef.current
    );
    if (props.convertOnUnitChange) {
      const convertToNewUnit = createConvertFunction("preferred", unit);
      const { value: convertedValue } = convertToNewUnit(
        props.name,
        canonicalValue
      );
      const newConvertedValue = (props.maxDecPlaces ?? null) ? Number(convertedValue.toFixed(props.maxDecPlaces)) : convertedValue;
      valueRef.current = newConvertedValue;
      setControlledValue(newConvertedValue);
    }
    unitRef.current = unit; // update with new unit
    setPreferredUnit(props.name, unit);
    const newCanonicalValue = (props.maxDecPlaces ?? null) ? Number(canonicalValue.toFixed(props.maxDecPlaces)) : canonicalValue;
    props.callback && props.callback(newCanonicalValue);
  };

  return (
    <>
      <CustomNumberField
        internalLabel={label}
        name={props.name}
        step={props.step}
        width={props.width}
        defaultValue={memoizedInitialDefaultValue}
        onChange={callOnChange}
        onBlur={props.onBlur}
        id={`number-field-with-units-${props.name}`}
        disabled={props.disabled}
        className={
          props.className
            ? `${props.className} ${props.className}-number-field`
            : ""
        }
        {...(props.convertOnUnitChange
          ? { value: controlledValue, defaultValue: void 0 }
          : {})}
      />
      &nbsp;
      <UnitSelector
        selections={unitSelections}
        defaultUnit={initialDefaultUnit}
        setPreferredUnit={callSetPreferredUnit}
        parseUnit={parseUnit}
        className={
          props.className
            ? `${props.className} ${props.className}-unit-selector`
            : ""
        }
      />
    </>
  );
};

export default CustomNumberFieldWithUnits;
