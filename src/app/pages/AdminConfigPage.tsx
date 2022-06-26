import { List, ListItemButton } from "@mui/material";
import { Link } from "react-typesafe-routes";
import { useListConfigsQuery } from "../client";
import { ErrorMessage } from "../components/ErrorMessage";
import { router } from "../router";

export function AdminConfigPage() {
  const { data: configs, error } = useListConfigsQuery();
  return (
    <>
      <ErrorMessage error={error} />
      <List>
        {configs?.map((configName, index) => (
          <ListItemButton
            key={index}
            component={Link}
            to={router.admin().config().edit({ configName })}
          >
            {configName}
          </ListItemButton>
        ))}
      </List>
    </>
  );
}
