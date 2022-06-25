import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useLatest } from "./useLatest";

export function useElevatedState<T>(
  inputValue: T,
  onChange: (updatedValue: T) => void,
  debounce = 1000
) {
  const [currentValue, setCurrentValue] = useState(inputValue);
  const elevateChange = useDebouncedCallback(onChange, debounce);

  const latest = useLatest({ currentValue, inputValue, onChange });

  const handleUnmount = useCallback(() => {
    const { currentValue, inputValue, onChange } = latest.current;
    if (currentValue !== inputValue) {
      onChange(currentValue);
    }
  }, [latest]);

  const setValue = useCallback(
    (value: T) => {
      setCurrentValue(value);
      elevateChange(value);
    },
    [elevateChange]
  );

  useEffect(() => setCurrentValue(inputValue), [inputValue]);
  useEffect(() => handleUnmount, [handleUnmount]);

  return [currentValue, setValue] as const;
}
