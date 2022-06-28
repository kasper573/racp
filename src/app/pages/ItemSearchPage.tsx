import { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, styled } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid/models/params/gridCellParams";
import { Header } from "../layout/Header";
import { useSearchItemsQuery } from "../client";
import { Link } from "../components/Link";
import { router } from "../router";
import { Item } from "../../api/services/item.types";
import { typedKeys } from "../../lib/typedKeys";
import { SearchSort } from "../../api/services/search.types";

export default function ItemSearchPage() {
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState<SearchSort<Item>>([]);
  const { data: result, isFetching } = useSearchItemsQuery({
    sort,
    offset: pageNumber * pageSize,
    limit: pageSize,
  });
  return (
    <>
      <Header>Item Search</Header>
      {result && (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Box></Box>
          <Box sx={{ flex: 1 }}>
            <NoFocusGrid
              columns={itemColumns}
              rows={result.entities}
              getRowId={(entity) => entity.Id}
              filterMode="server"
              sortingMode="server"
              paginationMode="server"
              page={pageNumber}
              pageSize={pageSize}
              onPageChange={setPageNumber}
              onPageSizeChange={setPageSize}
              onSortModelChange={
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setSort as any
              }
              sortModel={sort}
              rowsPerPageOptions={[20]}
              pagination
              disableSelectionOnClick
              rowCount={result.total}
              loading={isFetching}
            />
          </Box>
        </Box>
      )}
    </>
  );
}

const NoFocusGrid = styled(DataGrid)`
  .MuiDataGrid-cell {
    &:focus,
    &:focus-within {
      outline: none;
    }
  }
`;

const fields: Partial<Record<keyof Item, string>> = {
  Buy: "Buy",
  Sell: "Sell",
  Weight: "Weight",
  Attack: "Atk",
  MagicAttack: "MAtk",
  Defense: "Def",
  EquipLevelMin: "Min Level",
  EquipLevelMax: "Max Level",
};

const itemColumns = [
  {
    field: "Name",
    width: 300,
    renderCell({ value, id }: GridRenderCellParams) {
      return <Link to={router.item().view({ id: id as number })}>{value}</Link>;
    },
  },
  ...typedKeys(fields).map((field) => ({
    field,
    headerName: fields[field],
    renderCell: ({ value }: GridRenderCellParams) => value ?? "-",
  })),
];
