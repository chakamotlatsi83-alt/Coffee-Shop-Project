import { useEffect, useState } from "react";
import { api } from "./api.js";

export default function App() {
  const [status, setStatus] = useState("Checking backend...");

  useEffect(() => {
    api
      .health()
      .then((d) => setStatus(`Backend: ${d.status}, database: ${d.database}`))
      .catch((e) => setStatus(`Backend error: ${e.message}`));
  }, []);

  return (
    <main style={{ fontFamily: "sans-serif", padding: 24 }}>
      <h1>☕ Coffee Shop</h1>
      <p>{status}</p>
    </main>
  );
}
