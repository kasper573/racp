import { CircularProgress } from "@mui/material";
import { Center } from "../components/Center";

export function LoadingPage() {
  return (
    <Center>
      <CircularProgress size={80} />
    </Center>
  );
}
