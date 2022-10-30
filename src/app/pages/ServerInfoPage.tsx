import { Header } from "../layout/Header";
import { trpc } from "../state/client";
import { KVTable } from "../components/KVTable";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingPage } from "./LoadingPage";

export default function ServerInfoPage() {
  const { data, isLoading } = trpc.settings.readPublic.useQuery();
  if (isLoading) {
    return <LoadingPage />;
  }
  if (!data) {
    return (
      <ErrorMessage error="Something went wrong, please try again later" />
    );
  }

  return (
    <>
      <Header />
      <KVTable
        sx={{ maxWidth: 400 }}
        rows={{
          Mode: data.rAthenaMode,
        }}
      />
    </>
  );
}
