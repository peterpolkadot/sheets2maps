"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetch("/api/properties")
      .then(r => r.json())
      .then(setRows);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Sheets2Maps – Connected Mockup</h1>
      <p>Total Rows Loaded: {rows.length}</p>

      <pre>{JSON.stringify(rows.slice(0, 3), null, 2)}</pre>
    </div>
  );
}