import { Typography } from "@mui/material";
import { Header } from "../layout/Header";
import { trpc } from "../state/client";
import { AdminSettingsForm } from "../forms/AdminSettingsForm";
import { LoadingPage } from "./LoadingPage";

export default function AdminSettingsPage() {
  const { data: settings, error, isLoading } = trpc.settings.read.useQuery();
  const { mutate: updateSettings } = trpc.settings.update.useMutation();
  if (isLoading) {
    return <LoadingPage />;
  }
  if (error) {
    return <Header>Could not load settings</Header>;
  }
  return (
    <>
      <Header>Settings</Header>
      {settings ? (
        <AdminSettingsForm value={settings} onChange={updateSettings} />
      ) : (
        <Typography>Settings are unavailable</Typography>
      )}
    </>
  );
}
