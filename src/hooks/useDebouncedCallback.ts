import { useCallback, useRef } from "react";
import { DependencyList } from "react";

function useDebouncedCallback<T extends Function>(
  callback: T,
  wait: number,
  deps: DependencyList
): T {
  let h = useRef(0);
  const callable = useCallback((...args: any) => {
    h.current && clearTimeout(h.current);
    h.current = setTimeout(() => callback(...args), wait) as unknown as number;
  }, deps);

  return <T>(<any>callable);
}

export default useDebouncedCallback;
