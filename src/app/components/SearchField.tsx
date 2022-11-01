import { ComponentProps, ComponentType, Key, ReactNode, useState } from "react";
import { Autocomplete, Box, Popper, TextField } from "@mui/material";
import { LoadingSpinner } from "./LoadingSpinner";

export function SearchField<T>({
  label,
  value,
  optionKey,
  optionLabel,
  renderOption,
  startSearchingMessage,
  noResultsText = (searchQuery) => `No results matching "${searchQuery}"`,
  useQuery,
  onSelected,
  ...props
}: {
  value?: T[];
  optionKey: (option: T) => Key;
  optionLabel: (option: T) => string;
  renderOption: (option: T) => JSX.Element;
  label?: ReactNode;
  startSearchingMessage?: ReactNode;
  noResultsText?: (searchQuery: string) => ReactNode;
  useQuery: (searchQuery: string) => { data?: T[]; isLoading: boolean };
  onSelected: (selected: T[]) => void;
  size?: "small" | "medium";
  PopperComponent?: ComponentType<ComponentProps<typeof Popper>>;
} & Pick<ComponentProps<typeof Box>, "sx" | "style" | "className">) {
  const [localValue, setLocalValue] = useState<T[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: options = [], isLoading } = useQuery(searchQuery);
  return (
    <Autocomplete
      {...props}
      getOptionLabel={(option) => optionLabel(option)}
      filterOptions={(x) => x}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      clearOnBlur
      loading={isLoading}
      loadingText={<LoadingSpinner variant="linear" />}
      clearOnEscape
      value={value ?? localValue}
      multiple
      noOptionsText={
        isLoading
          ? ""
          : searchQuery
          ? noResultsText(searchQuery)
          : startSearchingMessage
      }
      onChange={(event, selected: T[]) => {
        setLocalValue([]);
        onSelected(selected);
      }}
      onInputChange={(event, newInputValue) => {
        setSearchQuery(newInputValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} fullWidth />
      )}
      renderOption={(props, option) => (
        <li {...props} key={optionKey(option)}>
          {renderOption(option)}
        </li>
      )}
    />
  );
}
