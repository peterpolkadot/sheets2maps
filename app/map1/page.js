"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Map1() {
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

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [currentPropertyData, setCurrentPropertyData] = useState(null);

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

  function excelDateToJSDate(serial) {
    if (!serial || isNaN(serial)) return null;
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info;
  }

  function formatDate(value) {
    if (!value) return "N/A";
    if (typeof value === 'string' && value.includes('/')) return value;
    const date = excelDateToJSDate(value);
    if (!date) return "N/A";
    return date.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function handleEmailReport(propertyData) {
    setCurrentPropertyData(propertyData);
    setShowEmailModal(true);
    setEmailInput("");
    setEmailError("");
    setEmailSuccess(false);
  }

  async function sendEmailReport() {
    if (!emailInput || !emailInput.includes('@')) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailSending(true);
    setEmailError("");

    try {
      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: emailInput,
          propertyData: currentPropertyData
        })
      });

      if (!res.ok) {
        throw new Error("Failed to send email");
      }

      setEmailSuccess(true);
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSuccess(false);
      }, 2000);
    } catch (err) {
      setEmailError("Failed to send email. Please try again.");
    } finally {
      setEmailSending(false);
    }
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

      const propertyData = {
        siteName: siteName,
        buildingName: firstBuilding["Building Name"] || "",
        entity: firstBuilding["Entity"] || "N/A",
        address: [
          firstBuilding["Street Address"] || "",
          firstBuilding["Suburb / Town"] || "",
          firstBuilding["Post Code"] || ""
        ].filter(Boolean).join(", "),
        recommendedSumInsured: formatCurrency(firstBuilding["Recommended Sum Insured ($)"]),
        reinstatementCost: formatCurrency(firstBuilding["Reinstatement Cost\n($)"]),
        inflationProvision: formatCurrency(firstBuilding["Total Cost Inflation Provision ($)"] || 0),
        demolitionCost: formatCurrency(firstBuilding["Demolition and Removal of Debris ($)"] || 0),
        dateOfValuation: formatDate(firstBuilding["Date of Valuation"]),
        allData: firstBuilding
      };

      let selectorHTML = "";
      let contentHTML = "";
      
      if (buildings.length > 1) {
        selectorHTML = `
          <div class="iw-building-selector">
            <label class="iw-selector-label">Select Building:</label>
            <select 
              id="building-selector" 
              class="iw-selector-dropdown"
              onchange="window.switchBuilding(this.value, ${buildings.length})"
            >
              ${buildings.map((building, index) => `
                <option value="${index}" ${index === 0 ? 'selected' : ''}>
                  ${building["Building Name"] || "Building " + (index + 1)}
                </option>
              `).join('')}
            </select>
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
          
          ${selectorHTML}
          
          <div class="iw-content">
            ${contentHTML}
            
            <div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #e0f2fe; text-align: center;">
              <button 
                id="email-report-btn"
                style="
                  padding: 12px 24px;
                  background: linear-gradient(135deg, #006a8e 0%, #008bb3 100%);
                  color: white;
                  border: none;
                  border-radius: 8px;
                  font-size: 14px;
                  font-weight: 600;
                  cursor: pointer;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                "
              >
                📧 Email Full Report
              </button>
            </div>
          </div>
        </div>
      `;

      window.switchBuilding = function(buildingIndex, totalBuildings) {
        for (let i = 0; i < totalBuildings; i++) {
          const content = document.getElementById(`building-${i}`);
          
          if (i === parseInt(buildingIndex)) {
            content.classList.add('active');
          } else {
            content.classList.remove('active');
          }
        }
      };

      marker.addListener("click", () => {
        infoWindow.close();
        infoWindow.setContent(fullHTML);
        infoWindow.open(map, marker);

        google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
          const btn = document.getElementById('email-report-btn');
          if (btn) {
            btn.addEventListener('click', () => handleEmailReport(propertyData));
          }
        });
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
            Property Dashboard
          </h1>
          <p style={{ 
            margin: 0, 
            color: "rgba(255,255,255,0.9)", 
            fontSize: 16 
          }}>
            Catholic Diocese of Sale
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
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
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
              <strong style={{ color: "#006a8e" }}>Total Buildings:</strong> {rows.length}
            </span>
            {hasActiveFilters && (
              <span style={{ color: "#006a8e", fontWeight: 700 }}>
                • Showing: {markers.length} sites
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ 
        textAlign: "center", 
        padding: "40px 24px",
        background: "#f8f9fa" 
      }}>
        <Link href="/" style={{
          color: "#006a8e",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none"
        }}>
          ← Back to Home
        </Link>
      </div>

      {showEmailModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000
        }}>
          <div style={{
            background: "white",
            borderRadius: 12,
            padding: 32,
            maxWidth: 400,
            width: "90%",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
          }}>
            <h2 style={{
              margin: "0 0 8px 0",
              fontSize: 24,
              fontWeight: 700,
              color: "#006a8e"
            }}>
              Email Property Report
            </h2>
            <p style={{
              margin: "0 0 20px 0",
              fontSize: 14,
              color: "#64748b"
            }}>
              {currentPropertyData?.siteName}
            </p>

            {!emailSuccess ? (
              <>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email address"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: 15,
                    border: emailError ? "2px solid #ef4444" : "2px solid #e2e8f0",
                    borderRadius: 8,
                    outline: "none",
                    marginBottom: 8,
                    boxSizing: "border-box"
                  }}
                />

                {emailError && (
                  <p style={{
                    margin: "0 0 16px 0",
                    fontSize: 13,
                    color: "#ef4444"
                  }}>
                    {emailError}
                  </p>
                )}

                <div style={{
                  display: "flex",
                  gap: 12,
                  marginTop: 20
                }}>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    disabled={emailSending}
                    style={{
                      flex: 1,
                      padding: 12,
                      background: "#f1f5f9",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#64748b",
                      cursor: emailSending ? "not-allowed" : "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendEmailReport}
                    disabled={emailSending}
                    style={{
                      flex: 1,
                      padding: 12,
                      background: emailSending ? "#94a3b8" : "linear-gradient(135deg, #006a8e 0%, #008bb3 100%)",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "white",
                      cursor: emailSending ? "not-allowed" : "pointer"
                    }}
                  >
                    {emailSending ? "Sending..." : "Send Report"}
                  </button>
                </div>
              </>
            ) : (
              <div style={{
                textAlign: "center",
                padding: "20px 0"
              }}>
                <div style={{
                  fontSize: 48,
                  marginBottom: 16
                }}>
                  ✅
                </div>
                <p style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#006a8e"
                }}>
                  Email sent successfully!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}