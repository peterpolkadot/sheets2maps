"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const [entities, setEntities] = useState([]);
  const [siteNames, setSiteNames] = useState([]);
  const [buildingNames, setBuildingNames] = useState([]);
  
  const [selectedEntity, setSelectedEntity] = useState("");
  const [selectedSiteName, setSelectedSiteName] = useState("");
  const [selectedBuildingName, setSelectedBuildingName] = useState("");
  
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
          
          const uniqueEntities = [...new Set(data.map(item => item.Entity).filter(Boolean))];
          setEntities(uniqueEntities.sort());
          
          const uniqueSiteNames = [...new Set(data.map(item => item["Site Name"]).filter(Boolean))];
          setSiteNames(uniqueSiteNames.sort());
          
          const uniqueBuildingNames = [...new Set(data.map(item => item["Building Name"]).filter(Boolean))];
          setBuildingNames(uniqueBuildingNames.sort());
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
  }, [selectedEntity, selectedSiteName, selectedBuildingName, map, rows]);

  function formatCurrency(value) {
    if (!value || value === 0) return "N/A";
    return "$" + value.toLocaleString();
  }

  function initMap() {
    const victoriaCenter = { lat: -37.4713, lng: 144.7852 };
    
    const newMap = new google.maps.Map(document.getElementById("map"), {
      zoom: 7,
      center: victoriaCenter,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    const newInfoWindow = new google.maps.InfoWindow();
    
    // Close info window when clicking on the map
    newMap.addListener("click", () => {
      newInfoWindow.close();
    });
    
    setMap(newMap);
    setInfoWindow(newInfoWindow);
    setMapLoaded(true);
  }

  function updateMarkers() {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    if (infoWindow) {
      infoWindow.close();
    }

    // If no filters are active, don't show any markers
    if (!selectedEntity && !selectedSiteName && !selectedBuildingName) {
      setMarkers([]);
      return;
    }

    // Start with all rows
    let filteredRows = rows;
    
    // Apply each filter ONLY if it has a value selected
    if (selectedEntity) {
      filteredRows = filteredRows.filter(item => item.Entity === selectedEntity);
    }
    
    if (selectedSiteName) {
      filteredRows = filteredRows.filter(item => item["Site Name"] === selectedSiteName);
    }
    
    if (selectedBuildingName) {
      filteredRows = filteredRows.filter(item => item["Building Name"] === selectedBuildingName);
    }
    
    const newMarkers = [];

    filteredRows.forEach(item => {
      if (!item.Coordinates) return;
      
      const coords = item.Coordinates.replace(/\s+/g, "");
      const parts = coords.split(",");
      
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      
      if (isNaN(lat) || isNaN(lng)) {
        console.log("Invalid coords for:", item["Site Name"]);
        return;
      }

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: item["Site Name"] || "Property",
        animation: google.maps.Animation.DROP
      });

      const contentHTML = `
        <div style="max-width: 420px; font-family: 'Inter', sans-serif; line-height: 1.6;">
          <div style="border-bottom: 3px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px;">
            <h3 style="margin: 0; color: #1e293b; font-size: 18px; font-weight: 600;">
              ${item["Site Name"] || "Property"}
            </h3>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">
              ${item["Building Name"] || ""}
            </p>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
            <div>
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Entity</div>
              <div style="color: #1e293b; font-size: 14px;">${item["Entity"] || "N/A"}</div>
            </div>
            <div>
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">AVR ID</div>
              <div style="color: #1e293b; font-size: 14px;">${item["AVR ID"] || "N/A"}</div>
            </div>
          </div>

          <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); padding: 14px; border-radius: 8px; margin-bottom: 16px;">
            <div style="font-size: 11px; color: #475569; text-transform: uppercase; font-weight: 600; margin-bottom: 6px;">
              📍 Address
            </div>
            <div style="color: #1e293b; font-size: 14px; line-height: 1.5;">
              ${item["Street"] || ""}<br>
              ${item["Suburb / Town"] || ""}, ${item["State"] || ""} ${item["Post Code"] || ""}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
            <div>
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Site Use</div>
              <div style="color: #1e293b; font-size: 14px;">${item["Site Use"] || "N/A"}</div>
            </div>
            <div>
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Occupancy</div>
              <div style="color: #1e293b; font-size: 14px;">${item["Occupancy"] || "N/A"}</div>
            </div>
            <div>
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Built</div>
              <div style="color: #1e293b; font-size: 14px;">${item["Construction Year"] || "N/A"}</div>
            </div>
            <div>
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Area</div>
              <div style="color: #1e293b; font-size: 14px;">${item["Gross Building Area"] || "N/A"} m²</div>
            </div>
          </div>

          <div style="background: #f0fdf4; padding: 14px; border-radius: 8px; border-left: 4px solid #10b981;">
            <div style="font-size: 11px; color: #065f46; text-transform: uppercase; font-weight: 600; margin-bottom: 6px;">
              💰 Recommended Sum Insured
            </div>
            <div style="font-size: 24px; font-weight: 700; color: #059669; margin-bottom: 4px;">
              ${formatCurrency(item["Recommended Sum Insured ($)"])}
            </div>
            <div style="font-size: 12px; color: #059669;">
              Reinstatement: ${formatCurrency(item["Reinstatement Cost\n($)"])}
            </div>
          </div>

          ${item["Valuer Comments"] && item["Valuer Comments"] !== 0 ? `
            <div style="margin-top: 16px; padding: 12px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <div style="font-size: 11px; color: #92400e; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">
                💬 Comments
              </div>
              <div style="font-size: 13px; color: #78350f;">
                ${item["Valuer Comments"]}
              </div>
            </div>
          ` : ""}
        </div>
      `;

      marker.addListener("click", () => {
        infoWindow.close();
        infoWindow.setContent(contentHTML);
        infoWindow.open(map, marker);
      });
      
      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
    console.log("Filters:", { selectedEntity, selectedSiteName, selectedBuildingName });
    console.log("Filtered rows:", filteredRows.length, "Markers created:", newMarkers.length);
  }

  // Handler functions that clear other dropdowns when one is selected
  const handleEntityChange = (value) => {
    setSelectedEntity(value);
    if (value) {
      setSelectedSiteName("");
      setSelectedBuildingName("");
    }
  };

  const handleSiteNameChange = (value) => {
    setSelectedSiteName(value);
    if (value) {
      setSelectedEntity("");
      setSelectedBuildingName("");
    }
  };

  const handleBuildingNameChange = (value) => {
    setSelectedBuildingName(value);
    if (value) {
      setSelectedEntity("");
      setSelectedSiteName("");
    }
  };

  const clearFilters = () => {
    setSelectedEntity("");
    setSelectedSiteName("");
    setSelectedBuildingName("");
  };

  const hasActiveFilters = selectedEntity || selectedSiteName || selectedBuildingName;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <div style={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
            Sheets2Maps
          </h1>
          <p style={{ 
            margin: 0, 
            color: "rgba(255,255,255,0.9)", 
            fontSize: 16 
          }}>
            Catholic Diocese Property Valuation System
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
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: 24
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: 20
          }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: 18, 
              fontWeight: 600,
              color: "#1e293b"
            }}>
              Filter Properties
            </h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  padding: "8px 16px",
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#475569"
                }}
              >
                Clear All Filters
              </button>
            )}
          </div>

          <div style={{ 
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16
          }}>
            <div>
              <label style={{ 
                display: "block",
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Entity
              </label>
              <select 
                value={selectedEntity} 
                onChange={(e) => handleEntityChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: 15,
                  borderRadius: 8,
                  border: "2px solid #e2e8f0",
                  background: "white",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                  outline: "none"
                }}
              >
                <option value="">All Entities</option>
                {entities.map(entity => (
                  <option key={entity} value={entity}>{entity}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ 
                display: "block",
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Site Name
              </label>
              <select 
                value={selectedSiteName} 
                onChange={(e) => handleSiteNameChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: 15,
                  borderRadius: 8,
                  border: "2px solid #e2e8f0",
                  background: "white",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                  outline: "none"
                }}
              >
                <option value="">All Sites</option>
                {siteNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ 
                display: "block",
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Building Name
              </label>
              <select 
                value={selectedBuildingName} 
                onChange={(e) => handleBuildingNameChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: 15,
                  borderRadius: 8,
                  border: "2px solid #e2e8f0",
                  background: "white",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                  outline: "none"
                }}
              >
                <option value="">All Buildings</option>
                {buildingNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ 
            marginTop: 20,
            padding: "12px 16px",
            background: "#f8fafc",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 14,
            color: "#475569"
          }}>
            <span>
              <strong style={{ color: "#1e293b" }}>Total Properties:</strong> {rows.length}
            </span>
            {hasActiveFilters && (
              <span style={{ color: "#10b981", fontWeight: 600 }}>
                • Showing: {markers.length}
              </span>
            )}
          </div>
        </div>

        <div style={{
          background: "white",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          <div id="map" style={{
            width: "100%",
            height: "700px"
          }}></div>
        </div>
      </div>
    </div>
  );
}