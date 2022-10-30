import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { useMemo } from "react";
import { Header } from "../layout/Header";
import { trpc } from "../state/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { TabbedPaper } from "../components/TabbedPaper";
import { DropRateGroup } from "../../api/rathena/DropRatesRegistry.types";
import { colorForAmount, ColorStop } from "../util/colorForAmount";
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
      <TabbedPaper
        tabs={[
          {
            label: "Drop rates",
            content: <DropRateTable rates={dropRates.data} />,
          },
        ]}
      />
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
            <DropRateTableCell rate={scales.all} />
            <DropRateTableCell rate={scales.bosses} />
            <DropRateTableCell rate={scales.mvps} />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function DropRateTableCell({ rate }: { rate: number }) {
  const theme = useTheme();
  const color = useMemo(
    () => colorForAmount(rate, createColorStops(theme.palette.text.primary)),
    [rate, theme.palette.text.primary]
  );
  return <TableCell sx={{ color }}>{rate * 100}%</TableCell>;
}

const createColorStops = (defaultColor: string): ColorStop[] => [
  [0, "#ff0000"],
  [1, defaultColor],
  [2, "#00ff00"],
];
