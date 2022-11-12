import { Header } from "../layout/Header";
import { UserProfileGrid } from "../grids/UserProfileGrid";
import { useRouteState } from "../../lib/tsr/react/useRouteState";
import { routes } from "../router";
import { FilterMenu } from "../components/FilterMenu";
import { UserProfileSearchFilterForm } from "../forms/UserProfileSearchFilterForm";
import { Page } from "../layout/Page";

export default function AdminUsersPage() {
  const [filter = {}, setFilter] = useRouteState(
    routes.admin.users.$,
    "filter"
  );
  return (
    <Page>
      <Header>
        <FilterMenu
          sx={{ position: "absolute", right: 0 }}
          filter={filter}
          setFilter={setFilter}
          fields={UserProfileSearchFilterForm}
        />
      </Header>
      <UserProfileGrid filter={filter} sx={{ mt: 1 }} />
    </Page>
  );
}
