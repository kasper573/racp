import { Header } from "../layout/Header";
import { MvpGrid } from "../grids/MvpGrid";

export default function MvpSearchPage() {
  return (
    <>
      <Header>Mvp board</Header>
      <MvpGrid sx={{ mt: 1 }} />
    </>
  );
}
