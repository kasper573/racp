import { Alert } from "@mui/material";
import { Warning } from "@mui/icons-material";
import { Header } from "../layout/Header";
import { AdminSettingsForm } from "../forms/AdminSettingsForm";
import { trpc } from "../state/client";
import { CommonRemoteForm } from "../components/CommonRemoteForm";
import { Page } from "../layout/Page";
import { Link } from "../components/Link";
import { saveFile } from "../../lib/std/fileIO";

export default function AdminSettingsPage() {
  const { data: backup } = trpc.settings.readBackup.useQuery();
  function downloadBackup() {
    if (backup) {
      saveFile(
        new File([backup], "settings_backup.json", {
          type: "text/plain;charset=utf-8",
        })
      );
    }
  }
  return (
    <Page>
      <Header />
      {backup && (
        <>
          <Alert color="info">
            Due to a recent update of RACP that contained breaking changes, your
            old settings are no longer compatible. The live settings have been
            reset to their new default values, and your old settings have been
            backed up and{" "}
            <Link href="#" onClick={downloadBackup}>
              can be downloaded
            </Link>
            . To restore your old settings, you will have to manually re-enter
            them below, but you can make quick work of it by copying and pasting
            from the backup file.
          </Alert>
          <Alert color="warning" sx={{ my: 1 }} icon={<Warning />}>
            Warning! As soon as you save your new changes the backup will be
            deleted!
          </Alert>
        </>
      )}
      <CommonRemoteForm
        name="admin-settings"
        query={trpc.settings.read.useQuery}
        mutation={() => trpc.settings.update.useMutation()}
      >
        {AdminSettingsForm}
      </CommonRemoteForm>
    </Page>
  );
}
