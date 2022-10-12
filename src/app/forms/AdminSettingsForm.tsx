import { FormControlLabel, Stack } from "@mui/material";
import { TextField } from "../controls/TextField";
import { useZodForm } from "../../lib/zod/useZodForm";
import {
  AdminSettings,
  adminSettingsType,
} from "../../api/services/settings/types";
import { ZodField } from "../controls/ZodField";
import { Switch } from "../controls/Switch";
import { TabbedPaper } from "../components/TabbedPaper";

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
      <TabbedPaper
        tabs={[
          {
            label: "Appearance",
            content: (
              <Stack spacing={2}>
                <TextField
                  size="small"
                  label="Page Title"
                  {...field("public.pageTitle")}
                />
                <ZodField
                  label="Zeny Colors"
                  helperText={
                    "Colors to use for zeny as prices go up. Format: [[price1, color1], [price2, color2], ...]. " +
                    "Color values can be any css color. Price values must be in rising order."
                  }
                  {...field("public.zenyColors")}
                />
              </Stack>
            ),
          },
          {
            label: "Donations",
            content: (
              <Stack spacing={2}>
                <FormControlLabel
                  control={<Switch {...field("internal.donations.enabled")} />}
                  label="Enable donations"
                />
                <TextField
                  disabled={!value.internal.donations.enabled}
                  label="Credits database key"
                  helperText={
                    `The value for the "key" column in the rathena table "acc_reg_num" ` +
                    `that will be used to retrieve and update a users credit balance.`
                  }
                  {...field("internal.donations.accRegNumKey")}
                />
              </Stack>
            ),
          },
        ]}
      />
    </>
  );
}
