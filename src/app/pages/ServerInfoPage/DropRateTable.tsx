import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { uniqBy } from "lodash";
import { DropRateGroup } from "../../../api/rathena/DropRatesRegistry.types";
import { Percentage } from "../../components/Percentage";
import { joinNodes } from "../../../lib/joinNodes";

export function DropRateTable({ rates }: { rates: DropRateGroup[] }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Item Type</TableCell>
          <TableCell>Drop Rate</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rates.map(({ name, scales }) => (
          <TableRow key={name}>
            <TableCell>{name}</TableCell>
            <TableCell>
              {joinNodes(
                uniqBy(
                  [
                    { value: scales.all, label: "All monsters" },
                    { value: scales.bosses, label: "Boss monsters" },
                    { value: scales.mvps, label: "MVP monsters" },
                  ],
                  "value"
                ).map(({ value, label }) => (
                  <Tooltip title={label}>
                    <Percentage value={value} />
                  </Tooltip>
                )),
                " / "
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
