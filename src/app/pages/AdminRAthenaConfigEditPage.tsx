import { useRouteParams } from "../../lib/hooks/useRouteParams";
import { ErrorMessage } from "../components/ErrorMessage";
import { trpc } from "../state/client";
import { TextEditor } from "../controls/TextEditor";
import { router } from "../router";
import { Header } from "../layout/Header";
import { LoadingPage } from "./LoadingPage";

export default function AdminRAthenaConfigEditPage() {
  const { configName } = useRouteParams(router.admin().serverConfig().edit);
  const {
    data: value,
    error: queryError,
    isLoading,
  } = trpc.config.read.useQuery(configName);
  const { mutate: update, error: updateError } =
    trpc.config.update.useMutation();
  const setValue = (content: string) => update({ name: configName, content });

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      <Header back={router.admin().serverConfig}>{configName}</Header>
      <ErrorMessage error={queryError} />
      <ErrorMessage error={updateError} />
      <TextEditor value={value ?? ""} onChange={setValue} />
    </>
  );
}
