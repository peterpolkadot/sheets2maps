"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/properties")
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
    if (rows.length === 0) return;

    const checkGoogleMaps = setInterval(() => {
      if (typeof google !== "undefined" && google.maps) {
        clearInterval(checkGoogleMaps);
        initMap();
      }
    }, 100);

    return () => clearInterval(checkGoogleMaps);
  }, [rows]);

  function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 6,
      center: { lat: -37.8136, lng: 144.9631 } // Melbourne center
    });

    let markersAdded = 0;

    rows.forEach(item => {
      if (!item.Coordinates) return;
      
      // Handle coordinates with or without spaces after comma
      const coords = item.Coordinates.replace(/\s+/g, "");
      const parts = coords.split(",");
      
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      
      if (isNaN(lat) || isNaN(lng)) {
        console.log("Invalid coords for:", item["Site Name"], lat, lng);
        return;
      }

      new google.maps.Marker({
        position: { lat, lng },
        map,
        title: item["Site Name"] || "Property"
      });
      
      markersAdded++;
    });

    console.log("Markers added:", markersAdded);
    setMapLoaded(true);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Sheets2Maps – Catholic Diocese Properties</h1>
      
      {error && (
        <div style={{ 
          background: "#fee", 
          padding: 20, 
          marginBottom: 20,
          border: "1px solid red"
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <p style={{ marginBottom: 20 }}>
        Total Properties Loaded: {rows.length}
        {mapLoaded && <span style={{ color: "green", marginLeft: 20 }}>✓ Map Loaded</span>}
      </p>

      <div id="map" style={{
        width: "100%",
        height: "600px",
        marginBottom: 20,
        border: "2px solid #333"
      }}></div>

      <details>
        <summary style={{ cursor: "pointer", fontWeight: "bold", marginBottom: 10 }}>
          View Raw Data ({rows.length} properties)
        </summary>
        <pre style={{
          background: "#eee",
          padding: 20,
          maxHeight: 400,
          overflow: "auto",
          fontSize: 12
        }}>
{JSON.stringify(rows, null, 2)}
        </pre>
      </details>
    </div>
  );
}