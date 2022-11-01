import { TextField } from "../controls/TextField";
import { matcher } from "../../api/matcher";
import { useZodMatcherForm } from "../../lib/zod/useZodMatcherForm";
import {
  VendorItemFilter,
  vendorItemFilter,
} from "../../api/services/vendor/types";
import { RangeFields } from "../controls/RangeFields";

export function VendorItemSearchFilterForm({
  value,
  onChange,
}: {
  value: VendorItemFilter;
  onChange: (changed: VendorItemFilter) => void;
}) {
  const field = useZodMatcherForm({
    matcher,
    schema: vendorItemFilter.type,
    value,
    onChange,
  });

  return (
    <>
      <TextField
        debounce
        label="Item ID"
        type="number"
        optional
        {...field("itemId", "=")}
      />
      <TextField
        debounce
        label="Item name"
        optional
        {...field("name", "contains")}
      />
      <TextField
        debounce
        label="Vendor"
        optional
        {...field("vendorTitle", "contains")}
      />
      <RangeFields label="Price" {...field("price", "between")} />
      <RangeFields label="Amount" {...field("amount", "between")} />
    </>
  );
}
