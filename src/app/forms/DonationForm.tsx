import { Button, InputAdornment, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { TextField } from "../controls/TextField";
import { Currency, Money } from "../../api/services/settings/types";

export function DonationForm({
  defaultAmount,
  exchangeRate,
  currency,
  onSubmit,
}: {
  exchangeRate: number;
  defaultAmount: number;
  currency: Currency;
  onSubmit?: (money: Money) => void;
}) {
  const [value, setValue] = useState(defaultAmount);
  const credits = value * exchangeRate;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.({ value, currency });
      }}
    >
      <div>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            label="Donation amount"
            type="number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">{currency}</InputAdornment>
              ),
            }}
            value={value}
            onChange={setValue}
          />
          <div>
            <Button type="submit">Donate</Button>
          </div>
        </Stack>
      </div>
      <Typography variant="caption">
        Donating {value} {currency} will reward you {credits} credits.
      </Typography>
    </form>
  );
}
