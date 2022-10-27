import { useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { Item } from "../../../api/services/item/types";
import { trpc } from "../../state/client";
import { ItemIdentifier } from "../../components/ItemIdentifier";

export function ItemPicker({
  onPicked,
}: {
  onPicked: (items: Item[]) => void;
}) {
  const [value, setValue] = useState<Item[]>([]);
  const [inputValue, setInputValue] = useState("");
  const { data: { entities: options = [] } = {}, isFetching: isSearching } =
    trpc.item.search.useQuery(
      {
        filter: {
          Name: { value: inputValue, matcher: "contains" },
        },
      },
      { enabled: !!inputValue }
    );
  return (
    <Autocomplete
      sx={{ width: "100%" }}
      getOptionLabel={(option) => option.Name}
      filterOptions={(x) => x}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      clearOnBlur
      clearOnEscape
      value={value}
      multiple
      noOptionsText={
        isSearching
          ? ""
          : inputValue
          ? `No items matching "${inputValue}" `
          : "Enter the name of the item you want to hunt"
      }
      onChange={(event, picked: Item[]) => {
        setValue([]);
        onPicked(picked);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label="Add an item to hunt" fullWidth />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.Id}>
          <ItemIdentifier item={option} />
        </li>
      )}
    />
  );
}
