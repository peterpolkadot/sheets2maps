"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <div style={{ 
        background: "linear-gradient(135deg, #006a8e 0%, #008bb3 100%)",
        padding: "48px 24px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ 
            margin: "0 0 16px 0", 
            color: "white", 
            fontSize: 48, 
            fontWeight: 700,
            letterSpacing: "-1px"
          }}>
            AVR CONSULTING
          </h1>
          <p style={{ 
            margin: 0, 
            color: "rgba(255,255,255,0.95)", 
            fontSize: 20,
            fontWeight: 500
          }}>
            Catholic Diocese Property Management System
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 32,
          marginTop: 24
        }}>
          {/* Map 1 Card */}
          <Link href="/map1" style={{ textDecoration: "none" }}>
            <div style={{
              background: "white",
              borderRadius: 16,
              padding: 32,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
              cursor: "pointer",
              border: "2px solid transparent",
              height: "100%"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,106,142,0.2)";
              e.currentTarget.style.borderColor = "#006a8e";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
              e.currentTarget.style.borderColor = "transparent";
            }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                background: "linear-gradient(135deg, #006a8e 0%, #008bb3 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                fontSize: 32
              }}>
                🗺️
              </div>
              
              <h2 style={{
                margin: "0 0 12px 0",
                fontSize: 24,
                fontWeight: 700,
                color: "#006a8e"
              }}>
                Property Dashboard
              </h2>
              
              <p style={{
                margin: 0,
                fontSize: 15,
                color: "#64748b",
                lineHeight: 1.6
              }}>
                Interactive map showing property valuations, site details, and building information across all diocese locations.
              </p>
              
              <div style={{
                marginTop: 20,
                padding: "8px 16px",
                background: "#fef3c7",
                borderRadius: 6,
                display: "inline-block"
              }}>
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#92400e"
                }}>
                  🔒 Password Protected
                </span>
              </div>
            </div>
          </Link>

          {/* Map 2 Card */}
          <Link href="/map2" style={{ textDecoration: "none" }}>
            <div style={{
              background: "white",
              borderRadius: 16,
              padding: 32,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
              cursor: "pointer",
              border: "2px solid transparent",
              height: "100%"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,106,142,0.2)";
              e.currentTarget.style.borderColor = "#006a8e";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
              e.currentTarget.style.borderColor = "transparent";
            }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                background: "linear-gradient(135deg, #006a8e 0%, #008bb3 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                fontSize: 32
              }}>
                📊
              </div>
              
              <h2 style={{
                margin: "0 0 12px 0",
                fontSize: 24,
                fontWeight: 700,
                color: "#006a8e"
              }}>
                Secondary Dashboard
              </h2>
              
              <p style={{
                margin: 0,
                fontSize: 15,
                color: "#64748b",
                lineHeight: 1.6
              }}>
                Additional property mapping and analytics dashboard for supplementary dataset visualization.
              </p>
              
              <div style={{
                marginTop: 20,
                padding: "8px 16px",
                background: "#fef3c7",
                borderRadius: 6,
                display: "inline-block"
              }}>
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#92400e"
                }}>
                  🔒 Password Protected
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div style={{
          marginTop: 48,
          padding: 32,
          background: "white",
          borderRadius: 16,
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{
            margin: "0 0 16px 0",
            fontSize: 20,
            fontWeight: 700,
            color: "#006a8e"
          }}>
            About This System
          </h3>
          <p style={{
            margin: 0,
            fontSize: 15,
            color: "#475569",
            lineHeight: 1.7
          }}>
            This property management system provides secure access to diocese property information including valuations, 
            site locations, building details, and comprehensive data analysis. Each dashboard is password protected 
            to ensure confidential information remains secure.
          </p>
        </div>
      </div>
    </div>
  );
}