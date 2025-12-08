import { useState, useEffect } from 'react';

export default function Home() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetch('/api/properties')
      .then(r => r.json())
      .then(data => setProperties(data));
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h1>Sheets → Maps</h1>
      <p>Total Loaded: {properties.length}</p>
      <a href='/map'>View Map</a>
    </div>
  );
}
