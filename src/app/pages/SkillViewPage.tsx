import { Header } from "../layout/Header";
import { router } from "../router";
import { useRouteParams } from "../../lib/hooks/useRouteParams";

export default function SkillViewPage() {
  const { id } = useRouteParams(router.skill().view);
  return (
    <>
      <Header back={router.skill}>Skill {id}</Header>
    </>
  );
}
