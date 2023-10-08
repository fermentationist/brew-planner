import {
  forwardRef,
  Ref,
  useState,
  KeyboardEventHandler,
  useEffect,
  ReactEventHandler
} from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";


export interface CustomAutocompleteProps {
  label?: string;
  name?: string;
  options: any[];
  callback?: (newValue: any, callRHFSetValueFn?: boolean) => void;
  defaultValue?: string | number;
  getOptionLabel?: (option: any) => string;
  restricted?: boolean;
  className?: string;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  optionKey?: string;
  width?: string;
  ref?: Ref<any>;
}

const CustomAutocomplete = forwardRef(
  (
    {
      label,
      name,
      options,
      callback,
      defaultValue,
      getOptionLabel,
      restricted,
      className,
      onKeyDown,
      optionKey,
      width
    }: CustomAutocompleteProps,
    forwardedRef: Ref<any>
  ) => {
    const [value, setValue] = useState(defaultValue ?? void 0);
    useEffect(() => {
      // if in restricted mode, clear input if value is no longer included in options (when options change)
      const selections = optionKey
        ? options.map(option => option[optionKey])
        : options;
      if (restricted && !selections.includes(value)) {
        setValue(void 0);
        callback(void 0);
      }
    }, [options, optionKey, restricted, value, callback]);

    const onInput: ReactEventHandler<HTMLInputElement> = event => {
      const target = event.target as HTMLInputElement;
      const newValue = target.value;
      setValue(newValue);
      if (callback) {
        callback(newValue, true);
      }
    };

    const defaultGetOptionLabel = (option: any) => {
      if (["string", "number"].includes(typeof option)) {
        return String(option);
      }
      if (optionKey) {
        return option[optionKey];
      }
      return option.title;
    };

    const renderInput = (params: any) => {
      return (
        <TextField
          {...params}
          label={label}
          name={name}
          InputProps={params.InputProps}
          className={className}
        />
      );
    };
    return (
      <Autocomplete
        freeSolo={!restricted}
        value={value}
        options={options}
        selectOnFocus={true}
        renderInput={renderInput}
        ref={forwardedRef}
        onInput={onInput}
        onSelect={onInput}
        defaultValue={defaultValue}
        getOptionLabel={getOptionLabel || defaultGetOptionLabel}
        onKeyDown={onKeyDown}
        sx={{ width }}
      />
    );
  }
);

export default CustomAutocomplete;
