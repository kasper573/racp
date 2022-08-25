import { ComponentProps } from "react";
import { Table, TableBody, TableCell, TableRow } from "@mui/material";

export function KVTable({
  rows,
  ...props
}: { rows: Record<string, unknown> } & ComponentProps<typeof Table>) {
  return (
    <Table size="small" {...props}>
      <TableBody>
        {Object.entries(rows).map(([key, value], index) => (
          <TableRow key={index}>
            <TableCell>{key}</TableCell>
            <TableCell>{`${value}`}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
