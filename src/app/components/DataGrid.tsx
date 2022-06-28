import { Box, Pagination, styled } from "@mui/material";
import { useState } from "react";
import { DataGrid as MuiDataGrid } from "@mui/x-data-grid";
import { GridColumns } from "@mui/x-data-grid/models/colDef/gridColDef";
import {
  SearchQuery,
  SearchResult,
  SearchSort,
} from "../../api/services/search.types";

export function DataGrid<Entity>({
  columns,
  query: useQuery,
}: {
  columns: GridColumns;
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
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box></Box>
      <Box sx={{ flex: 1 }}>
        <Grid
          disableColumnFilter
          columns={columns}
          rows={result?.entities ?? []}
          getRowId={(entity) => entity.Id}
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
  .MuiDataGrid-cell {
    &:focus,
    &:focus-within {
      outline: none;
    }
  }
`;
