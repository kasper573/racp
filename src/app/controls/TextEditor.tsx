import { styled } from "@mui/material";
import { useElevatedState } from "../hooks/useElevatedState";

export function TextEditor({
  value: inputValue = "",
  onChange,
}: {
  value?: string;
  onChange: (update: string) => void;
}) {
  const [value, setValue] = useElevatedState(inputValue, onChange);

  return <Text value={value} onChange={(e) => setValue(e.target.value)} />;
}

const Text = styled("textarea")`
  display: flex;
  flex: 1;
  background-color: ${({ theme }) => theme.palette.background.paper};
  color: ${({ theme }) => theme.palette.text.primary};
`;
