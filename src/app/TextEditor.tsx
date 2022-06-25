import { useElevatedState } from "../hooks/useElevatedState";

export function TextEditor({
  value: inputValue = "",
  onChange,
}: {
  value?: string;
  onChange: (update: string) => void;
}) {
  const [value, setValue] = useElevatedState(inputValue, onChange);

  return (
    <textarea
      style={{ height: "50vh", width: "100%" }}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
