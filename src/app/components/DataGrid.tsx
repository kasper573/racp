import {
  Box,
  Pagination,
  styled,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { MouseEvent, ComponentProps, useEffect, useState } from "react";
import {
  DataGrid as MuiDataGrid,
  GridColumns,
  GridFeatureMode,
} from "@mui/x-data-grid";
import { GridRowId } from "@mui/x-data-grid/models/gridRows";
import { GridRenderCellParams } from "@mui/x-data-grid/models/params/gridCellParams";
import {
  GridColDef,
  GridEnrichedColDef,
} from "@mui/x-data-grid/models/colDef/gridColDef";
import { typedKeys } from "../../lib/std/typedKeys";
import { SearchQuery, SearchResult, SearchSort } from "../../api/common/search";
import { Link } from "./Link";
import { LoadingSpinner } from "./LoadingSpinner";

export type DataGridProps<
  Entity,
  Filter,
  Id extends GridRowId
> = ColumnConventionProps<Entity, Id> &
  Omit<ComponentProps<typeof Box>, "id"> & {
    filter?: Filter;
    query: DataGridQueryFn<Entity, Filter>;
    data?: Entity[];
    gridProps?: Pick<
      ComponentProps<typeof MuiDataGrid>,
      "rowHeight" | "columnVisibilityModel"
    >;
    onHoveredEntityChange?: (entity?: Entity) => void;
  };

export function DataGrid<Entity, Filter, Id extends GridRowId>({
  filter,
  query: useQuery,
  data: manualEntities,
  columns,
  id,
  link,
  sx,
  gridProps,
  onHoveredEntityChange,
  ...props
}: DataGridProps<Entity, Filter, Id>) {
  const theme = useTheme();
  const isSmallDisplay = useMediaQuery(theme.breakpoints.down("sm"));
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState<SearchSort<Entity>>([]);
  const gridMode: GridFeatureMode = manualEntities ? "client" : "server";
  const { data: result, isFetching } = useQuery(
    {
      filter,
      sort,
      offset: pageIndex * pageSize,
      limit: pageSize,
    },
    { keepPreviousData: true, enabled: gridMode === "server" }
  );
  const entities = manualEntities ?? result?.entities ?? [];
  const total = manualEntities?.length ?? result?.total ?? 0;
  const pageCount = Math.ceil((total ?? 0) / pageSize);
  const columnList = processColumnConvention({ columns, id, link });

  useEffect(() => {
    if (pageIndex >= pageCount) {
      setPageIndex(Math.max(0, pageCount - 1));
    }
  }, [pageIndex, pageCount]);

  function emitHoverChange(target?: HTMLElement) {
    const hovered =
      target !== undefined
        ? entities?.find(
            (entity) => id(entity) === target?.getAttribute("data-id")
          )
        : undefined;
    onHoveredEntityChange?.(hovered);
  }

  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", ...sx }}
      {...props}
    >
      <Box sx={{ flex: 1 }}>
        <Grid
          disableColumnFilter
          disableColumnSelector={gridProps?.columnVisibilityModel !== undefined}
          columns={columnList}
          rows={entities}
          getRowId={(row) => id(row as Entity)}
          sortingMode={gridMode}
          paginationMode={gridMode}
          autoPageSize={true}
          page={pageIndex}
          pageSize={pageSize}
          // Effectively disable column buffering since it gets in the way of e2e testing.
          // The optimization is negligible anyway.
          columnBuffer={99}
          onPageSizeChange={setPageSize}
          components={{
            LoadingOverlay,
          }}
          componentsProps={{
            row: {
              onMouseEnter: (e: MouseEvent<HTMLElement>) =>
                emitHoverChange(e.currentTarget),
              onMouseLeave: () => emitHoverChange(undefined),
            },
          }}
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
          rowCount={total}
          loading={isFetching}
          {...gridProps}
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
        <Typography variant="caption">{`${total} matches`}</Typography>
        <Pagination
          page={pageIndex + 1}
          count={pageCount}
          onChange={(e, page) => setPageIndex(page - 1)}
          showFirstButton
          showLastButton
          boundaryCount={isSmallDisplay ? 0 : undefined}
          siblingCount={isSmallDisplay ? 0 : undefined}
        />
      </Box>
    </Box>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataGridQueryFn<Entity = any, Filter = any> = (
  query: SearchQuery<Entity, Filter>,
  options?: { keepPreviousData?: boolean; enabled?: boolean }
) => {
  data?: SearchResult<Entity>;
  isFetching: boolean;
};

type DefinedKeys = "query" | "link" | "id" | "columns";
DataGrid.define = <QueryFn extends DataGridQueryFn>(query: QueryFn) => {
  type Entity = QueryFn extends DataGridQueryFn<infer E> ? E : never;
  type Filter = QueryFn extends DataGridQueryFn<Entity, infer F> ? F : never;
  return <Id extends GridRowId>(
    definedProps: Omit<
      Pick<DataGridProps<Entity, Filter, Id>, DefinedKeys>,
      "query"
    >
  ) => {
    return function SpecificDataGrid(
      restProps: Omit<DataGridProps<Entity, Filter, Id>, DefinedKeys>
    ) {
      return <DataGrid query={query} {...definedProps} {...restProps} />;
    };
  };
};

const Grid = styled(MuiDataGrid)`
  min-height: 370px; // Never falls below 6 rows
  .MuiDataGrid-cell,
  .MuiDataGrid-columnHeader {
    &:focus,
    &:focus-within {
      outline: none;
    }
  }
`;

type ColumnConventionEntry<Entity> =
  | string
  | boolean
  | Omit<GridColDef<Entity>, "field">;

interface ColumnConventionProps<Entity, Id extends GridRowId> {
  columns: Partial<Record<keyof Entity, ColumnConventionEntry<Entity>>>;
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

function LoadingOverlay() {
  return (
    <Center>
      <LoadingSpinner />
    </Center>
  );
}

const Center = styled("div")`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
