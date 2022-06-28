import { Box, Pagination, styled } from "@mui/material";
import { useState } from "react";
import { DataGrid as MuiDataGrid, GridColumns } from "@mui/x-data-grid";
import { GridRowId } from "@mui/x-data-grid/models/gridRows";
import { GridRenderCellParams } from "@mui/x-data-grid/models/params/gridCellParams";
import { GridEnrichedColDef } from "@mui/x-data-grid/models/colDef/gridColDef";
import {
  SearchQuery,
  SearchResult,
  SearchSort,
} from "../../api/services/search.types";
import { typedKeys } from "../../lib/typedKeys";
import { Link } from "./Link";

export function DataGrid<Entity, Id extends GridRowId>({
  query: useQuery,
  columns,
  id,
  link,
}: ColumnConventionProps<Entity, Id> & {
  query: (query: SearchQuery<Entity>) => {
    data?: SearchResult<Entity>;
    isFetching: boolean;
  };
}) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState<SearchSort<Entity>>([]);
  const { data: result, isFetching } = useQuery({
    sort,
    offset: pageIndex * pageSize,
    limit: pageSize,
  });
  const pageCount = Math.floor((result?.total ?? 0) / pageSize);
  const columnList = processColumnConvention({ columns, id, link });

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box></Box>
      <Box sx={{ flex: 1 }}>
        <Grid
          disableColumnFilter
          columns={columnList}
          rows={result?.entities ?? []}
          getRowId={(row) => id(row as Entity)}
          filterMode="server"
          sortingMode="server"
          paginationMode="server"
          page={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
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
          rowsPerPageOptions={[20]}
          pagination
          disableSelectionOnClick
          rowCount={result?.total ?? 0}
          loading={isFetching}
        />
      </Box>
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
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

const Grid = styled(MuiDataGrid)`
  .MuiDataGrid-cell,
  .MuiDataGrid-columnHeader {
    &:focus,
    &:focus-within {
      outline: none;
    }
  }
`;

interface ColumnConventionProps<Entity, Id extends GridRowId> {
  columns: Partial<Record<keyof Entity, string>>;
  id: (entity: Entity) => Id;
  link: (id: Id) => { $: string };
}

function processColumnConvention<Entity, Id extends GridRowId>({
  columns,
  id,
  link,
}: ColumnConventionProps<Entity, Id>): GridColumns {
  const [firstColumn, ...restColumns] = typedKeys(columns).map(
    (field): GridEnrichedColDef<Entity> => ({
      field: String(field),
      headerName: columns[field],
    })
  );
  return [
    {
      ...firstColumn,
      width: 300,
      renderCell({ value, row }: GridRenderCellParams) {
        return <Link to={link(id(row))}>{value}</Link>;
      },
    },
    ...restColumns.map((column) => ({
      ...column,
      renderCell: ({ value }: GridRenderCellParams) => value ?? "-",
    })),
  ];
}
