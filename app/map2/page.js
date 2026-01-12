"use client";

import { useEffect, useState } from "react";

export default function Map2() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    fetch("/api/properties2")
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setRows(data);
          // TODO: Process your second sheet data here
        }
      })
      .catch(err => setError(err.toString()));
  }, []);

  useEffect(() => {
    const checkGoogleMaps = setInterval(() => {
      if (typeof google !== "undefined" && google.maps) {
        clearInterval(checkGoogleMaps);
        initMap();
      }
    }, 100);

    return () => clearInterval(checkGoogleMaps);
  }, []);

  function initMap() {
    const victoriaCenter = { lat: -37.4713, lng: 144.7852 };
    
    const newMap = new google.maps.Map(document.getElementById("map2"), {
      zoom: 7,
      center: victoriaCenter
    });
    
    setMap(newMap);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <div style={{ 
        background: "#006a8e",
        padding: "32px 24px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <h1 style={{ 
            margin: "0 0 8px 0", 
            color: "white", 
            fontSize: 32, 
            fontWeight: 700,
            letterSpacing: "-0.5px"
          }}>
            Secondary Dashboard
          </h1>
          <p style={{ 
            margin: 0, 
            color: "rgba(255,255,255,0.9)", 
            fontSize: 16 
          }}>
            Additional Property Data Visualization
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
        {error && (
          <div style={{ 
            background: "#fee2e2", 
            padding: 20, 
            marginBottom: 24,
            border: "1px solid #ef4444",
            borderRadius: 8,
            color: "#991b1b"
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div style={{
          background: "white",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          marginBottom: 24
        }}>
          <div id="map2" style={{
            width: "100%",
            height: "700px"
          }}></div>
        </div>

        <div style={{ 
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <p style={{ margin: 0, color: "#64748b" }}>
            Configure this dashboard to display data from your second Excel sheet.
            <br />
            Total records: {rows.length}
          </p>
        </div>
      </div>
    </div>
  );
}