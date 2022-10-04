import { TextField } from "../controls/TextField";
import { matcher } from "../../api/util/matcher";
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
        size="small"
        label="Item ID"
        type="number"
        optional
        {...field("itemId", "=")}
      />
      <TextField
        size="small"
        label="Item name"
        optional
        {...field("name", "contains")}
      />
      <TextField
        size="small"
        label="Vendor"
        optional
        {...field("vendorTitle", "contains")}
      />
      <RangeFields size="small" label="Price" {...field("price", "between")} />
      <RangeFields
        size="small"
        label="Amount"
        {...field("amount", "between")}
      />
    </>
  );
}
