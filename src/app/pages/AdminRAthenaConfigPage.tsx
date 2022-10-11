import { List, TextField } from "@mui/material";
import { useState } from "react";
import { trpc } from "../state/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { router } from "../router";
import { LinkListItem } from "../components/Link";
import { Header } from "../layout/Header";
import { LoadingPage } from "./LoadingPage";

export default function AdminRAthenaConfigPage() {
  const [filter, setFilter] = useState("");
  const { data: configs = [], error, isLoading } = trpc.config.list.useQuery();
  const filteredConfigs = configs.filter((config) =>
    config.toLowerCase().includes(filter.toLowerCase())
  );
  if (isLoading) {
    return <LoadingPage />;
  }
  return (
    <>
      <Header>Select an rathena/conf file to edit</Header>
      <TextField
        placeholder="Search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <ErrorMessage error={error} />
      <List>
        {filteredConfigs?.map((configName, index) => (
          <LinkListItem
            key={index}
            to={router.admin().serverConfig().edit({ configName })}
          >
            {configName}
          </LinkListItem>
        ))}
      </List>
    </>
  );
}
