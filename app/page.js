"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [entities, setEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState("");
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [infoWindow, setInfoWindow] = useState(null);

  useEffect(() => {
    fetch("/api/properties")
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setRows(data);
          
          // Extract unique entities
          const uniqueEntities = [...new Set(data.map(item => item.Entity).filter(Boolean))];
          setEntities(uniqueEntities.sort());
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

  useEffect(() => {
    if (map && rows.length > 0) {
      updateMarkers();
    }
  }, [selectedEntity, map, rows]);

  function formatCurrency(value) {
    if (!value || value === 0) return "N/A";
    return "$" + value.toLocaleString();
  }

  function initMap() {
    // Center on Victoria, Australia
    const victoriaCenter = { lat: -37.4713, lng: 144.7852 };
    
    const newMap = new google.maps.Map(document.getElementById("map"), {
      zoom: 7,
      center: victoriaCenter
    });

    const newInfoWindow = new google.maps.InfoWindow();
    
    setMap(newMap);
    setInfoWindow(newInfoWindow);
    setMapLoaded(true);
  }

  function updateMarkers() {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    // Close info window
    if (infoWindow) {
      infoWindow.close();
    }

    // If no entity selected, don't show any markers
    if (!selectedEntity) {
      setMarkers([]);
      return;
    }

    // Filter rows by selected entity
    const filteredRows = rows.filter(item => item.Entity === selectedEntity);
    
    const newMarkers = [];

    filteredRows.forEach(item => {
      if (!item.Coordinates) return;
      
      const coords = item.Coordinates.replace(/\s+/g, "");
      const parts = coords.split(",");
      
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      
      if (isNaN(lat) || isNaN(lng)) {
        console.log("Invalid coords for:", item["Site Name"], lat, lng);
        return;
      }

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: item["Site Name"] || "Property"
      });

      // Create info window content
      const contentHTML = `
        <div style="max-width: 400px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${item["Site Name"] || "Property"}</h3>
          
          <div style="margin-bottom: 15px;">
            <strong>Building:</strong> ${item["Building Name"] || "N/A"}<br>
            <strong>Entity:</strong> ${item["Entity"] || "N/A"}<br>
            <strong>AVR ID:</strong> ${item["AVR ID"] || "N/A"}
          </div>

          <div style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
            <strong>Address:</strong><br>
            ${item["Street"] || ""}<br>
            ${item["Suburb / Town"] || ""}, ${item["State"] || ""} ${item["Post Code"] || ""}
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Site Use:</strong> ${item["Site Use"] || "N/A"}<br>
            <strong>Occupancy:</strong> ${item["Occupancy"] || "N/A"}<br>
            <strong>Construction Year:</strong> ${item["Construction Year"] || "N/A"}<br>
            <strong>Area:</strong> ${item["Gross Building Area"] || "N/A"} sqm
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Primary Structure:</strong><br>
            Floor: ${item["Primary Floor"] || "N/A"}<br>
            Walls: ${item["Primary Wall"] || "N/A"}<br>
            Roof: ${item["Primary Roof"] || "N/A"}
          </div>

          <div style="padding: 10px; background: #e8f5e9; border-radius: 5px; border-left: 4px solid #4caf50;">
            <strong>Recommended Sum Insured:</strong><br>
            <span style="font-size: 18px; font-weight: bold; color: #2e7d32;">
              ${formatCurrency(item["Recommended Sum Insured ($)"])}
            </span><br>
            <small>Reinstatement Cost: ${formatCurrency(item["Reinstatement Cost\n($)"])}</small>
          </div>

          ${item["Valuer Comments"] && item["Valuer Comments"] !== 0 ? `
            <div style="margin-top: 10px; padding: 10px; background: #fff3e0; border-radius: 5px;">
              <strong>Comments:</strong><br>
              <small>${item["Valuer Comments"]}</small>
            </div>
          ` : ""}
        </div>
      `;

      marker.addListener("click", () => {
        infoWindow.close(); // Close any open info window
        infoWindow.setContent(contentHTML);
        infoWindow.open(map, marker);
      });
      
      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
    console.log("Markers displayed:", newMarkers.length, "for entity:", selectedEntity);
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
      
      <div style={{ 
        marginBottom: 20, 
        padding: 15, 
        background: "#f5f5f5", 
        borderRadius: 5,
        display: "flex",
        alignItems: "center",
        gap: 15
      }}>
        <label style={{ fontWeight: "bold" }}>
          Select Entity:
        </label>
        <select 
          value={selectedEntity} 
          onChange={(e) => setSelectedEntity(e.target.value)}
          style={{
            padding: "8px 12px",
            fontSize: 16,
            borderRadius: 4,
            border: "1px solid #ccc",
            minWidth: 250
          }}
        >
          <option value="">-- Select an Entity --</option>
          {entities.map(entity => (
            <option key={entity} value={entity}>{entity}</option>
          ))}
        </select>
        
        <span style={{ marginLeft: "auto", color: "#666" }}>
          Total Properties: {rows.length}
          {selectedEntity && <span style={{ color: "green", marginLeft: 10 }}>
            | Showing: {markers.length} properties
          </span>}
        </span>
      </div>

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