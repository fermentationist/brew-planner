import { memo, useState, forwardRef, Ref } from "react";
import UnitSelector from "../UnitSelector";
import CustomNumberField, {
  CustomNumberFieldProps,
} from "../CustomNumberField";
import { ChangeEvent, useRef, useMemo } from "react";
import useConvertUnits from "../../hooks/useConvertUnits";

export interface CustomNumberFieldWithUnitsProps
  extends CustomNumberFieldProps {
  callback?: (value: any, callRHFSetValueFn?: boolean) => any;
  convertOnUnitChange?: boolean;
  maxDecPlaces?: number;
  preferredUnitKey?: string;
}

// split into an inner and an outer component. The inner component is memoized to prevent it from re-rendering, unless the preferredUnit for the specific field is updated in globalState
const CustomNumberFieldWithUnits = forwardRef(
  (props: CustomNumberFieldWithUnitsProps, forwardedRef: Ref<any>) => {
    const {
      setPreferredUnit,
      convertToPreferredUnit,
      createConvertFunction,
      parseUnit,
      getAltUnitSelections,
    } = useConvertUnits();
    const { value: initialDefaultValue, unit: initialDefaultUnit } =
      convertToPreferredUnit(props.name, props.defaultValue ?? props.value, props.preferredUnitKey);
    const memoizedInitialDefaultValue = useMemo(() => {
      return initialDefaultValue && (props.maxDecPlaces ?? null)
        ? Number(Number(initialDefaultValue).toFixed(props.maxDecPlaces))
        : initialDefaultValue;
    }, []);
    const memoizedInitialDefaultUnit = useMemo(() => initialDefaultUnit, []);
    const [controlledValue, setControlledValue] = useState<number | "">(
      memoizedInitialDefaultValue
    );

    const memoizedUnitSelections = useMemo(
      () => getAltUnitSelections(memoizedInitialDefaultUnit),
      []
    );
    
    const label = `${
      props.internalLabel || props.label || props.name
    } (${initialDefaultUnit})`;
    const valueRef = useRef(memoizedInitialDefaultValue);
    const unitRef = useRef(memoizedInitialDefaultUnit);

    const callOnChange = (event: ChangeEvent<HTMLInputElement>) => {
      const target = event.target as HTMLInputElement;
      const value = Number(target.value);
      const convertFn = createConvertFunction("canonical", unitRef?.current);
      console.log("props.preferredUnitKey in callOnChange:", props.preferredUnitKey)
      const { value: convertedValue } = convertFn(props.name, value, props.preferredUnitKey);
      const newValue =
        props.maxDecPlaces ?? null
          ? Number(Number(convertedValue).toFixed(props.maxDecPlaces))
          : convertedValue;
      valueRef.current = value;
      setControlledValue(value);
      props.callback && props.callback(newValue, props.convertOnUnitChange);
      return props.onChange && props.onChange(event);
    };

    const callSetPreferredUnit = (unit: string) => {
      console.log("props.preferredUnitKey in callSetPreferredUnit:", props.preferredUnitKey)
      const prevUnitToCanonical = createConvertFunction(
        "canonical",
        unitRef.current // previous unit    
      );
      const { value: canonicalValue } = prevUnitToCanonical(
        props.name,
        valueRef.current,
        props.preferredUnitKey
      );
      if (props.convertOnUnitChange) {
        const canonicalToNewUnit = createConvertFunction("preferred", unit);
        const { value: convertedValue } = canonicalToNewUnit(
          props.name,
          canonicalValue,
          props.preferredUnitKey
        );
        const newConvertedValue =
          convertedValue && (props.maxDecPlaces ?? null)
            ? Number(Number(convertedValue).toFixed(props.maxDecPlaces))
            : Number(convertedValue);
        valueRef.current = newConvertedValue;
        setControlledValue(newConvertedValue);
      }
      const newUnitToCanonical = createConvertFunction("canonical", unit);
      const { value: updatedCanonicalValue } = newUnitToCanonical(
        props.name,
        valueRef.current,
        props.preferredUnitKey
      );
      unitRef.current = unit; // update with new unit
      setPreferredUnit(props.name, unit, props.preferredUnitKey);
      const newCanonicalValue =
        updatedCanonicalValue && (props.maxDecPlaces ?? null)
          ? Number(Number(updatedCanonicalValue).toFixed(props.maxDecPlaces))
          : Number(updatedCanonicalValue);
      props.callback &&
        props.callback(newCanonicalValue, props.convertOnUnitChange);
    };
    return (
      <MemoizedInternalComponent
        {...props}
        defaultValue={memoizedInitialDefaultValue}
        onChange={callOnChange}
        label={label}
        controlledValue={controlledValue}
        unitSelections={memoizedUnitSelections}
        defaultUnit={memoizedInitialDefaultUnit}
        setPreferredUnit={callSetPreferredUnit}
        parseUnit={parseUnit}
        ref={forwardedRef}
      />
    );
  }
);

interface InternalComponentProps extends CustomNumberFieldWithUnitsProps {
  label: string;
  controlledValue: number | "";
  unitSelections: Record<string, string[]>;
  defaultUnit: string;
  parseUnit: (unit: string) => string[][];
  setPreferredUnit: (unit: string) => void;
}

const InternalComponent = forwardRef(
  (props: InternalComponentProps, forwardedRef: Ref<any>) => {
    return (
      <>
        <CustomNumberField
          internalLabel={props.label}
          name={props.name}
          step={props.step}
          width={props.width}
          defaultValue={props.defaultValue}
          onChange={props.onChange}
          onBlur={props.onBlur}
          id={`number-field-with-units-${props.name}`}
          disabled={props.disabled}
          ref={forwardedRef}
          className={
            props.className
              ? `${props.className} ${props.className}-number-field`
              : ""
          }
          {...(props.convertOnUnitChange
            ? { value: props.controlledValue, defaultValue: void 0 }
            : {})}
        />
        &nbsp;
        <UnitSelector
          selections={props.unitSelections}
          defaultUnit={props.defaultUnit}
          setPreferredUnit={props.setPreferredUnit}
          parseUnit={props.parseUnit}
          className={
            props.className
              ? `${props.className} ${props.className}-unit-selector`
              : ""
          }
        />
      </>
    );
  }
);

const MemoizedInternalComponent = memo(
  InternalComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.controlledValue === nextProps.controlledValue &&
      prevProps.label === nextProps.label &&
      prevProps.defaultUnit === nextProps.defaultUnit
    );
  }
);

export default memo(CustomNumberFieldWithUnits, (prevProps, nextProps) => {
  return prevProps.defaultValue === nextProps.defaultValue;
});
