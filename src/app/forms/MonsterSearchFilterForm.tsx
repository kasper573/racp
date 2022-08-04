import { Box, styled } from "@mui/material";
import { TextField } from "../controls/TextField";
import { MonsterFilter, monsterFilter } from "../../api/services/monster/types";
import { useZodMatcherForm } from "../../lib/zod/useZodMatcherForm";
import { matcher } from "../../api/util/matcher";
import { useGetMetaQuery } from "../state/client";
import { Select } from "../controls/Select";
import { SliderMenu } from "../controls/SliderMenu";
import { RangeFields } from "../controls/RangeFields";

export interface MonsterSearchFilterFormProps {
  value: MonsterFilter;
  onChange: (changed: MonsterFilter) => void;
}

export function MonsterSearchFilterForm({
  value,
  onChange,
}: MonsterSearchFilterFormProps) {
  const { data: meta } = useGetMetaQuery();
  const field = useZodMatcherForm({
    matcher,
    schema: monsterFilter.type,
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
        {...field("Id", "=")}
      />
      <TextField
        size="small"
        label="Name"
        optional
        {...field("Name", "contains")}
      />
      <Select
        label="Race"
        multi
        options={meta?.races}
        {...field("Race", "oneOf")}
      />
      <Select
        label="Element"
        multi
        options={meta?.elements}
        {...field("Element", "oneOf")}
      />
      <Select
        label="Size"
        multi
        options={meta?.sizes}
        {...field("Size", "oneOf")}
      />
      <SliderMenu
        ranged
        size="small"
        label="Level"
        {...meta?.monsterLevels}
        {...field("Level", "between")}
      />
      <RangeFields
        size="small"
        label="Base XP"
        {...field("BaseExp", "between")}
      />
      <RangeFields
        size="small"
        label="Job XP"
        {...field("JobExp", "between")}
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
