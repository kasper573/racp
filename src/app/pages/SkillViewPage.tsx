import { Header } from "../layout/Header";
import { router } from "../router";
import { useRouteParams } from "../../lib/hooks/useRouteParams";
import { trpc } from "../state/client";
import { TabbedPaper } from "../components/TabbedPaper";
import { KVTable } from "../components/KVTable";
import { CommonPageGrid } from "../components/CommonPageGrid";
import { renderToggles } from "../util/renderToggles";
import { LoadingPage } from "./LoadingPage";

export default function SkillViewPage() {
  const { id } = useRouteParams(router.skill().view);
  const { data: { entities: [skill] = [] } = {}, isLoading } =
    trpc.skill.search.useQuery({
      filter: { Id: { value: id, matcher: "=" } },
    });
  if (isLoading) {
    return <LoadingPage />;
  }
  if (!skill) {
    return <Header back={router.skill}>Skill not found</Header>;
  }

  const {
    Description,
    CastTimeFlags,
    CastDelayFlags,
    DamageFlags,
    Flags,
    Requires,
    ...rest
  } = skill;

  const flags: Record<string, string> = {
    CastDelayFlags: renderToggles(CastDelayFlags),
    CastTimeFlags: renderToggles(CastTimeFlags),
    DamageFlags: renderToggles(DamageFlags),
    Flags: renderToggles(Flags),
  };

  return (
    <>
      <Header back={router.skill}>{skill?.DisplayName}</Header>
      <CommonPageGrid>
        <TabbedPaper
          tabs={[
            {
              label: "Properties",
              content: <KVTable rows={{ ...rest, ...flags }} />,
            },
          ]}
        />
        <TabbedPaper
          tabs={[
            {
              label: "Requirements",
              content: <KVTable rows={{ ...Requires }} />,
            },
          ]}
        />
      </CommonPageGrid>
    </>
  );
}
