import { FormControlLabel, Stack } from "@mui/material";
import { TextField } from "../controls/TextField";
import { useZodForm, ZodFormOptions } from "../../lib/zod/useZodForm";
import {
  AdminSettings,
  adminSettingsType,
} from "../../api/services/settings/types";
import { ZodField } from "../controls/ZodField";
import { Switch } from "../controls/Switch";
import { TabbedPaper } from "../components/TabbedPaper";
import { Select } from "../controls/Select";
import { trpc } from "../state/client";

export function AdminSettingsForm(props: ZodFormOptions<AdminSettings>) {
  const { data: currencies = [] } = trpc.donation.currencies.useQuery();
  const field = useZodForm({ schema: adminSettingsType, ...props });

  return (
    <>
      <TabbedPaper
        tabs={[
          {
            label: "Appearance",
            content: (
              <Stack spacing={2}>
                <TextField label="Page Title" {...field("pageTitle")} />
                <ZodField
                  label="Zeny Colors"
                  helperText={
                    "Colors to use for zeny as prices go up. Format: [[price1, color1], [price2, color2], ...]. " +
                    "Color values can be any css color. Price values must be in rising order."
                  }
                  {...field("zenyColors")}
                />
              </Stack>
            ),
          },
          {
            label: "Donations",
            content: (
              <Stack spacing={2}>
                <FormControlLabel
                  control={<Switch {...field("donations.enabled")} />}
                  label="Enable donations"
                />
                <TextField
                  label="PayPal Merchant ID"
                  {...field("donations.paypal.merchantId")}
                />
                <TextField
                  label="PayPal Client ID"
                  {...field("donations.paypal.clientId")}
                />
                <TextField
                  label="PayPal Client Secret"
                  {...field("donations.paypal.clientSecret")}
                />
                <TextField
                  label="Credits database key"
                  helperText={
                    `The value for the "key" column in the rathena table "acc_reg_num" ` +
                    `that will be used to retrieve and update a users credit balance. ` +
                    `There is usually no need to change this, but the option is provided for flexibility.`
                  }
                  {...field("donations.accRegNumKey")}
                />
                <TextField
                  multiline
                  label="Presentation"
                  helperText="Welcome text on the donations page to explain how donations work."
                  {...field("donations.presentation")}
                />
                <TextField
                  type="number"
                  label="Default donation amount"
                  {...field("donations.defaultAmount")}
                />
                <Select
                  options={currencies}
                  label="Currency"
                  required
                  {...field("donations.currency")}
                />
                <TextField
                  type="number"
                  label="Exchange rate"
                  helperText={`How many credits does 1 ${props.value.donations.currency} equal?`}
                  {...field("donations.exchangeRate")}
                />
              </Stack>
            ),
          },
        ]}
      />
    </>
  );
}
