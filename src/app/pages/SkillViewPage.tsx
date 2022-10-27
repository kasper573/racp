import { Header } from "../layout/Header";
import { trpc } from "../state/client";
import { TabbedPaper } from "../components/TabbedPaper";
import { KVTable } from "../components/KVTable";
import { CommonPageGrid } from "../components/CommonPageGrid";
import { renderToggles } from "../util/renderToggles";
import { renderLevelScaling } from "../util/renderLevelScaling";
import { durationString } from "../../lib/std/durationString";
import { ItemIdentifierByName } from "../components/ItemIdentifier";
import { Zeny } from "../components/Zeny";
import { RouteComponentProps } from "../../lib/tsr/react/types";
import { LoadingPage } from "./LoadingPage";

export default function SkillViewPage({
  params: { id },
}: RouteComponentProps<{ id: number }>) {
  const { data: { entities: [skill] = [] } = {}, isLoading } =
    trpc.skill.search.useQuery({
      filter: { Id: { value: id, matcher: "=" } },
    });

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!skill) {
    return <Header title="Skill not found" />;
  }

  return (
    <>
      <Header title={skill.DisplayName} />

      <CommonPageGrid>
        <TabbedPaper
          tabs={[
            {
              label: "Properties",
              content: (
                <KVTable
                  // prettier-ignore
                  rows={{
                    Id: skill.Id,
                    "Max level": skill.MaxLevel,
                    Type: skill.Type,
                    Target: skill.TargetType,
                    Element: renderLevelScaling(skill.Element, "Element"),
                    Status: skill.Status ?? "-",
                    Range: renderLevelScaling(skill.Range, "Size"),
                    Hits: renderLevelScaling(skill.HitCount, "Count"),
                    "AOE size": renderLevelScaling(skill.SplashArea, "Area"),
                    "Max active": renderLevelScaling(skill.ActiveInstance, "Max"),
                    Knockback: renderLevelScaling(skill.Knockback, "Amount"),
                    "Gives AP": renderLevelScaling(skill.GiveAp, "Amount"),
                    "Can be copied by": renderToggles(skill.CopyFlags?.Skill),
                    "May not be used near": renderToggles(skill.NoNearNPC?.Type),
                    "Damage flags": renderToggles(skill.DamageFlags),
                    "Other flags": renderToggles(skill.Flags),
                  }}
                />
              ),
            },
          ]}
        />
        <TabbedPaper
          tabs={[
            {
              label: "Requirements",
              content: (
                <KVTable
                  // prettier-ignore
                  rows={{
                "HP cost": renderLevelScaling(skill.Requires.HpCost, "Amount"),
                "SP cost": renderLevelScaling(skill.Requires.SpCost, "Amount"),
                "AP cost": renderLevelScaling(skill.Requires.ApCost, "Amount"),
                "HP% cost": renderLevelScaling(skill.Requires.HpRateCost, "Amount"),
                "SP% cost": renderLevelScaling(skill.Requires.SpRateCost, "Amount"),
                "AP% cost": renderLevelScaling(skill.Requires.ApRateCost, "Amount"),
                "Max HP": renderLevelScaling(skill.Requires.MaxHpTrigger, "Amount"),
                "Zeny cost": renderLevelScaling(skill.Requires.ZenyCost, "Amount", (n) => <Zeny value={n} />),
                "Spirit sphere cost": renderLevelScaling(skill.Requires.SpiritSphereCost, "Amount"),
                "Item cost": renderLevelScaling(
                  skill.Requires.ItemCost,
                  "Amount",
                  (n, o) => <>
                    {n}
                    {o?.Item && (
                      <ItemIdentifierByName name={o.Item}/>
                    )}
                  </>
                ),
                Weapon: renderToggles(skill.Requires.Weapon),
                Ammo: renderToggles(skill.Requires.Ammo),
                "Ammo amount": renderLevelScaling(skill.Requires.AmmoAmount, "Amount"),
                Equipment: renderToggles(skill.Requires.Equipment),
                Status: renderToggles(skill.Requires.Status),
                State: skill.Requires.State,
              }}
                />
              ),
            },
          ]}
        />
        <TabbedPaper
          tabs={[
            {
              label: "Timing",
              content: (
                <KVTable
                  // prettier-ignore
                  rows={{
                    "Duration 1": renderLevelScaling(skill.Duration1, "Time", timeString),
                    "Duration 2": renderLevelScaling(skill.Duration2, "Time", timeString),
                    "Cast cancels when hit": skill.CastCancel ? "Yes" : "No",
                    "Cast defense reduction": skill.CastDefenseReduction,
                    "Cast time": renderLevelScaling(skill.CastTime, "Time", timeString),
                    "Fixed cast time": renderLevelScaling(skill.FixedCastTime, "Time", timeString),
                    "Cast time flags": renderToggles(skill.CastTimeFlags),
                    Cooldown: renderLevelScaling(skill.Cooldown, "Time", timeString),
                    "After cast act delay": renderLevelScaling(skill.AfterCastActDelay, "Time", timeString),
                    "After cast walk delay": renderLevelScaling(skill.AfterCastWalkDelay, "Time", timeString),
                    "Cast delay flags": renderToggles(skill.CastDelayFlags),
                  }}
                />
              ),
            },
          ]}
        />
      </CommonPageGrid>
    </>
  );
}

const timeString = (n: number) => durationString(n);
