import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { Link } from "../components/Link";
import { routes } from "../router";

export const SkillGrid = DataGrid.define(trpc.skill.search.useQuery)({
  emptyComponent: () => <>No skills found</>,
  id: (skill) => skill.Id,
  columns: {
    DisplayName: {
      headerName: "Name",
      renderCell({ row: skill }) {
        return (
          <Link to={routes.skill.view({ id: skill.Id })}>
            {skill.DisplayName}
          </Link>
        );
      },
    },
  },
});
