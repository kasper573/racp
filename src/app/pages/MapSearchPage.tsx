import { useState } from "react";
import { Header } from "../layout/Header";
import { DataGrid, DataGridQueryFn } from "../components/DataGrid";
import { useSearchMapsQuery } from "../state/client";
import { MapInfo, MapInfoFilter } from "../../api/services/map/types";
import { MapSearchFilterForm } from "../forms/MapSearchFilterForm";

export default function MapSearchPage() {
  const [filter, setFilter] = useState<MapInfoFilter>({});
  return (
    <>
      <Header>Maps</Header>
      <MapSearchFilterForm value={filter} onChange={setFilter} />
      <MapGrid filter={filter} sx={{ mt: 1 }} />
    </>
  );
}

const MapGrid = DataGrid.define<MapInfo, MapInfoFilter, MapInfo["id"]>({
  // Without assertion typescript yields possibly infinite error
  query: useSearchMapsQuery as unknown as DataGridQueryFn<
    MapInfo,
    MapInfoFilter
  >,
  id: (map) => map.id,
  columns: {
    displayName: { headerName: "Name", width: 350 },
  },
});
