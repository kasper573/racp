import { Select } from "../controls/Select";
import { TextField } from "../controls/TextField";
import { matcher } from "../../api/util/matcher";
import { useZodMatcherForm } from "../../lib/zod/useZodMatcherForm";
import {
  shopFilter,
  ShopFilter,
  shopVariants,
} from "../../api/services/shop/types";

export function ShopSearchFilterForm({
  value,
  onChange,
}: {
  value: ShopFilter;
  onChange: (value: ShopFilter) => void;
}) {
  const field = useZodMatcherForm({
    matcher,
    schema: shopFilter.type,
    value,
    onChange,
  });

  return (
    <>
      <TextField
        size="small"
        label="Name"
        optional
        {...field("name", "contains")}
      />
      <TextField
        size="small"
        label="Map"
        optional
        {...field("mapId", "equals")}
      />
      <Select
        label="Variant"
        multi
        options={shopVariants}
        {...field("variant", "oneOf")}
      />
    </>
  );
}
