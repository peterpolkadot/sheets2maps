"use client";

import { useEffect, useState } from "react";

export default function Map2() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

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
    fetch("/api/properties2")
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          return;
        }

        if (!Array.isArray(data) || data.length === 0) {
          setError("No data available");
          return;
        }
        
        setRows(data);

        const uniqueEntities = [...new Set(data.map(item => item.Entity).filter(Boolean))];
        setEntities(uniqueEntities.sort());

        const uniqueSiteNames = [...new Set(data.map(item => item["Site Name"]).filter(Boolean))];
        setSiteNames(uniqueSiteNames.sort());

        const uniqueBuildingNames = [...new Set(data.map(item => item["Building Name"]).filter(Boolean))];
        setBuildingNames(uniqueBuildingNames.sort());

        const uniqueSuburbs = [...new Set(data.map(item => item["Suburb / Town"]).filter(Boolean))];
        setSuburbs(uniqueSuburbs.sort());
      })
      .catch(err => setError(err.toString()));
  }, []);

  useEffect(() => {
    const check = setInterval(() => {
      if (typeof google !== "undefined" && google.maps) {
        clearInterval(check);

        const m = new google.maps.Map(document.getElementById("map2"), {
          zoom: 8,
          center: { lat: -27.47, lng: 153.03 },
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        const iw = new google.maps.InfoWindow();
        m.addListener("click", () => iw.close());

        setMap(m);
        setInfoWindow(iw);
      }
    }, 100);

    return () => clearInterval(check);
  }, []);

  useEffect(() => {
    if (!map || !infoWindow || rows.length === 0) return;
    updateMarkers();
  }, [map, infoWindow, rows, selectedEntity, selectedSiteName, selectedBuildingName, selectedSuburb]);

  function formatCurrency(value) {
    if (!value || value === 0 || value === "$-" || value === "-") return "Not yet valued";
    if (typeof value === 'string' && value.startsWith('$')) return value;
    return "$" + value.toLocaleString();
  }

  function updateMarkers() {
    markers.forEach(m => m.setMap(null));
    if (infoWindow) {
      infoWindow.close();
    }

    if (!selectedEntity && !selectedSiteName && !selectedBuildingName && !selectedSuburb) {
      setMarkers([]);
      return;
    }

    let filtered = rows;

    if (selectedEntity) {
      filtered = filtered.filter(item => item.Entity === selectedEntity);
    }

    if (selectedSiteName) {
      filtered = filtered.filter(item => item["Site Name"] === selectedSiteName);
    }

    if (selectedBuildingName) {
      filtered = filtered.filter(item => item["Building Name"] === selectedBuildingName);
    }

    if (selectedSuburb) {
      filtered = filtered.filter(item => item["Suburb / Town"] === selectedSuburb);
    }

    const groupedBySite = {};

    filtered.forEach(item => {
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

      if (isNaN(lat) || isNaN(lng)) return;

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: siteName,
        animation: google.maps.Animation.DROP
      });

      const html = `
        <div>
          <div class="iw-header">
            <h3 class="iw-title">${siteName}</h3>
            <p class="iw-subtitle">${firstBuilding["Building Name"] || ""}</p>
          </div>
          <div class="iw-content">
            <div class="field-grid">
              <div class="field-box">
                <div class="field-label">Recommended Sum Insured</div>
                <div class="field-value-large">${formatCurrency(firstBuilding["Recommended Sum Insured ($)"])}</div>
              </div>
              <div class="field-box">
                <div class="field-label">Reinstatement Cost</div>
                <div class="field-value-large">${formatCurrency(firstBuilding["Reinstatement Cost ($)"])}</div>
              </div>
            </div>
            
            <div class="field-grid">
              <div class="field-box">
                <div class="field-label">Total Cost Inflation Provision</div>
                <div class="field-value">${formatCurrency(firstBuilding["Total Cost Inflation Provision ($)"])}</div>
              </div>
              <div class="field-box">
                <div class="field-label">Demolition & Removal of Debris</div>
                <div class="field-value">${formatCurrency(firstBuilding["Demolition and Removal of Debris ($)"])}</div>
              </div>
            </div>

            <div class="field-grid">
              <div class="field-box">
                <div class="field-label">Entity</div>
                <div class="field-value">${firstBuilding["Entity"] || "N/A"}</div>
              </div>
              <div class="field-box">
                <div class="field-label">Date of Valuation</div>
                <div class="field-value">${firstBuilding["Date of Valuation"] || "N/A"}</div>
              </div>
            </div>

            <div class="field-grid">
              <div class="field-box">
                <div class="field-label">Suburb / Town</div>
                <div class="field-value">${firstBuilding["Suburb / Town"] || "N/A"}</div>
              </div>
            </div>
          </div>
        </div>
      `;

      marker.addListener("click", () => {
        infoWindow.setContent(html);
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
            Secondary Dashboard
          </h1>
          <p style={{ 
            margin: 0, 
            color: "rgba(255,255,255,0.9)", 
            fontSize: 16 
          }}>
            Brisbane Catholic Education Property System
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
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: 20
          }}>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  padding: "8px 16px",
                  background: "#f0f9ff",
                  border: "1px solid #006a8e",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#006a8e"
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
                fontWeight: 700,
                color: "#006a8e",
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
                  border: "2px solid #e0f2fe",
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
                fontWeight: 700,
                color: "#006a8e",
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
                  border: "2px solid #e0f2fe",
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
                fontWeight: 700,
                color: "#006a8e",
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
                  border: "2px solid #e0f2fe",
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

            <div>
              <label style={{ 
                display: "block",
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 700,
                color: "#006a8e",
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
                  border: "2px solid #e0f2fe",
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
          </div>

          <div style={{ 
            marginTop: 20,
            padding: "14px 18px",
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 14,
            color: "#0c4a6e",
            border: "1px solid #bae6fd"
          }}>
            <span>
              <strong style={{ color: "#006a8e" }}>Total Sites:</strong> {rows.length}
            </span>
            {hasActiveFilters && (
              <span style={{ color: "#006a8e", fontWeight: 700 }}>
                • Showing: {markers.length} sites
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
