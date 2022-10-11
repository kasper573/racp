import { TextField } from "../controls/TextField";
import { useZodForm } from "../../lib/zod/useZodForm";
import {
  AdminSettings,
  adminSettingsType,
} from "../../api/services/settings/types";

export function AdminSettingsForm({
  value,
  onChange,
}: {
  value: AdminSettings;
  onChange: (value: AdminSettings) => void;
}) {
  const field = useZodForm({
    schema: adminSettingsType,
    value,
    onChange,
  });

  return (
    <>
      <TextField
        size="small"
        label="Page Title"
        {...field("public.pageTitle")}
      />
    </>
  );
}
