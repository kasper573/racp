import { TextField } from "../controls/TextField";
import { MonsterFilter, monsterFilter } from "../../api/services/monster/types";
import { useZodMatcherForm } from "../../lib/zod/useZodMatcherForm";
import { matcher } from "../../api/util/matcher";
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
      <SliderMenu
        ranged
        size="small"
        label="Move Speed"
        {...meta?.monsterWalkSpeeds}
        {...field("WalkSpeed", "between")}
      />
      <SliderMenu
        ranged
        size="small"
        label="Atk. Range"
        {...meta?.monsterAttackRanges}
        {...field("AttackRange", "between")}
      />
      <SliderMenu
        ranged
        size="small"
        label="Skill Range"
        {...meta?.monsterSkillRanges}
        {...field("SkillRange", "between")}
      />
      <SliderMenu
        ranged
        size="small"
        label="Chase Range"
        {...meta?.monsterChaseRanges}
        {...field("ChaseRange", "between")}
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
      <Select
        label="Modes"
        multi
        options={meta?.monsterModes}
        {...field("Modes", "enabled")}
      />
    </>
  );
}
