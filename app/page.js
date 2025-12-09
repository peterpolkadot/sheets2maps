"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const [entities, setEntities] = useState([]);
  const [siteNames, setSiteNames] = useState([]);
  const [buildingNames, setBuildingNames] = useState([]);
  const [suburbs, setSuburbs] = useState([]);
  
  const [selectedEntity, setSelectedEntity] = useState("");
  const [selectedSiteName, setSelectedSiteName] = useState("");
  const [selectedBuildingName, setSelectedBuildingName] = useState("");
  const [selectedSuburb, setSelectedSuburb] = useState("");
  
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
          
          const uniqueSuburbs = [...new Set(data.map(item => item["Suburb / Town"]).filter(Boolean))];
          setSuburbs(uniqueSuburbs.sort());
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
  }, [selectedEntity, selectedSiteName, selectedBuildingName, selectedSuburb, map, rows]);

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

    const newInfoWindow = new google.maps.InfoWindow({
      maxWidth: 600
    });
    
    newMap.addListener("click", () => {
      newInfoWindow.close();
    });
    
    setMap(newMap);
    setInfoWindow(newInfoWindow);
    setMapLoaded(true);
  }

  function createFieldBox(label, value) {
    return `
      <div class="field-box">
        <div class="field-label">${label}</div>
        <div class="field-value">${value || "N/A"}</div>
      </div>
    `;
  }

  function createBuildingContent(item, index, totalBuildings) {
    return `
      <div id="building-${index}" class="building-content ${index === 0 ? 'active' : ''}">
        <div class="field-grid">
          <div class="field-box">
            <div class="field-label">Recommended Sum Insured</div>
            <div class="field-value-large">${formatCurrency(item["Recommended Sum Insured ($)"])}</div>
          </div>
          <div class="field-box">
            <div class="field-label">Reinstatement Cost</div>
            <div class="field-value-large">${formatCurrency(item["Reinstatement Cost\n($)"])}</div>
          </div>
        </div>

        <div class="field-grid">
          ${createFieldBox("Entity", item["Entity"])}
          ${createFieldBox("AVR ID", item["AVR ID"])}
          ${createFieldBox("Occupancy", item["Occupancy"])}
          ${createFieldBox("Site Use", item["Site Use"])}
          ${createFieldBox("Leased", item["Leased"])}
          ${createFieldBox("Heritage Listed", item["Heritage Listed"])}
          ${createFieldBox("Construction Year", item["Construction Year"])}
          ${createFieldBox("Gross Building Area", item["Gross Building Area"])}
          ${createFieldBox("BCA", item["BCA"])}
          ${createFieldBox("Building Separation", item["Building Separation"])}
          ${createFieldBox("Bushfire Zone", item["Bushfire Zone"])}
          ${createFieldBox("Flood Zone", item["Flood Zone"])}
          ${createFieldBox("Land Contour", item["Land Contour"])}
          ${createFieldBox("Site Accessibility", item["Site Accessibility"])}
          ${createFieldBox("Distance From Road", item["Distance From Road"])}
          ${createFieldBox("Levels", item["Levels"])}
          ${createFieldBox("Fit out Included", item["Fit out Included"])}
          ${createFieldBox("Heating & Cooling", item["Heating & Cooling"])}
        </div>

        ${item["Valuer Comments"] && item["Valuer Comments"] !== 0 ? `
          <div class="comments-box">
            <div class="comments-label">💬 Valuer Comments</div>
            <div class="comments-text">${item["Valuer Comments"]}</div>
          </div>
        ` : ""}
      </div>
    `;
  }

  function updateMarkers() {
    markers.forEach(marker => marker.setMap(null));
    
    if (infoWindow) {
      infoWindow.close();
    }

    if (!selectedEntity && !selectedSiteName && !selectedBuildingName && !selectedSuburb) {
      setMarkers([]);
      return;
    }

    let filteredRows = rows;
    
    if (selectedEntity) {
      filteredRows = filteredRows.filter(item => item.Entity === selectedEntity);
    }
    
    if (selectedSiteName) {
      filteredRows = filteredRows.filter(item => item["Site Name"] === selectedSiteName);
    }
    
    if (selectedBuildingName) {
      filteredRows = filteredRows.filter(item => item["Building Name"] === selectedBuildingName);
    }
    
    if (selectedSuburb) {
      filteredRows = filteredRows.filter(item => item["Suburb / Town"] === selectedSuburb);
    }
    
    const groupedBySite = {};
    
    filteredRows.forEach(item => {
      const siteName = item["Site Name"];
      if (!siteName) return;
      
      if (!groupedBySite[siteName]) {
        groupedBySite[siteName] = [];
      }
      groupedBySite[siteName].push(item);
    });
    
    const newMarkers = [];

    Object.entries(groupedBySite).forEach(([siteName, buildings]) => {
      const firstBuilding = buildings[0];
      if (!firstBuilding.Coordinates) return;
      
      const coords = firstBuilding.Coordinates.replace(/\s+/g, "");
      const parts = coords.split(",");
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      
      if (isNaN(lat) || isNaN(lng)) {
        console.log("Invalid coords for:", siteName);
        return;
      }

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: siteName,
        animation: google.maps.Animation.DROP,
        label: buildings.length > 1 ? {
          text: String(buildings.length),
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        } : null
      });

      let tabsHTML = "";
      let contentHTML = "";
      
      if (buildings.length > 1) {
        tabsHTML = `
          <div class="iw-tabs">
            ${buildings.map((building, index) => `
              <button 
                onclick="window.switchTab(${index}, ${buildings.length})"
                id="tab-${index}"
                class="iw-tab ${index === 0 ? 'active' : ''}"
              >
                ${building["Building Name"] || "Building " + (index + 1)}
              </button>
            `).join('')}
          </div>
        `;
        
        contentHTML = buildings.map((building, index) => 
          createBuildingContent(building, index, buildings.length)
        ).join('');
      } else {
        contentHTML = createBuildingContent(buildings[0], 0, 1);
      }

      const fullHTML = `
        <div>
          <div class="iw-header">
            <h3 class="iw-title">${siteName}</h3>
            <p class="iw-subtitle">
              ${buildings.length > 1 
                ? buildings.length + " Buildings" 
                : (buildings[0]["Building Name"] || "")
              }
            </p>
          </div>
          
          ${tabsHTML}
          
          <div class="iw-content">
            ${contentHTML}
          </div>
        </div>
      `;

      window.switchTab = function(tabIndex, totalTabs) {
        for (let i = 0; i < totalTabs; i++) {
          const tab = document.getElementById(`tab-${i}`);
          const content = document.getElementById(`building-${i}`);
          
          if (i === tabIndex) {
            tab.classList.add('active');
            content.classList.add('active');
          } else {
            tab.classList.remove('active');
            content.classList.remove('active');
          }
        }
      };

      marker.addListener("click", () => {
        infoWindow.close();
        infoWindow.setContent(fullHTML);
        infoWindow.open(map, marker);
      });
      
      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  }

  const handleEntityChange = (value) => {
    setSelectedEntity(value);
    if (value) {
      setSelectedSiteName("");
      setSelectedBuildingName("");
      setSelectedSuburb("");
    }
  };

  const handleSiteNameChange = (value) => {
    setSelectedSiteName(value);
    if (value) {
      setSelectedEntity("");
      setSelectedBuildingName("");
      setSelectedSuburb("");
    }
  };

  const handleBuildingNameChange = (value) => {
    setSelectedBuildingName(value);
    if (value) {
      setSelectedEntity("");
      setSelectedSiteName("");
      setSelectedSuburb("");
    }
  };

  const handleSuburbChange = (value) => {
    setSelectedSuburb(value);
    if (value) {
      setSelectedEntity("");
      setSelectedSiteName("");
      setSelectedBuildingName("");
    }
  };

  const clearFilters = () => {
    setSelectedEntity("");
    setSelectedSiteName("");
    setSelectedBuildingName("");
    setSelectedSuburb("");
  };

  const hasActiveFilters = selectedEntity || selectedSiteName || selectedBuildingName || selectedSuburb;

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
            AVR CONSULTING
          </h1>
          <p style={{ 
            margin: 0, 
            color: "rgba(255,255,255,0.9)", 
            fontSize: 16 
          }}>
            Catholic Diocese Property Dashboard 
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
          <div id="map" style={{
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
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
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
                Suburb / Town
              </label>
              <select 
                value={selectedSuburb} 
                onChange={(e) => handleSuburbChange(e.target.value)}
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
                <option value="">All Suburbs</option>
                {suburbs.map(suburb => (
                  <option key={suburb} value={suburb}>{suburb}</option>
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
              <strong style={{ color: "#1e293b" }}>Total Buildings:</strong> {rows.length}
            </span>
            {hasActiveFilters && (
              <span style={{ color: "#10b981", fontWeight: 600 }}>
                • Showing: {markers.length} sites
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}