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
      maxWidth: 550
    });
    
    newMap.addListener("click", () => {
      newInfoWindow.close();
    });
    
    setMap(newMap);
    setInfoWindow(newInfoWindow);
    setMapLoaded(true);
  }

  function createBuildingContent(item, index, totalBuildings) {
    return `
      <div id="building-${index}" class="building-content" style="display: ${index === 0 ? 'block' : 'none'};">
        
        <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin-bottom: 16px; border-left: 3px solid #3b82f6;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 8px;">
            📍 Address
          </div>
          <div style="color: #0f172a; font-size: 15px; line-height: 1.6; font-weight: 500;">
            ${item["Street"] || ""}
          </div>
          <div style="color: #475569; font-size: 14px; margin-top: 2px;">
            ${item["Suburb / Town"] || ""}, ${item["State"] || ""} ${item["Post Code"] || ""}
          </div>
        </div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
  <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
    <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 6px;">Recommended Sum Insured</div>
    <div style="color: #0f172a; font-size: 14px; font-weight: 600;">${formatCurrency(item["Recommended Sum Insured ($)"])}</div>
  </div>

  <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
    <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 6px;">Reinstatement Cost</div>
    <div style="color: #0f172a; font-size: 14px; font-weight: 600;">${formatCurrency(item["Reinstatement Cost\n($)"])}</div>
  </div>
</div>





        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
          <div style="padding: 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 6px;">Entity</div>
            <div style="color: #0f172a; font-size: 13px; font-weight: 600;">${item["Entity"] || "N/A"}</div>
          </div>
          <div style="padding: 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 6px;">AVR ID</div>
            <div style="color: #0f172a; font-size: 13px; font-weight: 600;">${item["AVR ID"] || "N/A"}</div>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);">
          <div style="font-size: 11px; color: rgba(255,255,255,0.9); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 10px;">
            💰 Recommended Sum Insured
          </div>
          <div style="font-size: 32px; font-weight: 800; color: white; margin-bottom: 8px; letter-spacing: -0.5px;">
            ${formatCurrency(item["Recommended Sum Insured ($)"])}
          </div>
          <div style="font-size: 13px; color: rgba(255,255,255,0.85); font-weight: 500;">
            Reinstatement: ${formatCurrency(item["Reinstatement Cost\n($)"])}
          </div>
        </div>

        ${item["Valuer Comments"] && item["Valuer Comments"] !== 0 ? `
          <div style="margin-top: 16px; padding: 14px; background: #fffbeb; border-radius: 6px; border-left: 3px solid #f59e0b;">
            <div style="font-size: 10px; color: #92400e; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 6px;">
              💬 Valuer Comments
            </div>
            <div style="font-size: 13px; color: #78350f; line-height: 1.5;">
              ${item["Valuer Comments"]}
            </div>
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
          <div style="display: flex; gap: 0; border-bottom: 2px solid #e2e8f0; background: #f8fafc;">
            ${buildings.map((building, index) => `
              <button 
                onclick="window.switchTab(${index}, ${buildings.length})"
                id="tab-${index}"
                style="
                  flex: 1;
                  padding: 14px 20px;
                  background: ${index === 0 ? 'white' : '#f8fafc'};
                  color: ${index === 0 ? '#3b82f6' : '#64748b'};
                  border: none;
                  border-bottom: 3px solid ${index === 0 ? '#3b82f6' : 'transparent'};
                  cursor: pointer;
                  font-size: 13px;
                  font-weight: 700;
                  white-space: nowrap;
                  transition: all 0.2s;
                  font-family: 'Inter', sans-serif;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                "
                onmouseover="if(document.getElementById('building-${index}').style.display === 'none') { this.style.background = '#f1f5f9'; }"
                onmouseout="if(document.getElementById('building-${index}').style.display === 'none') { this.style.background = '#f8fafc'; } else { this.style.background = 'white'; }"
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
       <div style="padding: 14px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
  <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: -0.2px;">
    ${siteName}
  </h3>

  ${buildings.length > 1 ? `
    <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569; font-weight: 500;">
      ${buildings.length} Buildings
    </p>
  ` : `
    <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569; font-weight: 500;">
      ${buildings[0]["Building Name"] || ""}
    </p>
  `}
</div>

          
          ${tabsHTML}
          
          <div style="padding: 22px;">
            ${contentHTML}
          </div>
        </div>
      `;

      window.switchTab = function(tabIndex, totalTabs) {
        for (let i = 0; i < totalTabs; i++) {
          const tab = document.getElementById(`tab-${i}`);
          const content = document.getElementById(`building-${i}`);
          
          if (i === tabIndex) {
            tab.style.background = 'white';
            tab.style.color = '#3b82f6';
            tab.style.borderBottom = '3px solid #3b82f6';
            content.style.display = 'block';
          } else {
            tab.style.background = '#f8fafc';
            tab.style.color = '#64748b';
            tab.style.borderBottom = '3px solid transparent';
            content.style.display = 'none';
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