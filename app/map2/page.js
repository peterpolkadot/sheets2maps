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

  /* ---------------- DATA LOAD (SHEET 2) ---------------- */

  useEffect(() => {
    fetch("/api/properties2")
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          return;
        }

        setRows(data);

        setEntities([...new Set(data.map(i => i.Entity).filter(Boolean))].sort());
        setSiteNames([...new Set(data.map(i => i["Site Name"]).filter(Boolean))].sort());
        setBuildingNames([...new Set(data.map(i => i["Building Name"]).filter(Boolean))].sort());
        setSuburbs([...new Set(data.map(i => i["Suburb / Town"]).filter(Boolean))].sort());
      })
      .catch(err => setError(err.toString()));
  }, []);

  /* ---------------- MAP INIT ---------------- */

  useEffect(() => {
    const wait = setInterval(() => {
      if (typeof google !== "undefined" && google.maps) {
        clearInterval(wait);

        const m = new google.maps.Map(document.getElementById("map2"), {
          zoom: 7,
          center: { lat: -27.5, lng: 153.0 },
          styles: [{
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }]
        });

        const iw = new google.maps.InfoWindow();
        m.addListener("click", () => iw.close());

        setMap(m);
        setInfoWindow(iw);
      }
    }, 100);

    return () => clearInterval(wait);
  }, []);

  /* ---------------- MARKERS ---------------- */

  useEffect(() => {
    if (map && infoWindow && rows.length) updateMarkers();
  }, [map, infoWindow, rows, selectedEntity, selectedSiteName, selectedBuildingName, selectedSuburb]);

  function formatCurrency(v) {
    if (!v || v === "$-" || v === 0) return "N/A";
    if (typeof v === "string") return v;
    return "$" + Number(v).toLocaleString();
  }

  function field(label, value) {
    return `
      <div class="field-box">
        <div class="field-label">${label}</div>
        <div class="field-value">${value || "N/A"}</div>
      </div>
    `;
  }

  function buildingHTML(item, index) {
    return `
      <div id="building-${index}" class="building-content ${index === 0 ? "active" : ""}">
        <div class="field-grid">
          <div class="field-box">
            <div class="field-label">Reinstatement Cost</div>
            <div class="field-value-large">${formatCurrency(item["Reinstatement Cost\n($)"])}</div>
          </div>
          <div class="field-box">
            <div class="field-label">Inflation Provision</div>
            <div class="field-value-large">${formatCurrency(item["Total Cost Inflation Provision\n($)"])}</div>
          </div>
        </div>

        <div class="field-grid">
          ${field("Entity", item.Entity)}
          ${field("AVR ID", item["AVR ID"])}
          ${field("Date of Valuation", item["Date of Valuation"])}
          ${field("Basis of Valuation", item["Basis of Valuation"])}
          ${field("Occupancy", item.Occupancy)}
          ${field("Site Use", item["Site Use"])}
          ${field("Construction Year", item["Construction Year"])}
          ${field("Gross Building Area", item["Gross Building Area"])}
          ${field("BCA", item.BCA)}
          ${field("Levels", item.Levels)}
        </div>
      </div>
    `;
  }

  function updateMarkers() {
    markers.forEach(m => m.setMap(null));
    infoWindow.close();

    let filtered = rows;

    if (selectedEntity) filtered = filtered.filter(r => r.Entity === selectedEntity);
    if (selectedSiteName) filtered = filtered.filter(r => r["Site Name"] === selectedSiteName);
    if (selectedBuildingName) filtered = filtered.filter(r => r["Building Name"] === selectedBuildingName);
    if (selectedSuburb) filtered = filtered.filter(r => r["Suburb / Town"] === selectedSuburb);

    const grouped = {};
    filtered.forEach(r => {
      if (!r["Site Name"]) return;
      grouped[r["Site Name"]] ||= [];
      grouped[r["Site Name"]].push(r);
    });

    const newMarkers = [];

    Object.entries(grouped).forEach(([site, buildings]) => {
      const coords = buildings[0].Coordinates;
      if (!coords) return;

      const [lat, lng] = coords.replace(/\s+/g, "").split(",").map(Number);
      if (isNaN(lat) || isNaN(lng)) return;

      const marker = new google.maps.Marker({
        map,
        position: { lat, lng },
        title: site,
        label: buildings.length > 1 ? { text: String(buildings.length), color: "white" } : null
      });

      let selector = "";
      if (buildings.length > 1) {
        selector = `
          <div class="iw-building-selector">
            <label>Select Building</label>
            <select onchange="window.switchBuilding(this.value, ${buildings.length})">
              ${buildings.map((b, i) =>
                `<option value="${i}">${b["Building Name"] || "Building " + (i + 1)}</option>`
              ).join("")}
            </select>
          </div>
        `;
      }

      const html = `
        <div>
          <div class="iw-header">
            <h3>${site}</h3>
            <p>${buildings.length} Building(s)</p>
          </div>
          ${selector}
          <div class="iw-content">
            ${buildings.map(buildingHTML).join("")}
          </div>
        </div>
      `;

      window.switchBuilding = (i, total) => {
        for (let x = 0; x < total; x++) {
          document.getElementById(`building-${x}`)?.classList.toggle("active", x == i);
        }
      };

      marker.addListener("click", () => {
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <div id="map2" style={{ height: "700px" }} />
    </div>
  );
}
