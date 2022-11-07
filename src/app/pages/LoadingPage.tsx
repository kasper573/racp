import { LoadingIndicator } from "../components/LoadingIndicator";
import { CenteredContent } from "../components/CenteredContent";

export function LoadingPage() {
  return (
    <CenteredContent sx={{ textAlign: "center" }}>
      <LoadingIndicator size={80} />
    </CenteredContent>
  );
}
