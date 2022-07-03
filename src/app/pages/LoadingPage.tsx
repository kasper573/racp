import { Center } from "../components/Center";
import { LoadingSpinner } from "../components/LoadingSpinner";

export function LoadingPage() {
  return (
    <Center>
      <LoadingSpinner size={80} />
    </Center>
  );
}
