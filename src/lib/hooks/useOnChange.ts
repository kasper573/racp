import { useEffect, useRef } from "react";
import { useLatest } from "./useLatest";

export function useOnChange<T>(
  mostRecentValue: T,
  isEqual: <T>(a: T, b: T) => boolean,
  onChange: (value: T) => void
) {
  const prevValueRef = useRef<T>(mostRecentValue);
  const latest = useLatest({ isEqual, onChange });
  useEffect(() => {
    const { isEqual, onChange } = latest.current;
    if (!isEqual(prevValueRef.current, mostRecentValue)) {
      onChange(mostRecentValue);
    }
    prevValueRef.current = mostRecentValue;
  }, [mostRecentValue, latest]);
}
