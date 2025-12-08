"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

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
    if (typeof window === "undefined") return;

    window.initMap = function () {
      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 5,
        center: { lat: -25.2744, lng: 133.7751 }
      });

      fetch("/api/properties")
        .then(r => r.json())
        .then(data => {
          if (data.error) return;
          data.forEach(item => {
            if (!item.Coordinates) return;
            const parts = item.Coordinates.split(",");
            const lat = parseFloat(parts[0]);
            const lng = parseFloat(parts[1]);
            if (isNaN(lat) || isNaN(lng)) return;

            new google.maps.Marker({
              position: { lat, lng },
              map,
              title: item["Site Name"] || "Property"
            });
          });
        });
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Sheets2Maps – Connected Live to Excel</h1>
      
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
      
      <p style={{ marginBottom: 20 }}>Total Rows Loaded: {rows.length}</p>

      <pre style={{
        background: "#eee",
        padding: 20,
        maxHeight: 200,
        overflow: "auto"
      }}>
{JSON.stringify(rows, null, 2)}
      </pre>

      <div id="map" style={{
        width: "100%",
        height: "70vh",
        marginTop: 20,
        border: "1px solid #ccc"
      }}></div>

      <script async src={
        "https://maps.googleapis.com/maps/api/js?key=" +
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY +
        "&callback=initMap"
      }></script>
    </div>
  );
}