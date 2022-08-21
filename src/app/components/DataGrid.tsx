import { Box, Pagination, styled, Typography } from "@mui/material";
import { ComponentProps, useEffect, useState } from "react";
import { DataGrid as MuiDataGrid, GridColumns } from "@mui/x-data-grid";
import { GridRowId } from "@mui/x-data-grid/models/gridRows";
import { GridRenderCellParams } from "@mui/x-data-grid/models/params/gridCellParams";
import {
  GridColDef,
  GridEnrichedColDef,
} from "@mui/x-data-grid/models/colDef/gridColDef";
import {
  SearchQuery,
  SearchResult,
  SearchSort,
} from "../../api/services/search/types";
import { typedKeys } from "../../lib/typedKeys";
import { Link } from "./Link";

export type DataGridProps<
  Entity,
  Filter,
  Id extends GridRowId
> = ColumnConventionProps<Entity, Id> &
  Omit<ComponentProps<typeof Box>, "id"> & {
    filter?: Filter;
    query: DataGridQueryFn<Entity, Filter>;
  };

export function DataGrid<Entity, Filter, Id extends GridRowId>({
  filter,
  query: useQuery,
  columns,
  id,
  link,
  sx,
  ...props
}: DataGridProps<Entity, Filter, Id>) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState<SearchSort<Entity>>([]);
  const { data: result, isFetching } = useQuery({
    filter,
    sort,
    offset: pageIndex * pageSize,
    limit: pageSize,
  });
  const pageCount = Math.ceil((result?.total ?? 0) / pageSize);
  const columnList = processColumnConvention({ columns, id, link });

  useEffect(() => {
    if (pageIndex >= pageCount) {
      setPageIndex(Math.max(0, pageCount - 1));
    }
  }, [pageIndex, pageCount]);

  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", ...sx }}
      {...props}
    >
      <Box sx={{ flex: 1 }}>
        <Grid
          disableColumnFilter
          columns={columnList}
          rows={result?.entities ?? []}
          getRowId={(row) => id(row as Entity)}
          filterMode="server"
          sortingMode="server"
          paginationMode="server"
          autoPageSize={true}
          page={pageIndex}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          hideFooter
          onSortModelChange={
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setSort as any
          }
          sortModel={
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sort as any
          }
          pagination
          disableSelectionOnClick
          rowCount={result?.total ?? 0}
          loading={isFetching}
        />
      </Box>
      <Box
        sx={{
          mt: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="caption">
          {result && `${result.total} matches`}
        </Typography>
        <Pagination
          page={pageIndex + 1}
          count={pageCount}
          onChange={(e, page) => setPageIndex(page - 1)}
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataGridQueryFn<Entity = any, Filter = any> = (
  query: SearchQuery<Entity, Filter>
) => {
  data?: SearchResult<Entity>;
  isFetching: boolean;
};

type DefinedKeys = "query" | "link" | "id" | "columns";
DataGrid.define = <Entity, Filter, Id extends GridRowId>(
  definedProps: Pick<DataGridProps<Entity, Filter, Id>, DefinedKeys>
) => {
  return function SpecificDataGrid(
    restProps: Omit<DataGridProps<Entity, Filter, Id>, DefinedKeys>
  ) {
    return <DataGrid {...definedProps} {...restProps} />;
  };
};

const Grid = styled(MuiDataGrid)`
  .MuiDataGrid-cell,
  .MuiDataGrid-columnHeader {
    &:focus,
    &:focus-within {
      outline: none;
    }
  }
`;

type ColumnConventionEntry = string | boolean | Omit<GridColDef, "field">;

interface ColumnConventionProps<Entity, Id extends GridRowId> {
  columns: Partial<Record<keyof Entity, ColumnConventionEntry>>;
  id: (entity: Entity) => Id;
  link?: (id: Id, entity: Entity) => { $: string };
}

function processColumnConvention<Entity, Id extends GridRowId>({
  columns,
  id,
  link,
}: ColumnConventionProps<Entity, Id>): GridColumns {
  const [firstColumn, ...restColumns] = typedKeys(columns).map(
    (field): GridEnrichedColDef<Entity> => {
      const entry = columns[field];
      if (typeof entry === "object") {
        return { field: String(field), ...entry };
      }
      return {
        field: String(field),
        headerName: typeof entry === "string" ? entry : String(field),
      };
    }
  );
  return [
    {
      ...firstColumn,
      width: firstColumn.width ?? 180,
      renderCell:
        firstColumn.renderCell ??
        (({ value, row }: GridRenderCellParams) => {
          return link ? <Link to={link(id(row), row)}>{value}</Link> : value;
        }),
    },
    ...restColumns.map((column) => ({
      ...column,
      renderCell:
        column.renderCell ??
        (({ value }: GridRenderCellParams) => value ?? "-"),
    })),
  ];
}
