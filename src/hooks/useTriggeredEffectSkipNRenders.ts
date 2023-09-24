import { useCallback, useEffect, useRef } from "react";

// will behave like useEffect, except will not automatically run on initial render
const useTriggeredEffectSkipNRenders = (fn: () => void, nRendersToSkip: number, dependencies: any[]) => {
  const memoizedFn = useCallback(fn, [])
  const didMountRef = useRef(nRendersToSkip);
  useEffect(() => {
    if (didMountRef.current < 1) { 
      memoizedFn();
    } else {
      didMountRef.current -= 1;
    }
  }, [...dependencies, memoizedFn]);
}

export default useTriggeredEffectSkipNRenders;
