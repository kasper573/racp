import { Typography } from "@mui/material";
import { Center } from "../components/Center";

export function RestrictedPage() {
  return (
    <Center>
      <Typography>You do not have permissions to access this page</Typography>
    </Center>
  );
}
