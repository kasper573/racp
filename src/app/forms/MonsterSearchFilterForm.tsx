import { TextField } from "../controls/TextField";
import { MonsterFilter, monsterFilter } from "../../api/services/monster/types";
import { useZodMatcherForm } from "../../lib/zod/useZodMatcherForm";
import { matcher } from "../../api/matcher";
import { trpc } from "../state/client";
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
  const { data: meta } = trpc.meta.read.useQuery();
  const field = useZodMatcherForm({
    matcher,
    schema: monsterFilter.type,
    value,
    onChange,
  });

  return (
    <>
      <TextField label="ID" type="number" optional {...field("Id", "=")} />
      <TextField label="Name" optional {...field("Name", "contains")} />
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
        label="Level"
        {...meta?.monsterLevels}
        {...field("Level", "between")}
      />
      <SliderMenu
        ranged
        label="Move Speed"
        {...meta?.monsterWalkSpeeds}
        {...field("WalkSpeed", "between")}
      />
      <SliderMenu
        ranged
        label="Atk. Range"
        {...meta?.monsterAttackRanges}
        {...field("AttackRange", "between")}
      />
      <SliderMenu
        ranged
        label="Skill Range"
        {...meta?.monsterSkillRanges}
        {...field("SkillRange", "between")}
      />
      <SliderMenu
        ranged
        label="Chase Range"
        {...meta?.monsterChaseRanges}
        {...field("ChaseRange", "between")}
      />
      <RangeFields label="Base XP" {...field("BaseExp", "between")} />
      <RangeFields label="Job XP" {...field("JobExp", "between")} />
      <Select
        label="Modes"
        multi
        options={meta?.monsterModes}
        {...field("Modes", "enabled")}
      />
    </>
  );
}
