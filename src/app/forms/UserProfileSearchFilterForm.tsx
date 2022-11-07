import { TextField } from "../controls/TextField";
import { useZodMatcherForm } from "../../lib/zod/useZodMatcherForm";
import { matcher } from "../../api/matcher";
import {
  userProfileFilter,
  UserProfileFilter,
} from "../../api/services/user/types";

export interface UserProfileSearchFilterFormProps {
  value: UserProfileFilter;
  onChange: (changed: UserProfileFilter) => void;
}

export function UserProfileSearchFilterForm({
  value,
  onChange,
}: UserProfileSearchFilterFormProps) {
  const field = useZodMatcherForm({
    matcher,
    schema: userProfileFilter.type,
    value,
    onChange,
  });

  return (
    <>
      <TextField
        debounce
        label="ID"
        type="number"
        optional
        {...field("id", "=")}
      />
      <TextField
        debounce
        label="Name"
        optional
        {...field("username", "contains")}
      />
      <TextField
        debounce
        label="Email"
        optional
        {...field("email", "contains")}
      />
    </>
  );
}
