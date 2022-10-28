import { Box, Stack, useMediaQuery } from "@mui/material";
import { Children, ComponentProps } from "react";

export function CommonPageGrid({
  pixelCutoff = 1000,
  flexValues = [1, 1],
  children,
  sx,
  ...props
}: ComponentProps<typeof Box> & {
  flexValues?: [number, number];
  pixelCutoff?: number;
}) {
  const columnCount = useMediaQuery(`(max-width: ${pixelCutoff}px)`) ? 1 : 2;
  const childrenArray = Children.toArray(children);
  const columns = splitIntoColumns(childrenArray, columnCount);
  return (
    <Stack direction="row" spacing={3} sx={{ width: "100%", ...sx }} {...props}>
      {columns.map((column, index) => (
        <Stack
          key={index}
          direction="column"
          spacing={2}
          sx={{ flex: flexValues[index] }}
        >
          {column}
        </Stack>
      ))}
    </Stack>
  );
}

function splitIntoColumns<T>(items: T[], numColumns: number): T[][] {
  const columns: T[][] = [];
  for (let i = 0; i < items.length; i++) {
    let columnIndex = i % numColumns;
    const column = columns[columnIndex] ?? (columns[columnIndex] = []);
    column.push(items[i]);
  }
  return columns;
}
