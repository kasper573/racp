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
import { LoadingPage } from "./LoadingPage";

export default function ServerInfoPage() {
  const settings = trpc.settings.readPublic.useQuery();
  const dropRates = trpc.drop.rates.useQuery();
  if (settings.isLoading || dropRates.isLoading) {
    return <LoadingPage />;
  }
  if (!settings.data || !dropRates.data) {
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
            <TableCell sx={{ whiteSpace: "nowrap" }}>{name}</TableCell>
            <TableCell>{scales.all * 100}%</TableCell>
            <TableCell>{scales.bosses * 100}%</TableCell>
            <TableCell>{scales.mvps * 100}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
