import { Button, InputAdornment, Stack } from "@mui/material";
import { useState } from "react";
import { TextField } from "../controls/TextField";
import { Currency, Money } from "../../api/services/settings/types";

export function DonationForm({
  defaultAmount,
  currency,
  onSubmit,
}: {
  defaultAmount: number;
  currency: Currency;
  onSubmit?: (money: Money) => void;
}) {
  const [value, setValue] = useState(defaultAmount);
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
    </form>
  );
}
