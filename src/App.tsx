import { useReducer } from "react";

export function App() {
  const [count, increase] = useReducer((n) => n + 1, 0);
  return <div onClick={increase}>Hello World {count}</div>;
}
