import { Typography } from "@mui/material";
import { Header } from "../layout/Header";
import { MvpGrid } from "../grids/MvpGrid";
import { useRouteState } from "../../lib/tsr/react/useRouteState";
import { routes } from "../router";
import { FilterMenu } from "../components/FilterMenu";
import { MvpSearchFilterForm } from "../forms/MvpSearchFilterForm";
import { Link } from "../components/Link";
import { Page } from "../layout/Page";

export default function MvpSearchPage() {
  const [query = {}, setQuery] = useRouteState(routes.mvp.$, "query");
  return (
    <Page>
      <Header>
        <FilterMenu
          sx={{ position: "absolute", right: 0 }}
          filter={query.filter ?? {}}
          setFilter={(filter) => setQuery((q) => ({ ...q, filter }))}
          fields={MvpSearchFilterForm}
        />
      </Header>
      <Typography paragraph>
        This board shows boss monsters that have dedicated spawns, and their
        most recent mvp information. <br />
        For a full list of boss monsters, regardless of spawn or mvp
        configuration, see the{" "}
        <Link
          to={routes.monster.search({
            query: {
              filter: { Modes: { value: ["Mvp"], matcher: "enabled" } },
            },
          })}
        >
          monsters page
        </Link>
        .
      </Typography>
      <MvpGrid query={query} setQuery={setQuery} sx={{ mt: 1 }} />
    </Page>
  );
}
