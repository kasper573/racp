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
            <TableCell sx={{ whiteSpace: "nowrap" }}>{key}</TableCell>
            <TableCell>{renderValue(value)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function renderValue(value: unknown) {
  if (isValidElement(value as any)) {
    return value as ReactElement;
  }
  switch (typeof value) {
    case "boolean":
      return value ? "Yes" : "No";
    default:
      return `${value}`.trim() || "-";
  }
}
