import { useState } from "react";
import { useGetHelloQuery } from "./client";

export function App() {
  const [input, setInput] = useState("");
  const n = parseFloat(input);
  const { data } = useGetHelloQuery(isNaN(n) ? 0 : n);

  return (
    <div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <ul>
        {data?.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
