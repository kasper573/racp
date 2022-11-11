import { Header } from "../layout/Header";
import { routes } from "../router";
import { useRouteState } from "../../lib/tsr/react/useRouteState";
import { SkillGrid } from "../grids/SkillGrid";
import { FilterMenu } from "../components/FilterMenu";
import { SkillSearchFilterForm } from "../forms/SkillSearchFilterForm";
import { Page } from "../layout/Page";

export default function SkillSearchPage() {
  const [filter = {}, setFilter] = useRouteState(
    routes.skill.search.$,
    "filter"
  );
  return (
    <Page>
      <Header>
        <FilterMenu
          sx={{ position: "absolute", right: 0 }}
          filter={filter}
          setFilter={setFilter}
          fields={SkillSearchFilterForm}
        />
      </Header>
      <SkillGrid filter={filter} sx={{ mt: 1 }} />
    </Page>
  );
}
