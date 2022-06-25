import { useGetConfigQuery, useUpdateConfigMutation } from "../client";
import { TextEditor } from "../TextEditor";

export function ConfigEditor({ configName }: { configName: string }) {
  const { data: value } = useGetConfigQuery(configName);
  const [update] = useUpdateConfigMutation();
  const setValue = (content: string) => update({ name: configName, content });
  return <TextEditor value={value} onChange={setValue} />;
}
