import { FormControlLabel, Stack, Typography } from "@mui/material";
import { TextField } from "../controls/TextField";
import { useZodForm, ZodFormOptions } from "../../lib/zod/useZodForm";
import {
  AdminSettings,
  adminSettingsType,
  rAthenaModeType,
} from "../../api/services/settings/types";
import { Switch } from "../controls/Switch";
import { TabbedPaper } from "../components/TabbedPaper";
import { Select } from "../controls/Select";
import { trpc } from "../state/client";
import { MarkdownField } from "../controls/MarkdownField";
import { RpcFilePicker } from "../components/FilePicker";

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
                <TextField label="Website Title" {...field("pageTitle")} />
                <RpcFilePicker
                  name="homePageBanner"
                  label="Home Page Banner"
                  emptyText={
                    <Typography component="span" color="gray">
                      Default
                    </Typography>
                  }
                  clearText="Use default"
                  clearable
                  {...field("homePageBanner")}
                />
                <MarkdownField
                  label="Home Page Content"
                  {...field("homePageContent")}
                />
              </Stack>
            ),
          },
          {
            label: "Hunt",
            content: (
              <Stack spacing={2}>
                <TextField
                  type="number"
                  label="Max hunts per account"
                  {...field("huntLimits.hunts")}
                />
                <TextField
                  type="number"
                  label="Max items per hunt"
                  {...field("huntLimits.itemsPerHunt")}
                />
                <TextField
                  type="number"
                  label="Max monsters per item"
                  {...field("huntLimits.monstersPerItem")}
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
                  type="password"
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
                <MarkdownField
                  label="Presentation"
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
          {
            label: "rAthena",
            content: (
              <Stack spacing={2}>
                <Select
                  label="Mode"
                  required
                  options={rAthenaModeType.options}
                  helperText="Changing mode will reset API caches and may slow down the website for a moment"
                  {...field("rAthenaMode")}
                />
              </Stack>
            ),
          },
        ]}
      />
    </>
  );
}
