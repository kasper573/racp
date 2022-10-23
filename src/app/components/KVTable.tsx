import { ComponentProps, isValidElement, ReactElement } from "react";
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
            <TableCell>
              {isValidElement(value as any)
                ? (value as ReactElement)
                : `${value}`.trim() || "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
