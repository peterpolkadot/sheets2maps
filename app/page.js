
import { useEffect, useState } from "react";

export default function Home() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetch("/api/properties")
      .then(res => res.json())
      .then(setRows);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Sheets2Maps – Live Excel Data</h1>
      <p>Total rows loaded: {rows.length}</p>

      <ul>
        {rows.map((r, i) => (
          <li key={i}>{JSON.stringify(r)}</li>
        ))}
      </ul>
    </div>
  );
}
