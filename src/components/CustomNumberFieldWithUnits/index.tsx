import { memo, useState, forwardRef, Ref, ChangeEvent } from "react";
import UnitSelector from "../UnitSelector";
import PseudoNumberField, {
  PseudoNumberFieldProps,
} from "../PseudoNumberField";
import { FocusEvent, useRef, useMemo } from "react";
import useConvertUnits from "../../hooks/useConvertUnits";
import styled from "styled-components";

export interface CustomNumberFieldWithUnitsProps
  extends PseudoNumberFieldProps {
  callback?: (value: any, callRHFSetValueFn?: boolean) => any;
  convertOnUnitChange?: boolean;
  maxDecPlaces?: number;
  preferredUnitKey?: string;
  unitsToExclude?: string[];
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  /* align-items: flex-end; */
  place-content: baseline;
  margin: 0;
`;

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
    }, [initialDefaultValue, props.maxDecPlaces]);
    
    const memoizedInitialDefaultUnit = useMemo(() => initialDefaultUnit, [initialDefaultUnit]);
    const [controlledValue, setControlledValue] = useState<number | string>(
      memoizedInitialDefaultValue
    );

    const memoizedUnitSelections = useMemo(
      () => {
        return getAltUnitSelections(memoizedInitialDefaultUnit, props.unitsToExclude)
      },
      [memoizedInitialDefaultUnit, props.unitsToExclude, getAltUnitSelections]
    );

    const label = `${
      props.internalLabel || props.label || props.name
    } (${initialDefaultUnit})`;
    
    const valueRef = useRef(memoizedInitialDefaultValue);
    const unitRef = useRef(memoizedInitialDefaultUnit);

    const callOnChange = (event: ChangeEvent<HTMLInputElement>) => {
      const target = event.target as HTMLInputElement;
      const value = target.value;
      const convertFn = createConvertFunction("canonical", unitRef?.current);
      const { value: convertedValue } = convertFn(props.name, Number(value), props.preferredUnitKey);
      const newValue =
        props.maxDecPlaces ?? null
          ? Number(Number(convertedValue).toFixed(props.maxDecPlaces))
          : convertedValue;
      valueRef.current = value;
      setControlledValue(value);
      props.callback && props.callback(newValue, false);
      return props.onChange && props.onChange(event);
    };

    const callSetPreferredUnit = (unit: string) => {
      // create a function to convert the previous unit to canonical
      const prevUnitToCanonical = createConvertFunction(
        "canonical",
        unitRef.current // previous unit    
      );
      // convert previous value to canonical value
      const { value: canonicalValue } = prevUnitToCanonical(
        props.name,
        valueRef.current,
        props.preferredUnitKey
      );
      // check if we need to convert the canonical value to the new unit
      if (props.convertOnUnitChange) {
        // create a function to convert the canonical value to the new unit
        const canonicalToNewUnit = createConvertFunction("preferred", unit);
        // convert the canonical value to the new unit
        const { value: convertedValue } = canonicalToNewUnit(
          props.name,
          canonicalValue,
          props.preferredUnitKey
        );
        // apply rounding if necessary
        const newConvertedValue =
          convertedValue && (props.maxDecPlaces ?? null)
            ? Number(Number(convertedValue).toFixed(props.maxDecPlaces))
            : Number(convertedValue);
        // update the valueRef and controlledValue, this will cause the new, converted value to be displayed in the input
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
        convertOnUnitChange={props.convertOnUnitChange}
      />
    );
  }
);

interface InternalComponentProps extends CustomNumberFieldWithUnitsProps {
  label: string;
  controlledValue: number | string;
  unitSelections: Record<string, string[]>;
  defaultUnit: string;
  parseUnit: (unit: string) => string[][];
  setPreferredUnit: (unit: string) => void;
  convertOnUnitChange?: boolean;
}

const InternalComponent = forwardRef(
  (props: InternalComponentProps, forwardedRef: Ref<any>) => {
    // forceCollapseUnitsValue - this awkwardly named value is used to force the UnitSelector to re-render when the input is focused. It will either have a null value or else a randomly generated number. This is used instead of a boolean because we can change from one truthy value to a different truthy value, to force a re-render.
    const forceCollapseUnitsRef = useRef<number | null>(null);
    const [forceCollapseUnitsValue, setForceCollapseUnitsValue] = useState<number | null>(forceCollapseUnitsRef.current);
    const onFocus = (event: FocusEvent<HTMLInputElement>) => {
      const rnd = Math.random();
      forceCollapseUnitsRef.current = (rnd);
      setForceCollapseUnitsValue(rnd);
      props.onFocus && props.onFocus(event);
    }
    return (
      <Container>
        <PseudoNumberField
          internalLabel={props.label}
          name={props.name}
          step={props.step}
          width={props.width}
          defaultValue={props.defaultValue}
          onChange={props.onChange}
          onFocus={onFocus}
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
          forceCollapseUnitsValue={forceCollapseUnitsValue}
        />
      </Container>
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
