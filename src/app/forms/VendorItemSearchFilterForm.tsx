import { Box, styled } from "@mui/material";
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
    <ControlGrid>
      <TextField
        size="small"
        label="ID"
        type="number"
        optional
        {...field("itemId", "=")}
      />
      <TextField
        size="small"
        label="Name"
        optional
        {...field("vendorTitle", "contains")}
      />
      <RangeFields size="small" label="Price" {...field("price", "between")} />
      <RangeFields
        size="small"
        label="Amount"
        {...field("amount", "between")}
      />
    </ControlGrid>
  );
}

const ControlGrid = styled(Box)`
  display: grid;
  grid-gap: 8px;
  grid-auto-rows: auto;
  ${({ theme }) => theme.breakpoints.down("md")} {
    grid-template-columns: 1fr 1fr 1fr;
  }
  ${({ theme }) => theme.breakpoints.up("md")} {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  }
`;
