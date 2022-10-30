import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Header } from "../layout/Header";
import { trpc } from "../state/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { TabbedPaper } from "../components/TabbedPaper";
import { DropRateGroup } from "../../api/rathena/DropRatesRegistry.types";
import { CommonPageGrid } from "../components/CommonPageGrid";
import { KVTable } from "../components/KVTable";
import { Zeny } from "../components/Zeny";
import { ExpConfig } from "../../api/services/exp/types";
import { Percentage } from "../components/Percentage";
import { LoadingPage } from "./LoadingPage";

export default function ServerInfoPage() {
  const settings = trpc.settings.readPublic.useQuery();
  const dropRates = trpc.drop.rates.useQuery();
  const exp = trpc.exp.config.useQuery();

  if (settings.isLoading || dropRates.isLoading || exp.isLoading) {
    return <LoadingPage />;
  }

  if (!settings.data || !dropRates.data || !exp.data) {
    return (
      <ErrorMessage error="Something went wrong, please try again later" />
    );
  }

  return (
    <>
      <Header />
      <Typography paragraph>
        Server is using {settings.data.rAthenaMode} mode.
      </Typography>
      <CommonPageGrid>
        <TabbedPaper
          tabs={[
            {
              label: "Drop rates",
              content: <DropRateTable rates={dropRates.data} />,
            },
          ]}
        />
        <TabbedPaper
          tabs={[
            {
              label: "Experience",
              content: <ExperienceConfigTable config={exp.data} />,
            },
          ]}
        />
      </CommonPageGrid>
    </>
  );
}

function DropRateTable({ rates }: { rates: DropRateGroup[] }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Item type</TableCell>
          <TableCell>Common monsters</TableCell>
          <TableCell>Boss monsters</TableCell>
          <TableCell>Mvp monsters</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rates.map(({ name, scales }) => (
          <TableRow key={name}>
            <TableCell>{name}</TableCell>
            <TableCell>
              <Percentage value={scales.all} />
            </TableCell>
            <TableCell>
              <Percentage value={scales.bosses} />
            </TableCell>
            <TableCell>
              <Percentage value={scales.mvps} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ExperienceConfigTable({ config }: { config: ExpConfig }) {
  return (
    <KVTable
      rows={{
        "Base rate": <Percentage value={config.base_exp_rate} />,
        "Job rate": <Percentage value={config.job_exp_rate} />,
        "Mvp rate": <Percentage value={config.mvp_exp_rate} />,
        "Quest rate": <Percentage value={config.quest_exp_rate} />,
        "Max experience gained per kill": config.max_exp_gain_rate ? (
          <Percentage value={config.max_exp_gain_rate} colorize={false} />
        ) : (
          "Unlimited"
        ),
        "Max levels gained per kill": config.multi_level_up ? (
          <>
            Base{" "}
            {config.multi_level_up_base
              ? config.multi_level_up_base
              : "Unlimited"}
            , Job{" "}
            {config.multi_level_up_job
              ? config.multi_level_up_job
              : "Unlimited"}
          </>
        ) : (
          1
        ),
        "Death experience penalty": (
          <>
            Base{" "}
            <Percentage value={config.death_penalty_base} colorize={false} />,
            Job <Percentage value={config.death_penalty_job} colorize={false} />
          </>
        ),
        "Death zeny penalty": <Zeny value={config.zeny_penalty} />,
      }}
    />
  );
}
