import { LoadingSpinner } from "../components/LoadingSpinner";
import { CenteredContent } from "../components/CenteredContent";

export function LoadingPage() {
  return (
    <CenteredContent sx={{ textAlign: "center" }}>
      <LoadingSpinner size={80} />
    </CenteredContent>
  );
}
