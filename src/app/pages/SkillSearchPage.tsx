import { Header } from "../layout/Header";
import { routes } from "../router";
import { useRouteState } from "../../lib/tsr/react/useRouteState";
import { SkillGrid } from "../grids/SkillGrid";
import { FilterMenu } from "../components/FilterMenu";
import { SkillSearchFilterForm } from "../forms/SkillSearchFilterForm";
import { Page } from "../layout/Page";

export default function SkillSearchPage() {
  const [query = {}, setQuery] = useRouteState(routes.skill.search.$, "query");
  return (
    <Page>
      <Header>
        <FilterMenu
          sx={{ position: "absolute", right: 0 }}
          filter={query.filter ?? {}}
          setFilter={(filter) => setQuery((q) => ({ ...q, filter }))}
          fields={SkillSearchFilterForm}
        />
      </Header>
      <SkillGrid query={query} setQuery={setQuery} sx={{ mt: 1 }} />
    </Page>
  );
}
