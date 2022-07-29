import { Box, styled } from "@mui/material";
import { TextField } from "../controls/TextField";
import { MonsterFilter, monsterSearch } from "../../api/services/monster/types";
import { useZodMatcherForm } from "../../lib/zod/useZodMatcherForm";
import { matcher } from "../../api/util/matcher";

export interface MonsterSearchFilterFormProps {
  value: MonsterFilter;
  onChange: (changed: MonsterFilter) => void;
}

export function MonsterSearchFilterForm({
  value,
  onChange,
}: MonsterSearchFilterFormProps) {
  const field = useZodMatcherForm({
    matcher,
    schema: monsterSearch.type,
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
        {...field("=", "Id")}
      />
      <TextField
        size="small"
        label="Name"
        optional
        {...field("contains", "Name")}
      />
    </ControlGrid>
  );
}

const ControlGrid = styled(Box)`
  display: grid;
  grid-gap: 8px;
  ${({ theme }) => theme.breakpoints.down("md")} {
    grid-template-columns: 1fr 1fr 1fr;
    grid-auto-rows: auto;
  }
  ${({ theme }) => theme.breakpoints.up("md")} {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
    grid-auto-rows: auto;
  }
`;
