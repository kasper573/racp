import { Typography } from "@mui/material";
import { CenteredContent } from "../components/CenteredContent";

export function NoAccessPage() {
  return (
    <CenteredContent>
      <Typography>You do not have permissions to access this page</Typography>
    </CenteredContent>
  );
}
