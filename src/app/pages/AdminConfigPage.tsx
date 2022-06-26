import { List } from "@mui/material";
import { useListConfigsQuery } from "../client";
import { ErrorMessage } from "../components/ErrorMessage";
import { router } from "../router";
import { LinkListItem } from "../components/Link";

export function AdminConfigPage() {
  const { data: configs, error } = useListConfigsQuery();
  return (
    <>
      <ErrorMessage error={error} />
      <List>
        {configs?.map((configName, index) => (
          <LinkListItem
            key={index}
            to={router.admin().config().edit({ configName })}
          >
            {configName}
          </LinkListItem>
        ))}
      </List>
    </>
  );
}
