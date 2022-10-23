import { Header } from "../layout/Header";
import { router } from "../router";
import { useRouteState } from "../../lib/hooks/useRouteState";
import { SkillGrid } from "../grids/SkillGrid";

export default function SkillSearchPage() {
  const [filter = {}, setFilter] = useRouteState(
    router.skill().search,
    "filter"
  );
  return (
    <>
      <Header>Skills</Header>
      <SkillGrid filter={filter} sx={{ mt: 1 }} />
    </>
  );
}
