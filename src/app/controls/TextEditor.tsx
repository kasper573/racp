import { styled } from "@mui/material";
import {
  useElevatedState,
  UseElevatedStateProps,
} from "../hooks/useElevatedState";

export function TextEditor(props: UseElevatedStateProps<string>) {
  const [value, setValue] = useElevatedState(props);

  return <Text value={value} onChange={(e) => setValue(e.target.value)} />;
}

const Text = styled("textarea")`
  display: flex;
  flex: 1;
  background-color: ${({ theme }) => theme.palette.background.paper};
  color: ${({ theme }) => theme.palette.text.primary};
`;
