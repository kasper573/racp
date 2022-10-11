import { Stack } from "@mui/material";
import { Header } from "../layout/Header";
import { trpc } from "../state/client";
import { AdminSettingsForm } from "../forms/AdminSettingsForm";

export default function AdminSettingsPage() {
  const { data: settings } = trpc.settings.read.useQuery();
  const { mutate: updateSettings } = trpc.settings.update.useMutation();
  return (
    <>
      <Header>Settings</Header>
      <Stack direction="column" spacing={2}>
        {settings ? (
          <AdminSettingsForm value={settings} onChange={updateSettings} />
        ) : (
          "Loading..."
        )}
      </Stack>
    </>
  );
}
