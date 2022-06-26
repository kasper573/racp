import { useRouteParams } from "react-typesafe-routes";
import { ErrorMessage } from "../components/ErrorMessage";
import { useGetConfigQuery, useUpdateConfigMutation } from "../client";
import { TextEditor } from "../components/TextEditor";
import { router } from "../router";
import { Header } from "../layout/Header";

export default function AdminConfigEditPage() {
  const { configName } = useRouteParams(router.admin().config().edit);
  const { data: value, error: queryError } = useGetConfigQuery(configName);
  const [update, { error: updateError }] = useUpdateConfigMutation();
  const setValue = (content: string) => update({ name: configName, content });

  return (
    <>
      <Header back={router.admin().config}>{configName}</Header>
      <ErrorMessage error={queryError} />
      <ErrorMessage error={updateError} />
      <TextEditor value={value} onChange={setValue} />
    </>
  );
}
