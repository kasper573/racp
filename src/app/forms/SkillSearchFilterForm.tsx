import { TextField } from "../controls/TextField";
import { useZodMatcherForm } from "../../lib/zod/useZodMatcherForm";
import { matcher } from "../../api/matcher";
import { SkillFilter, skillFilter } from "../../api/services/skill/types";

export interface SkillSearchFilterFormProps {
  value: SkillFilter;
  onChange: (changed: SkillFilter) => void;
}

export function SkillSearchFilterForm({
  value,
  onChange,
}: SkillSearchFilterFormProps) {
  const field = useZodMatcherForm({
    matcher,
    schema: skillFilter.type,
    value,
    onChange,
  });

  return (
    <>
      <TextField label="ID" optional {...field("Id", "=")} />
      <TextField label="Name" optional {...field("DisplayName", "contains")} />
    </>
  );
}
