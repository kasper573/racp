import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { DropRateGroup } from "../../../api/rathena/DropRatesRegistry.types";
import { Percentage } from "../../components/Percentage";

export function DropRateTable({ rates }: { rates: DropRateGroup[] }) {
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
