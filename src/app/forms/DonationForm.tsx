import { Button, InputAdornment, Stack } from "@mui/material";
import { useState } from "react";
import { TextField } from "../controls/TextField";
import { Currency } from "../../api/services/settings/types";

export function DonationForm({
  defaultAmount,
  currency,
}: {
  defaultAmount: number;
  currency: Currency;
}) {
  const [amount, setAmount] = useState(defaultAmount);
  return (
    <form>
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
            value={amount}
            onChange={setAmount}
          />
          <div>
            <Button type="submit">Donate</Button>
          </div>
        </Stack>
      </div>
    </form>
  );
}
