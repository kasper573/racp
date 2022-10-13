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
import { Select } from "../controls/Select";
import { trpc } from "../state/client";

export function AdminSettingsForm({
  value,
  onChange,
}: {
  value: AdminSettings;
  onChange: (value: AdminSettings) => void;
}) {
  const { data: currencies = [] } = trpc.settings.getCurrencies.useQuery();
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
                <TextField label="Page Title" {...field("public.pageTitle")} />
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
                  control={<Switch {...field("public.donations.enabled")} />}
                  label="Enable donations"
                />
                <TextField
                  label="Paypal Merchant ID"
                  {...field("public.donations.paypalMerchantId")}
                />
                <TextField
                  label="Paypal Client ID"
                  {...field("public.donations.paypalClientId")}
                />
                <TextField
                  label="Paypal Client Secret"
                  {...field("internal.donations.paypalClientSecret")}
                />
                <TextField
                  label="Credits database key"
                  helperText={
                    `The value for the "key" column in the rathena table "acc_reg_num" ` +
                    `that will be used to retrieve and update a users credit balance. ` +
                    `There is usually no need to change this, but the option is provided for flexibility.`
                  }
                  {...field("internal.donations.accRegNumKey")}
                />
                <TextField
                  multiline
                  label="Presentation"
                  helperText="Welcome text on the donations page to explain how donations work."
                  {...field("public.donations.presentation")}
                />
                <TextField
                  type="number"
                  label="Default donation amount"
                  {...field("public.donations.defaultAmount")}
                />
                <Select
                  options={currencies}
                  label="Currency"
                  required
                  {...field("public.donations.currency")}
                />
                <TextField
                  type="number"
                  label="Exchange rate"
                  helperText={`How many credits does 1 ${value.public.donations.currency} equal?`}
                  {...field("public.donations.exchangeRate")}
                />
              </Stack>
            ),
          },
        ]}
      />
    </>
  );
}
