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

  /* ---------------- LOAD DATA (SAME AS MAP1) ---------------- */

  useEffect(() => {
    fetch("/api/properties2")
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          return;
        }

        setRows(data);

        // ✅ EXPLICIT POPULATION (THIS WAS MISSING)
        const entitySet = [...new Set(data.map(r => r.Entity).filter(Boolean))];
        const suburbSet = [...new Set(data.map(r => r["Suburb / Town"]).filter(Boolean))];

        setEntities(entitySet);
        setSuburbs(suburbSet.sort());
      })
      .catch(err => setError(err.toString()));
  }, []);

  /* ---------------- MAP INIT ---------------- */

  useEffect(() => {
    const check = setInterval(() => {
      if (typeof google !== "undefined" && google.maps) {
        clearInterval(check);

        const m = new google.maps.Map(document.getElementById("map2"), {
          zoom: 7,
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

  /* ---------------- MARKERS (SAME PATTERN AS MAP1) ---------------- */

  useEffect(() => {
    if (!map || !infoWindow || rows.length === 0) return;
    updateMarkers();
  }, [map, infoWindow, rows, selectedEntity, selectedSuburb]);

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
      const site = r["Site Name"];
      if (!site) return;
      grouped[site] ||= [];
      grouped[site].push(r);
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
            <p class="iw-subtitle">${items[0]["Suburb / Town"]}</p>
          </div>
          <div class="iw-content">
            <div class="field-grid">
              <div class="field-box">
                <div class="field-label">Reinstatement Cost</div>
                <div class="field-value-large">
                  ${items[0]["Reinstatement Cost\n($)"] || "N/A"}
                </div>
              </div>
              <div class="field-box">
                <div class="field-label">Inflation Provision</div>
                <div class="field-value-large">
                  ${items[0]["Total Cost Inflation Provision\n($)"] || "N/A"}
                </div>
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

  /* ---------------- UI ---------------- */

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <div style={{ background: "#006a8e", padding: 24 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", color: "white" }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>Secondary Dashboard</h1>
          <p style={{ marginTop: 4, opacity: 0.9 }}>
            Brisbane Catholic Education – Property Map
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
              {entities.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
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
              {suburbs.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
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
