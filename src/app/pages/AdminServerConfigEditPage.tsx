import { useRouteParams } from "../../lib/hooks/useRouteParams";
import { trpc } from "../state/client";
import { TextEditor } from "../controls/TextEditor";
import { router } from "../router";
import { Header } from "../layout/Header";
import { CommonRemoteForm } from "../components/CommonRemoteForm";

export default function AdminServerConfigEditPage() {
  const { configName } = useRouteParams(router.admin().serverConfig().edit);

  return (
    <>
      <Header back={router.admin().serverConfig}>{configName}</Header>
      <CommonRemoteForm
        sx={{ flex: 1 }}
        query={() => trpc.config.read.useQuery(configName)}
        mutation={() => {
          const { mutate, ...rest } = trpc.config.update.useMutation();
          return {
            mutate: (content: string) => mutate({ name: configName, content }),
            ...rest,
          };
        }}
      >
        {TextEditor}
      </CommonRemoteForm>
    </>
  );
}
