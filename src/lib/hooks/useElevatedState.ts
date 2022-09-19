import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useLatest } from "./useLatest";

export interface UseElevatedStateProps<T> {
  value: T;
  onChange: (updatedValue: T) => void;
  updateDelay?: number;
}

export function useElevatedState<T>({
  value: inputValue,
  onChange,
  updateDelay = 250,
}: UseElevatedStateProps<T>) {
  const [currentValue, setCurrentValue] = useState(inputValue);
  const elevateChange = useDebouncedCallback(onChange, updateDelay);

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
