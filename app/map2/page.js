"use client";

import { useEffect, useState } from "react";

export default function Map2() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    fetch("/api/properties2")
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setRows(data);
        }
      })
      .catch(err => setError(err.toString()));
  }, []);

  useEffect(() => {
    const checkGoogleMaps = setInterval(() => {
      if (typeof google !== "undefined" && google.maps) {
        clearInterval(checkGoogleMaps);
        const newMap = new google.maps.Map(document.getElementById("map2"), {
          zoom: 7,
          center: { lat: -37.4713, lng: 144.7852 }
        });
        setMap(newMap);
      }
    }, 100);

    return () => clearInterval(checkGoogleMaps);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <div style={{ background: "#006a8e", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <h1 style={{ margin: "0 0 8px 0", color: "white", fontSize: 32 }}>
            Secondary Dashboard
          </h1>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.9)", fontSize: 16 }}>
            Additional Property Data
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
        {error && (
          <div style={{ background: "#fee2e2", padding: 20, marginBottom: 24, borderRadius: 8 }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div style={{ background: "white", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
          <div id="map2" style={{ width: "100%", height: "700px" }}></div>
        </div>

        <div style={{ background: "white", padding: 24, borderRadius: 12 }}>
          <p>Total records: {rows.length}</p>
        </div>
      </div>
    </div>
  );
}