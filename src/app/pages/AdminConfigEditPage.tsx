import { Typography } from "@mui/material";
import { useRouteParams } from "react-typesafe-routes";
import { ErrorMessage } from "../components/ErrorMessage";
import { useGetConfigQuery, useUpdateConfigMutation } from "../client";
import { TextEditor } from "../components/TextEditor";
import { router } from "../router";
import { LinkButton } from "../components/Link";

export default function AdminConfigEditPage() {
  const { configName } = useRouteParams(router.admin().config().edit);
  const { data: value, error: queryError } = useGetConfigQuery(configName);
  const [update, { error: updateError }] = useUpdateConfigMutation();
  const setValue = (content: string) => update({ name: configName, content });

  return (
    <>
      <ErrorMessage error={queryError} />
      <ErrorMessage error={updateError} />
      <LinkButton to={router.admin().config()}>Back</LinkButton>
      <Typography>{configName}</Typography>
      <TextEditor value={value} onChange={setValue} />
    </>
  );
}
