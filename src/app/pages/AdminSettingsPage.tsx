import { Header } from "../layout/Header";
import { AdminSettingsForm } from "../forms/AdminSettingsForm";
import { trpc } from "../state/client";
import { CommonRemoteForm } from "../components/CommonRemoteForm";
import { Page } from "../layout/Page";

export default function AdminSettingsPage() {
  return (
    <Page>
      <Header />
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
