import { Header } from "../layout/Header";
import { MVPGrid } from "../grids/MVPGrid";

export default function MVPSearchPage() {
  return (
    <>
      <Header>MVP board</Header>
      <MVPGrid sx={{ mt: 1 }} />
    </>
  );
}
