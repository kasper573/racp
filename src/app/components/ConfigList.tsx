export function ConfigList({
  configs,
  onSelect,
}: {
  configs: string[];
  onSelect: (config: string) => void;
}) {
  return (
    <ul>
      {configs.map((item, index) => (
        <li key={index} onClick={() => onSelect(item)}>
          {item}
        </li>
      ))}
    </ul>
  );
}
