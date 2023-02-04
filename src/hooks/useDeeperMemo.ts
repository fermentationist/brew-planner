import { useRef } from "react";
import { stringifyObjectWithFunctions } from "../utils/helpers";

// will not work properly if object contains circular references (which cannot be serialized by JSON.stringify, and will cause an error). Stringification of functions is limited to the root level of the object being memoized
const useDeeperMemo = ({stringifyFunctions = false} = {}) => {
  const memoRef: Record<string, any> = useRef({});
  // if using for more than one object in the same component, it is necessary to use a unique key with the memoize function
  const stringifyFn = stringifyFunctions ? stringifyObjectWithFunctions : JSON.stringify;

  const memoize = (objectToMemoize: object, key?: string) => {
    const newObjectString = stringifyFn(objectToMemoize);
    const oldObjectString = stringifyFn(key ? memoRef.current[key] : memoRef.current);
    if (newObjectString === oldObjectString) {
      return key ? memoRef.current[key] : memoRef.current;
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
