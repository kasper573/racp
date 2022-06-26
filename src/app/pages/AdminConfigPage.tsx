import { List, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useListConfigsQuery } from "../client";
import { ErrorMessage } from "../components/ErrorMessage";
import { router } from "../router";
import { LinkListItem } from "../components/Link";

export default function AdminConfigPage() {
  const [filter, setFilter] = useState("");
  const { data: configs = [], error } = useListConfigsQuery();
  const filteredConfigs = configs.filter((config) =>
    config.toLowerCase().includes(filter.toLowerCase())
  );
  return (
    <>
      <Typography paragraph>Select a configuration file to edit</Typography>
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
