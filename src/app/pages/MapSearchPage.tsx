import { useState } from "react";
import { Button } from "@mui/material";
import { Header } from "../layout/Header";
import { MapInfoFilter } from "../../api/services/map/types";
import { MapSearchFilterForm } from "../forms/MapSearchFilterForm";
import { MapGrid } from "../grids/MapGrid";

export default function MapSearchPage() {
  const [filter, setFilter] = useState<MapInfoFilter>({});
  return (
    <>
      <Header>
        Maps
        <Button
          onClick={() => setFilter({})}
          size="small"
          sx={{ position: "absolute", right: 0 }}
        >
          Clear filters
        </Button>
      </Header>
      <MapSearchFilterForm value={filter} onChange={setFilter} />
      <MapGrid filter={filter} sx={{ mt: 1 }} />
    </>
  );
}
