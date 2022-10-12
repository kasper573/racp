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
        label="Item ID"
        type="number"
        optional
        {...field("itemId", "=")}
      />
      <TextField label="Item name" optional {...field("name", "contains")} />
      <TextField
        label="Vendor"
        optional
        {...field("vendorTitle", "contains")}
      />
      <RangeFields label="Price" {...field("price", "between")} />
      <RangeFields label="Amount" {...field("amount", "between")} />
    </>
  );
}
