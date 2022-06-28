import { List, TextField } from "@mui/material";
import { useState } from "react";
import { useListConfigsQuery } from "../client";
import { ErrorMessage } from "../components/ErrorMessage";
import { router } from "../router";
import { LinkListItem } from "../components/Link";
import { Header } from "../layout/Header";
import { LoadingPage } from "../components/LoadingPage";

export default function AdminConfigPage() {
  const [filter, setFilter] = useState("");
  const { data: configs = [], error, isLoading } = useListConfigsQuery();
  const filteredConfigs = configs.filter((config) =>
    config.toLowerCase().includes(filter.toLowerCase())
  );
  if (isLoading) {
    return <LoadingPage />;
  }
  return (
    <>
      <Header>Select a configuration file to edit</Header>
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
            to={router.admin().config().edit({ configName })}
          >
            {configName}
          </LinkListItem>
        ))}
      </List>
    </>
  );
}
