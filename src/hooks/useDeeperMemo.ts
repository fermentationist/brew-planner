import { useRef } from "react";
import {
  stringDiff,
  stringifyObjectWithFunctions as stringify,
} from "../utils/helpers";

// will not work properly if object contains circular references (which cannot be serialized by JSON.stringify, and will cause an error). Stringification of functions is limited to the root level of the object being memoized
const useDeeperMemo = () => {
  const memoRef: Record<string, any> = useRef({});
  // if using for more than one object in the same component, it is necessary to use a unique key with the memoize function
  const memoize = (
    objectToMemoize: object,
    key?: string,
    options?: {
      keysToExclude?: string[];
      stringifyFunctions?: boolean;
    } 
  ) => {
    const newObjectString = stringify(objectToMemoize, {
      keysToExclude: options?.keysToExclude || [],
      stringifyFunctions: options?.stringifyFunctions || false,
    });
    const oldObjectString = stringify(
      key ? memoRef.current?.[key] : memoRef.current,
      { keysToExclude: options?.keysToExclude || [], stringifyFunctions: options?.stringifyFunctions || false}
    );
    if (newObjectString === oldObjectString) {
      return key ? memoRef.current?.[key] : memoRef.current;
    }
    if (key) {
      memoRef.current[key] = objectToMemoize;
    } else {
      memoRef.current = objectToMemoize;
    }
    return objectToMemoize;
  };
  return memoize;
};

export default useDeeperMemo;
