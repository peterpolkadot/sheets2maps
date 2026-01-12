"use client";

import { useEffect, useState } from "react";

export default function Map2() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  const [entities, setEntities] = useState([]);
  const [suburbs, setSuburbs] = useState([]);

  const [selectedEntity, setSelectedEntity] = useState("");
  const [selectedSuburb, setSelectedSuburb] = useState("");

  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [infoWindow, setInfoWindow] = useState(null);

  /* ---------------- LOAD DATA (SHEET 2) ---------------- */

  useEffect(() => {
    fetch("/api/properties2")
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          return;
        }

        setRows(data);

        setEntities(
          [...new Set(data.map(r => r.Entity).filter(Boolean))].sort()
        );

        setSuburbs(
          [...new Set(data.map(r => r["Suburb / Town"]).filter(Boolean))].sort()
        );
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
          center: { lat: -37.4713, lng: 144.7852 },
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
    if (map && infoWindow && rows.length) {
      updateMarkers();
    }
  }, [map, infoWindow, rows, selectedEntity, selectedSuburb]);

  function formatCurrency(v) {
    if (!v || v === 0) return "N/A";
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

  function buildingHTML(item) {
    return `
      <div class="building-content active">
        <div class="field-grid">
          <div class="field-box">
            <div class="field-label">Reinstatement Cost</div>
            <div class="field-value-large">
              ${formatCurrency(item["Reinstatement Cost\n($)"])}
            </div>
          </div>
          <div class="field-box">
            <div class="field-label">Inflation Provision</div>
            <div class="field-value-large">
              ${formatCurrency(item["Total Cost Inflation Provision\n($)"])}
            </div>
          </div>
        </div>

        <div class="field-grid">
          ${field("Entity", item.Entity)}
          ${field("Suburb / Town", item["Suburb / Town"])}
          ${field("Date of Valuation", item["Date of Valuation"])}
          ${field("Basis of Valuation", item["Basis of Valuation"])}
        </div>
      </div>
    `;
  }

  function updateMarkers() {
    markers.forEach(m => m.setMap(null));
    infoWindow.close();

    let filtered = rows;

    if (selectedEntity) {
      filtered = filtered.filter(r => r.Entity === selectedEntity);
    }

    if (selectedSuburb) {
      filtered = filtered.filter(r => r["Suburb / Town"] === selectedSuburb);
    }

    const grouped = {};
    filtered.forEach(r => {
      if (!r["Site Name"]) return;
      grouped[r["Site Name"]] ||= [];
      grouped[r["Site Name"]].push(r);
    });

    const newMarkers = [];

    Object.entries(grouped).forEach(([site, items]) => {
      const coords = items[0].Coordinates;
      if (!coords) return;

      const [lat, lng] = coords.replace(/\s+/g, "").split(",").map(Number);
      if (isNaN(lat) || isNaN(lng)) return;

      const marker = new google.maps.Marker({
        map,
        position: { lat, lng },
        title: site
      });

      const html = `
        <div>
          <div class="iw-header">
            <h3 class="iw-title">${site}</h3>
            <p class="iw-subtitle">${items[0]["Suburb / Town"] || ""}</p>
          </div>
          <div class="iw-content">
            ${buildingHTML(items[0])}
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

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <div style={{ background: "#006a8e", padding: "24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", color: "white" }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>Secondary Dashboard</h1>
          <p style={{ margin: "4px 0 0 0", opacity: 0.9 }}>
            Filter by Entity and Suburb
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
        {error && (
          <div style={{ background: "#fee2e2", padding: 16, borderRadius: 8 }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 20
        }}>
          <div>
            <label style={{ fontWeight: 700, color: "#006a8e" }}>Entity</label>
            <select
              value={selectedEntity}
              onChange={e => setSelectedEntity(e.target.value)}
              style={{ width: "100%", padding: 10 }}
            >
              <option value="">All</option>
              {entities.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 700, color: "#006a8e" }}>Suburb / Town</label>
            <select
              value={selectedSuburb}
              onChange={e => setSelectedSuburb(e.target.value)}
              style={{ width: "100%", padding: 10 }}
            >
              <option value="">All</option>
              {suburbs.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{
          background: "white",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          <div id="map2" style={{ height: "700px", width: "100%" }} />
        </div>
      </div>
    </div>
  );
}
