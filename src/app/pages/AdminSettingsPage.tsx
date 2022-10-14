import { Header } from "../layout/Header";
import { AdminSettingsForm } from "../forms/AdminSettingsForm";
import { trpc } from "../state/client";
import { CommonRemoteForm } from "../components/CommonRemoteForm";

export default function AdminSettingsPage() {
  return (
    <>
      <Header>Settings</Header>
      <CommonRemoteForm
        query={trpc.settings.read.useQuery}
        mutation={trpc.settings.update.useMutation}
      >
        {(props: any) => props.value && <AdminSettingsForm {...props} />}
      </CommonRemoteForm>
    </>
  );
}
