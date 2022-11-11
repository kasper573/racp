import { useEffect } from "react";
import { ItemFilter, itemFilter } from "../../api/services/item/types";
import { trpc } from "../state/client";
import { typedKeys } from "../../lib/std/typedKeys";
import { Select } from "../controls/Select";
import { SliderMenu } from "../controls/SliderMenu";
import { TextField } from "../controls/TextField";
import { useLatest } from "../../lib/hooks/useLatest";
import { matcher } from "../../api/matcher";
import { useZodMatcherForm } from "../../lib/zod/useZodMatcherForm";
import { RangeFields } from "../controls/RangeFields";

export function ItemSearchFilterForm({
  value,
  onChange,
  showPriceFields,
}: FormDataProps & { showPriceFields?: boolean }) {
  const field = useZodMatcherForm({
    matcher,
    schema: itemFilter.type,
    value,
    onChange,
  });
  const { data: meta } = trpc.meta.read.useQuery();
  const [emptySubTypeExplanation, itemSubTypes] = useSubTypeBehavior({
    value,
    onChange,
  });

  return (
    <>
      <TextField
        debounce
        label="ID"
        type="number"
        optional
        {...field("Id", "=")}
      />
      <TextField
        debounce
        label="Name"
        optional
        {...field("Name", "contains")}
      />
      <Select
        label="Primary Type"
        multi
        options={typedKeys(meta?.types)}
        {...field("Type", "oneOf")}
      />
      <Select
        label="Subtype"
        multi
        options={itemSubTypes}
        empty={emptySubTypeExplanation}
        {...field("SubType", "oneOf")}
      />
      <Select
        label="Location"
        multi
        options={meta?.locations}
        {...field("Locations", "enabled")}
      />
      <Select
        label="Class"
        multi
        options={meta?.classes}
        {...field("Classes", "enabled")}
      />
      <Select
        label="Job"
        multi
        options={meta?.jobs}
        {...field("Jobs", "enabled")}
      />
      <Select
        label="Element"
        multi
        options={meta?.elements}
        {...field("Elements", "includesSomeString")}
      />
      <Select
        label="Status"
        multi
        options={meta?.statuses}
        {...field("Statuses", "includesSomeString")}
      />
      <Select
        label="Race"
        multi
        options={meta?.races}
        {...field("Races", "includesSomeString")}
      />
      <TextField
        debounce
        label="Description contains"
        optional
        {...field("DescriptionList", "someItemContains")}
      />
      <TextField
        debounce
        label="Script contains"
        optional
        {...field("ScriptList", "someItemContains")}
      />
      <SliderMenu
        ranged
        label="Slots"
        max={meta?.maxSlots}
        {...field("Slots", "between")}
      />
      <RangeFields label="Sell Value" {...field("Sell", "between")} />
      {showPriceFields && (
        <RangeFields label="Buy Price" {...field("Buy", "between")} />
      )}
    </>
  );
}

interface FormDataProps {
  value: ItemFilter;
  onChange: (changed: ItemFilter) => void;
}

function useSubTypeBehavior({ value, onChange }: FormDataProps) {
  const { data: meta } = trpc.meta.read.useQuery();

  // Empty subtype filter whenever primary type is emptied
  const latest = useLatest({ onChange, value });
  const numSelectedTypes = count(value.Type?.value);
  useEffect(() => {
    const { onChange, value } = latest.current;
    if (numSelectedTypes <= 1) {
      onChange({ ...value, SubType: undefined });
    }
  }, [numSelectedTypes, latest]);

  if (!meta) {
    return ["Waiting for data"] as const;
  } else if (!count(value.Type?.value)) {
    return ["Select a primary type to enable subtypes"] as const;
  } else if (count(value.Type?.value) > 1) {
    return ["Please select only one primary type to enable subtypes"] as const;
  }

  const selectedType = value.Type?.value?.[0];
  const itemSubTypes: string[] = selectedType ? meta?.types[selectedType] : [];
  if (!itemSubTypes?.length) {
    return [`${selectedType} has no subtypes`] as const;
  }

  return [undefined, itemSubTypes] as const;
}

const count = (value: unknown) => (Array.isArray(value) ? value.length : 0);
