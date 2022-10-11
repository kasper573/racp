import { TextField } from "../controls/TextField";
import { useZodForm } from "../../lib/zod/useZodForm";
import {
  AdminSettings,
  adminSettingsType,
} from "../../api/services/settings/types";
import { ZodField } from "../controls/ZodField";

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
      <ZodField
        label="Zeny Colors (JSON)"
        schema={adminSettingsType.shape.public.shape.zenyColors}
        {...field("public.zenyColors")}
      />
    </>
  );
}
