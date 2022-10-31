import { Box, styled } from "@mui/material";
import {
  ComponentProps,
  ComponentType,
  MouseEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
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
import { isDeepEqual } from "@mui/x-data-grid/internals";
import calculateTextWidth from "calculate-text-width";
import { typedKeys } from "../../lib/std/typedKeys";
import { SearchQuery, SearchResult, SearchSort } from "../../api/common/search";
import { useWindowSize, WindowSize } from "../../lib/hooks/useWindowSize";
import { useOnChange } from "../../lib/hooks/useOnChange";
import { useLatest } from "../../lib/hooks/useLatest";
import { RouteLocation } from "../../lib/tsr/types";
import { Link } from "./Link";
import { LoadingSpinner } from "./LoadingSpinner";
import { Center } from "./Center";

export type DataGridProps<
  Entity,
  Filter,
  Id extends GridRowId
> = ColumnConventionProps<Entity, Id> &
  Omit<ComponentProps<typeof Box>, "id"> & {
    filter?: Filter;
    query?: DataGridQueryFn<Entity, Filter>;
    data?: Entity[];
    gridProps?: Pick<
      ComponentProps<typeof MuiDataGrid>,
      "rowHeight" | "columnVisibilityModel"
    >;
    id: (entity: Entity) => Id;
    emptyComponent?: ComponentType;
    onHoveredEntityChange?: (entity?: Entity) => void;
  };

export function DataGrid<
  Entity,
  Filter = unknown,
  Id extends GridRowId = GridRowId
>({
  filter,
  query: useQuery,
  data: manualEntities,
  columns,
  id,
  link,
  sx,
  gridProps,
  onHoveredEntityChange,
  emptyComponent: EmptyComponent,
  ...props
}: DataGridProps<Entity, Filter, Id>) {
  const windowSize = useWindowSize();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(3);
  const [sort, setSort] = useState<SearchSort<Entity>>([]);
  const gridMode: GridFeatureMode = manualEntities ? "client" : "server";
  const { data: result, isFetching } = useQuery?.(
    {
      filter,
      sort,
      offset: pageIndex * pageSize,
      limit: pageSize,
    },
    { keepPreviousData: true, enabled: gridMode === "server" }
  ) ?? { data: undefined, isFetching: false };
  const entities = manualEntities ?? result?.entities ?? [];
  const total = manualEntities?.length ?? result?.total ?? 0;
  const pageCount = Math.ceil((total ?? 0) / pageSize);
  const latest = useLatest({ link });
  const columnList = useMemo(
    () =>
      processColumnConvention({
        columns,
        link: (...args) => latest.current?.link?.(...args),
        windowWidth: windowSize?.width,
      }),
    [columns, latest, windowSize?.width]
  );

  useEffect(() => {
    if (pageIndex >= pageCount) {
      setPageIndex(Math.max(0, pageCount - 1));
    }
  }, [pageIndex, pageCount]);

  useOnChange(filter, isDeepEqual, () => setPageIndex(0));

  function emitHoverChange(target?: HTMLElement) {
    const hovered =
      target !== undefined
        ? entities?.find(
            (entity) => id(entity) === target?.getAttribute("data-id")
          )
        : undefined;
    onHoveredEntityChange?.(hovered);
  }

  const ariaLabel = props["aria-label"] ?? "Data Grid";
  delete props["aria-label"];

  return (
    <Box sx={{ flex: 1, ...sx }} {...props}>
      <Grid
        aria-label={ariaLabel}
        disableColumnFilter
        disableColumnSelector={gridProps?.columnVisibilityModel !== undefined}
        columns={columnList}
        rows={entities}
        getRowId={(row) => id(row as Entity)}
        sortingMode={gridMode}
        paginationMode={gridMode}
        autoPageSize={true}
        page={pageIndex}
        onPageChange={setPageIndex}
        // Effectively disable column buffering since it gets in the way of e2e testing.
        // The optimization is negligible anyway.
        columnBuffer={99}
        onPageSizeChange={setPageSize}
        components={{
          LoadingOverlay,
          NoRowsOverlay: EmptyComponent
            ? () => (
                <Center>
                  <EmptyComponent />
                </Center>
              )
            : undefined,
        }}
        componentsProps={{
          row: {
            onMouseEnter: (e: MouseEvent<HTMLElement>) =>
              emitHoverChange(e.currentTarget),
            onMouseLeave: () => emitHoverChange(undefined),
          },
        }}
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

type DefinedKeys = "query" | "link" | "id" | "columns" | "emptyComponent";
DataGrid.define = <QueryFn extends DataGridQueryFn>(
  predefinedQuery: QueryFn
) => {
  type Entity = QueryFn extends DataGridQueryFn<infer E> ? E : never;
  type Filter = QueryFn extends DataGridQueryFn<Entity, infer F> ? F : never;
  return <Id extends GridRowId>(
    definedProps: Omit<
      Pick<DataGridProps<Entity, Filter, Id>, DefinedKeys>,
      "query"
    >
  ) => {
    type Columns = ColumnConventionProps<Entity, Id>["columns"];
    return function SpecificDataGrid({
      query = predefinedQuery,
      columns: transformColumns,
      ...restProps
    }: Omit<DataGridProps<Entity, Filter, Id>, DefinedKeys> & {
      query?: DataGridQueryFn<Entity, Filter>;
      columns?: (columns: Columns) => Columns;
    }) {
      const { columns, ...rest } = { ...definedProps, ...restProps };
      return (
        <DataGrid
          query={query}
          columns={transformColumns ? transformColumns(columns) : columns}
          {...rest}
        />
      );
    };
  };
};

const Grid = styled(MuiDataGrid)`
  min-height: 371px; // Never falls below 5 rows
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

export interface ColumnConventionProps<Entity, Id extends GridRowId> {
  columns:
    | Partial<Record<keyof Entity, ColumnConventionEntry<Entity>>>
    | Record<string, GridColDef<Entity>>;
  link?: (entity: Entity) => RouteLocation | undefined;
  windowWidth?: WindowSize["width"];
}

function processColumnConvention<Entity, Id extends GridRowId>({
  columns,
  link,
  windowWidth = 0,
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
      flex: 2,
      minWidth: Math.max(200, windowWidth / 7),
      ...firstColumn,
      renderCell(params: GridRenderCellParams) {
        if (firstColumn.renderCell) {
          return (
            firstColumn.renderCell(params) ?? params.value ?? emptyCellValue
          );
        }
        const { row, value = emptyCellValue } = params;
        const linkTo = link?.(row);
        return linkTo ? <Link to={linkTo}>{value}</Link> : value;
      },
    },
    ...restColumns.map((column) => {
      const minWidth =
        // Based on the default font of DataGrid column headers
        calculateTextWidth(column.headerName ?? "", "normal 500 14px Roboto") +
        24; // Make room for the built-in DataGrid 12px padding on each side
      return {
        flex: 1,
        minWidth,
        ...column,
        renderCell(params: GridRenderCellParams) {
          return column.renderCell?.(params) ?? params.value ?? emptyCellValue;
        },
      };
    }),
  ];
}

const emptyCellValue = "-";

function LoadingOverlay() {
  return (
    <Center>
      <LoadingSpinner />
    </Center>
  );
}
